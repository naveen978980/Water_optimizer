from ultralytics import YOLO
import cv2
import pytesseract
import numpy as np

# Set tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Load your trained YOLO model
model = YOLO("runs/detect/train6/weights/best.pt")

def read_gauge(image_path):
    """
    Detect water level using YOLO and read gauge numbers using OCR
    """
    # Read image
    img = cv2.imread(image_path)
    original_img = img.copy()
    h, w = img.shape[:2]
    
    # Run YOLO detection
    results = model.predict(
        source=image_path,
        conf=0.1,
        verbose=False
    )
    
    # Get detection results
    result = results[0]
    
    if len(result.boxes) == 0:
        print("❌ No water detected!")
        return None
    
    # Get water bounding box
    box = result.boxes[0]
    x1, y1, x2, y2 = map(int, box.xyxy[0])
    confidence = box.conf[0]
    
    print(f"✓ Water detected at Y: {y1}-{y2} (Confidence: {confidence:.2f})")
    
    # Draw water detection
    cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
    cv2.putText(img, f"Water {confidence:.2f}", (x1, y1-10), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    
    # Water level position (use top of water box)
    water_top_y = y1
    
    # --- OCR: Read gauge numbers ---
    # Convert to grayscale for OCR
    gray = cv2.cvtColor(original_img, cv2.COLOR_BGR2GRAY)
    
    # Try to read numbers from left side of gauge (where scale usually is)
    gauge_region = gray[:, :w//2]  # Left half of image
    
    # Preprocess for OCR
    thresh = cv2.adaptiveThreshold(
        gauge_region, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        11, 2
    )
    
    # OCR config for numbers
    config = "--psm 6 -c tessedit_char_whitelist=0123456789."
    ocr_text = pytesseract.image_to_string(thresh, config=config)
    
    # Extract numbers
    numbers = [float(n) for n in ocr_text.split() if n.replace('.','').isdigit()]
    
    if numbers:
        print(f"✓ Detected gauge numbers: {numbers}")
        
        # Simple interpolation: assume linear scale
        # If we know gauge range (e.g., 0-10m), we can calculate exact reading
        gauge_height = h
        gauge_min = min(numbers) if numbers else 0
        gauge_max = max(numbers) if numbers else 10
        
        # Calculate water level based on position
        # Assuming gauge goes from bottom (max) to top (min)
        position_ratio = water_top_y / gauge_height
        water_level = gauge_max - (position_ratio * (gauge_max - gauge_min))
        
        print(f"📊 Estimated Water Level: {water_level:.2f}m")
        
        # Add text to image
        cv2.putText(img, f"Level: {water_level:.2f}m", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    else:
        print("⚠ Could not read gauge numbers via OCR")
        print(f"📍 Water detected at pixel Y={water_top_y} (0=top, {h}=bottom)")
    
    # Save result
    cv2.imwrite("gauge_result.jpg", img)
    print("\n✓ Result saved to gauge_result.jpg")

# Run on test image
if __name__ == "__main__":
    import sys
    
    # Get image path from command line or use default
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    else:
        # Use 2.jpg by default
        image_path = "2.jpg"
    
    print(f"Reading gauge from: {image_path}\n")
    read_gauge(image_path)
