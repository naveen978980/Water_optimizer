from ultralytics import YOLO
import cv2
import pytesseract
import numpy as np

# Set tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Load YOLO model
model = YOLO("runs/detect/train6/weights/best.pt")

def read_gauge_hybrid(image_path):
    """
    HYBRID APPROACH:
    1. Use YOLO to detect water area
    2. Extract gauge scale region (separate from water)
    3. Use OCR to read scale numbers
    4. Calculate water level based on position
    """
    print(f"\n{'='*60}")
    print(f"HYBRID GAUGE READER - Water Detection + OCR")
    print(f"{'='*60}")
    print(f"\nProcessing: {image_path}\n")
    
    # Read image
    img = cv2.imread(image_path)
    if img is None:
        print(f"❌ Could not read {image_path}")
        return None
    
    h, w = img.shape[:2]
    print(f"Image size: {w}x{h}")
    
    # STEP 1: Detect water using YOLO
    print("\n[STEP 1] Detecting water with YOLO...")
    results = model.predict(source=image_path, conf=0.1, verbose=False)
    result = results[0]
    
    water_detected = False
    water_top_y = None
    water_bottom_y = None
    
    if len(result.boxes) > 0:
        box = result.boxes[0]
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        confidence = box.conf[0]
        
        water_top_y = y1
        water_bottom_y = y2
        water_detected = True
        
        print(f"✓ Water detected!")
        print(f"  Confidence: {confidence:.2%}")
        print(f"  Position: Y {y1} to {y2} (top to bottom)")
        print(f"  Water level at: {(y1/h)*100:.1f}% from top")
        
        # Draw water detection
        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 3)
        cv2.putText(img, f"Water {confidence:.2f}", (x1, y1-10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    else:
        print("⚠ No water detected by YOLO")
        print("  Falling back to OCR-only approach...")
    
    # STEP 2: Extract gauge scale region (avoid water area)
    print("\n[STEP 2] Extracting gauge scale region...")
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Focus on left side where gauge numbers typically are
    # Avoid the water region if detected
    if water_detected and water_top_y > 50:
        # Read scale from above water line
        scale_region = gray[:water_top_y, :w//3]
        print(f"  Reading scale above water (Y: 0 to {water_top_y})")
    else:
        # Read from left side
        scale_region = gray[:, :w//3]
        print(f"  Reading scale from left side")
    
    # STEP 3: OCR on gauge scale
    print("\n[STEP 3] Reading scale numbers with OCR...")
    
    # Preprocess for better OCR
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(scale_region)
    
    # Multiple thresholding methods
    thresh_adaptive = cv2.adaptiveThreshold(
        enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY, 11, 2
    )
    _, thresh_otsu = cv2.threshold(
        enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )
    
    # OCR configuration for numbers
    config = "--psm 6 -c tessedit_char_whitelist=0123456789."
    
    # Try both preprocessing methods
    ocr_text1 = pytesseract.image_to_string(thresh_adaptive, config=config)
    ocr_text2 = pytesseract.image_to_string(thresh_otsu, config=config)
    
    print(f"\nOCR Output (Adaptive): {ocr_text1.strip()}")
    print(f"OCR Output (Otsu): {ocr_text2.strip()}")
    
    # Extract and filter numbers
    all_numbers = []
    for text in [ocr_text1, ocr_text2]:
        for word in text.split():
            try:
                num = float(word)
                # Filter reasonable gauge values (0-50m typical for water gauges)
                if 0 <= num <= 50:
                    all_numbers.append(num)
            except:
                pass
    
    # Remove duplicates and sort
    gauge_numbers = sorted(set(all_numbers))
    
    if gauge_numbers:
        print(f"\n✓ Valid gauge markings: {gauge_numbers}")
        print(f"  Gauge range: {min(gauge_numbers)}m - {max(gauge_numbers)}m")
    else:
        print(f"\n⚠ No valid gauge numbers found")
        gauge_numbers = []
    
    # STEP 4: Calculate water level
    print("\n[STEP 4] Calculating water level...")
    
    water_level = None
    
    if water_detected and gauge_numbers:
        gauge_min = min(gauge_numbers)
        gauge_max = max(gauge_numbers)
        
        # Calculate position ratio (assuming scale goes top to bottom)
        position_ratio = water_top_y / h
        
        # Linear interpolation: gauge max at top, min at bottom
        # (adjust if your gauge is oriented differently)
        water_level = gauge_max - (position_ratio * (gauge_max - gauge_min))
        
        print(f"✓ Water Level: {water_level:.2f}m")
        print(f"  Based on: Water at {position_ratio*100:.1f}% of image height")
        print(f"  Scale range: {gauge_min}m to {gauge_max}m")
        
        # Draw result on image
        cv2.line(img, (0, water_top_y), (w, water_top_y), (0, 0, 255), 4)
        cv2.putText(img, f"Water Level: {water_level:.2f}m", (20, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 3)
        
    elif water_detected and not gauge_numbers:
        print(f"⚠ Water detected but no gauge scale found")
        print(f"  Water position: {water_top_y} pixels from top ({(water_top_y/h)*100:.1f}%)")
        
        cv2.line(img, (0, water_top_y), (w, water_top_y), (0, 0, 255), 4)
        cv2.putText(img, f"Water at Y={water_top_y}px", (20, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 3)
        
    elif not water_detected and gauge_numbers:
        print(f"⚠ Gauge scale found but no water detected by YOLO")
        print(f"  Scale range: {min(gauge_numbers)}m to {max(gauge_numbers)}m")
    else:
        print(f"❌ Could not detect water or gauge scale")
    
    # Save results
    result_name = image_path.replace('.jpg', '_hybrid_result.jpg')
    cv2.imwrite(result_name, img)
    cv2.imwrite("scale_adaptive.jpg", thresh_adaptive)
    cv2.imwrite("scale_otsu.jpg", thresh_otsu)
    
    print(f"\n{'='*60}")
    print(f"✓ Result saved to: {result_name}")
    print(f"✓ Debug images: scale_adaptive.jpg, scale_otsu.jpg")
    print(f"{'='*60}\n")
    
    return {
        'water_detected': water_detected,
        'water_level': water_level,
        'gauge_numbers': gauge_numbers,
        'water_position_y': water_top_y
    }

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    else:
        image_path = "2.jpg"
    
    result = read_gauge_hybrid(image_path)
