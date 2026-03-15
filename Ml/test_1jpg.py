from ultralytics import YOLO
import cv2
import pytesseract

# Set tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Load model
model = YOLO("runs/detect/train6/weights/best.pt")

# Test on 2.jpg
print("Testing on 2.jpg...")
img = cv2.imread("2.jpg")

if img is None:
    print("ERROR: Could not read 2.jpg")
else:
    print(f"Image loaded: {img.shape}")
    
    # Run detection
    results = model.predict(source="2.jpg", conf=0.1, verbose=False)
    result = results[0]
    
    if len(result.boxes) == 0:
        print("❌ No water detected in 2.jpg")
        print("The model was trained on specific gauge images and may not work on different types.")
    else:
        box = result.boxes[0]
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        conf = box.conf[0]
        print(f"✓ Water detected at Y: {y1}-{y2} (Confidence: {conf:.2f})")
        
        # Draw and save
        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(img, f"Water {conf:.2f}", (x1, y1-10), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        cv2.imwrite("2_result.jpg", img)
        print("✓ Result saved to 2_result.jpg")
