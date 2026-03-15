import json
import base64
import boto3
import os
import tempfile
from datetime import datetime

# Initialize AWS clients
s3_client = boto3.client('s3')
sns_client = boto3.client('sns')

# Environment variables
BUCKET_NAME = os.environ.get('BUCKET_NAME', 'your-bucket-name')
SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN', 'your-sns-topic-arn')
HIGH_WATER_THRESHOLD = float(os.environ.get('HIGH_WATER_THRESHOLD', '5.0'))

# Import ML model functions
# Note: You'll need to package the ML model and dependencies with Lambda
try:
    from read_gauge_complete import read_gauge_from_detection
except ImportError:
    # Fallback for testing
    def read_gauge_from_detection(image_path):
        """Fallback function when ML model is not available"""
        print("WARNING: Using fallback gauge reading function")
        return {
            'water_level': 5.5,
            'gauge_position': 0.75,
            'scale_min': 0,
            'scale_max': 10,
            'unit': 'm'
        }

def lambda_handler(event, context):
    """
    Lambda function to process gauge images, run ML model, and send SNS alerts
    """
    
    # Handle CORS preflight
    if event.get('requestContext', {}).get('http', {}).get('method') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': ''
        }
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        image_base64 = body.get('image')
        filename = body.get('filename', f'gauge_{datetime.now().strftime("%Y%m%d_%H%M%S")}.jpg')
        folder = body.get('folder', 'g')
        
        if not image_base64:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({'error': 'No image provided'})
            }
        
        # Remove data URL prefix if present
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        # Decode base64 image
        image_data = base64.b64decode(image_base64)
        
        # Upload to S3
        s3_key = f"{folder}/{filename}"
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=s3_key,
            Body=image_data,
            ContentType='image/jpeg'
        )
        
        print(f"Image uploaded to S3: s3://{BUCKET_NAME}/{s3_key}")
        
        # Save image temporarily for ML processing
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            temp_file.write(image_data)
            temp_image_path = temp_file.name
        
        try:
            # Run ML model to read gauge
            gauge_reading = read_gauge_from_detection(temp_image_path)
            
            # Handle both old format (float) and new format (dict) for backward compatibility
            if isinstance(gauge_reading, dict):
                water_level = gauge_reading['water_level']
                gauge_position = gauge_reading['gauge_position']
                scale_min = gauge_reading['scale_min']
                scale_max = gauge_reading['scale_max']
                print(f"Water level detected: {water_level}m (gauge position: {gauge_position})")
            else:
                # Old format - just a float
                water_level = gauge_reading
                gauge_position = None
                scale_min = 0
                scale_max = 10
                print(f"Water level detected: {water_level}m")
            
            # Check if alert needed
            alert_sent = False
            if water_level >= HIGH_WATER_THRESHOLD:
                # Send SNS alert
                message = f"""
⚠️ HIGH WATER LEVEL ALERT ⚠️

Current Water Level: {water_level}m
Threshold: {HIGH_WATER_THRESHOLD}m
Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
Location: Gauge Image Upload

Immediate attention required!
"""
                
                sns_response = sns_client.publish(
                    TopicArn=SNS_TOPIC_ARN,
                    Subject='🚨 High Water Level Alert',
                    Message=message
                )
                
                alert_sent = True
                print(f"SNS Alert sent: {sns_response['MessageId']}")
            
            # Clean up temp file
            os.unlink(temp_image_path)
            
            # Return success response with gauge position
            response_data = {
                'message': 'Gauge reading complete',
                's3_url': f"s3://{BUCKET_NAME}/{s3_key}",
                'water_level': round(water_level, 2),
                'unit': 'meters',
                'alert_sent': alert_sent,
                'status': 'high' if water_level >= HIGH_WATER_THRESHOLD else 'normal'
            }
            
            # Add gauge position if available
            if gauge_position is not None:
                response_data['gauge_position'] = gauge_position  # 0-1 range (e.g., 0.93)
                response_data['scale_min'] = scale_min
                response_data['scale_max'] = scale_max
            
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps(response_data)
            }
            
        except Exception as ml_error:
            # Clean up temp file even if ML processing fails
            if os.path.exists(temp_image_path):
                os.unlink(temp_image_path)
            raise ml_error
            
    except Exception as e:
        print(f"Error processing gauge image: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'error': str(e),
                'message': 'Failed to process gauge image'
            })
        }
