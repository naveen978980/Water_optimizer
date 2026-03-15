import os
import boto3

s3 = boto3.client(
    "s3",
    aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
)

s3.upload_file(
    "1.jpg",
    "river-water-monitoring-images",
    "1.jpg"
)

print("Upload successful")