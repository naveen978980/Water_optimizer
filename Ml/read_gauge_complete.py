from ultralytics import YOLO
import cv2
import numpy as np
import pytesseract
import sys
import re

# Configure Tesseract path
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def read_gauge_from_detection(image_path):
    """
    Complete gauge reading pipeline:
    1. Detect gauge with YOLO
    2. Extract gauge region
    3. Apply OCR to read numbers
    4. Calculate water level
    """
    print("="*70)
    print(f"Processing: {image_path}")
    print("="*70)
    
    # Load trained model
    model = YOLO("runs/detect/gauge_quick/weights/best.pt")
    
    # Load image
    img = cv2.imread(image_path)
    if img is None:
        print(f"Error: Cannot read image {image_path}")
        return None
    
    # Step 1: Detect gauge
    print("\n[Step 1] Detecting gauge...")
    results = model.predict(source=image_path, conf=0.25, verbose=False)
    
    gauge_detected = False
    best_box = None
    best_conf = 0
    
    for result in results:
        boxes = result.boxes
        if len(boxes) > 0:
            # Get the detection with highest confidence
            for box in boxes:
                conf = box.conf[0].item()
                if conf > best_conf:
                    best_conf = conf
                    best_box = box.xyxy[0].tolist()
                    gauge_detected = True
    
    if not gauge_detected:
        print("✗ No gauge detected. Trying OCR on full image...")
        gauge_region = img
    else:
        x1, y1, x2, y2 = map(int, best_box)
        print(f"✓ Gauge detected! Confidence: {best_conf:.2%}")
        print(f"  Location: [{x1}, {y1}, {x2}, {y2}]")
        
        # Extract gauge region with margin
        margin = 20
        x1 = max(0, x1 - margin)
        y1 = max(0, y1 - margin)
        x2 = min(img.shape[1], x2 + margin)
        y2 = min(img.shape[0], y2 + margin)
        
        gauge_region = img[y1:y2, x1:x2]
    
    # Step 2: Preprocess and OCR
    print("\n[Step 2] Reading gauge numbers with OCR...")
    
    # Convert to grayscale
    gray = cv2.cvtColor(gauge_region, cv2.COLOR_BGR2GRAY)
    
    # Try multiple preprocessing methods
    methods = [
        ("Adaptive Threshold", cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                                      cv2.THRESH_BINARY, 11, 2)),
        ("Otsu Threshold", cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]),
        ("Original Gray", gray)
    ]
    
    all_numbers = []
    
    for method_name, processed in methods:
        # OCR configuration for numbers
        custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789.m'
        text = pytesseract.image_to_string(processed, config=custom_config)
        
        # Extract numbers
        numbers = re.findall(r'\d+\.?\d*', text)
        numbers = [float(n) for n in numbers if len(n) > 0]
        
        # Filter reasonable gauge readings (0-100 meters)
        valid_numbers = [n for n in numbers if 0 <= n <= 100]
        
        if valid_numbers:
            all_numbers.extend(valid_numbers)
            print(f"  {method_name}: {valid_numbers}")
    
    # Step 3: Detect water line using edge detection
    print("\n[Step 3] Detecting water line...")
    
    edges = cv2.Canny(gray, 50, 150)
    horizontal_edges = np.sum(edges, axis=1)
    
    if len(horizontal_edges) > 0:
        peak_idx = np.argmax(horizontal_edges)
        water_line_y = peak_idx
        print(f"✓ Water line detected at Y={water_line_y}")
    else:
        water_line_y = gray.shape[0] // 2
        print(f"⚠ Using middle of image as water line: Y={water_line_y}")
    
    # Step 4: Calculate water level
    print("\n[Step 4] Calculating water level...")
    
    if all_numbers:
        # Remove duplicates and sort
        unique_numbers = sorted(set(all_numbers))
        print(f"  Detected scale numbers: {unique_numbers}")
        
        if len(unique_numbers) >= 2:
            min_val = min(unique_numbers)
            max_val = max(unique_numbers)
            gauge_height = gray.shape[0]
            
            # Estimate water level based on position
            relative_position = water_line_y / gauge_height
            estimated_level = max_val - (relative_position * (max_val - min_val))
            
            print(f"\n{'='*70}")
            print(f"WATER LEVEL READING")
            print(f"{'='*70}")
            print(f"  Scale Range: {min_val}m - {max_val}m")
            print(f"  Water Line Position: {relative_position:.1%} from top ({relative_position:.2f})")
            print(f"  Estimated Water Level: {estimated_level:.2f}m")
            print(f"{'='*70}")
            
            # Return detailed information
            return {
                'water_level': estimated_level,
                'gauge_position': round(relative_position, 2),  # 0-1 range (e.g., 0.93)
                'scale_min': min_val,
                'scale_max': max_val,
                'unit': 'm'
            }
        else:
            print(f"  Only one number detected: {unique_numbers[0]}m")
            return {
                'water_level': unique_numbers[0],
                'gauge_position': 0.5,  # Default to middle
                'scale_min': 0,
                'scale_max': unique_numbers[0] * 2,
                'unit': 'm'
            }
    else:
        print("✗ No valid numbers detected")
        return None

if __name__ == "__main__":
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    else:
        image_path = "2.jpg"
    
    result = read_gauge_from_detection(image_path)
    
    if result:
        print(f"\n✓ Successfully read gauge:")
        print(f"   Water Level: {result['water_level']:.2f}{result['unit']}")
        print(f"   Gauge Position: {result['gauge_position']} ({result['gauge_position']*100:.1f}%)")
        print(f"   Scale Range: {result['scale_min']}-{result['scale_max']}{result['unit']}")
    else:
        print(f"\n✗ Failed to read gauge")
