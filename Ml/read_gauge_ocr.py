import cv2
import pytesseract
import numpy as np

# Set tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def read_gauge_ocr(image_path):
    """
    Read gauge using OCR only (no YOLO detection) - REFINED VERSION
    """
    print(f"\nReading gauge from: {image_path}")
    
    # Read image
    img = cv2.imread(image_path)
    
    if img is None:
        print(f"❌ Could not read {image_path}")
        return
    
    h, w = img.shape[:2]
    print(f"Image size: {w}x{h}")
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Enhance contrast
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)
    
    # Try OCR on different regions (left side where scale usually is)
    gauge_region = gray[:, :w//3]  # Left third of image
    
    # Multiple preprocessing attempts
    thresh1 = cv2.adaptiveThreshold(gauge_region, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    thresh2 = cv2.threshold(gauge_region, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    
    # OCR for numbers - try both thresholds
    config = "--psm 6 -c tessedit_char_whitelist=0123456789."
    ocr_text1 = pytesseract.image_to_string(thresh1, config=config)
    ocr_text2 = pytesseract.image_to_string(thresh2, config=config)
    
    print(f"\nOCR Text (Adaptive):\n{ocr_text1}")
    print(f"\nOCR Text (Otsu):\n{ocr_text2}")
    
    # Extract and filter numbers
    all_numbers = []
    for text in [ocr_text1, ocr_text2]:
        for line in text.split('\n'):
            for word in line.split():
                try:
                    num = float(word)
                    # Filter: reasonable gauge values (0-100m typical)
                    if 0 <= num <= 100:
                        all_numbers.append(num)
                except:
                    pass
    
    # Remove duplicates and sort
    numbers = sorted(set(all_numbers))
    
    if numbers:
        print(f"\n✓ Filtered gauge numbers: {numbers}")
        print(f"  Range: {min(numbers)} - {max(numbers)}m")
    else:
        print("\n⚠ No valid gauge numbers detected (0-100m range)")
        # Fallback: try full image with less strict filtering
        thresh_full = cv2.adaptiveThreshold(enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        ocr_full = pytesseract.image_to_string(thresh_full, config=config)
        temp_nums = []
        for word in ocr_full.split():
            try:
                num = float(word)
                if 0 <= num <= 1000:  # Wider range
                    temp_nums.append(num)
            except:
                pass
        if temp_nums:
            numbers = sorted(set(temp_nums))
            print(f"  Fallback detection: {numbers}")
    
    # Detect water line using edge detection
    edges = cv2.Canny(gray, 50, 150)
    
    # Look for strong horizontal lines
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=80, minLineLength=100, maxLineGap=15)
    
    water_y = None
    water_lines = []
    
    if lines is not None:
        # Collect all horizontal lines
        for line in lines:
            x1, y1, x2, y2 = line[0]
            if abs(y1 - y2) < 10:  # Nearly horizontal
                length = abs(x2 - x1)
                if length > 50:  # Significant length
                    water_lines.append((y1, length))
                    cv2.line(img, (x1, y1), (x2, y2), (0, 255, 0), 1)
        
        # Choose the most prominent horizontal line (often the water surface)
        if water_lines:
            # Sort by length and choose longest in bottom half
            water_lines.sort(key=lambda x: x[1], reverse=True)
            for y_pos, length in water_lines:
                if y_pos > h * 0.3:  # In bottom 70% of image
                    water_y = y_pos
                    cv2.line(img, (0, water_y), (w, water_y), (0, 0, 255), 3)
                    break
            
            if water_y is None and water_lines:
                water_y = water_lines[0][0]
                cv2.line(img, (0, water_y), (w, water_y), (0, 0, 255), 3)
    
    if water_y is not None:
        print(f"\n✓ Water line detected at Y={water_y} pixels")
        
        # Calculate level if we have gauge numbers
        if numbers:
            gauge_max = max(numbers)
            gauge_min = min(numbers)
            position_ratio = water_y / h
            water_level = gauge_max - (position_ratio * (gauge_max - gauge_min))
            
            print(f"📊 Estimated Water Level: {water_level:.2f}m")
            
            # Add text to image
            cv2.putText(img, f"Level: {water_level:.2f}m", (10, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 0, 255), 3)
    else:
        print("\n⚠ Could not detect water line")
    
    # Save results
    result_name = image_path.replace('.jpg', '_ocr_result.jpg')
    cv2.imwrite(result_name, img)
    cv2.imwrite("thresh_adaptive.jpg", thresh1)
    cv2.imwrite("thresh_otsu.jpg", thresh2)
    cv2.imwrite("edges_debug.jpg", edges)
    
    print(f"\n✓ Results saved to {result_name}")
    print("✓ Debug images: thresh_adaptive.jpg, thresh_otsu.jpg, edges_debug.jpg")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    else:
        image_path = "2.jpg"
    
    read_gauge_ocr(image_path)
