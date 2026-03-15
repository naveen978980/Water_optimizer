from ultralytics import YOLO
import cv2

# Load the trained model
model = YOLO("runs/detect/train6/weights/best.pt")

# Run prediction on an image
results = model.predict(
    source="gauge/valid/images/m_01_frame_04_jpg.rf.ab9dbeb716abb57dd4f9cc0de661b8fe.jpg",  # Test on validation image
    conf=0.1,  # Lower confidence threshold
    save=True,  # Save results to runs/detect/predict/
    show_labels=True,
    show_conf=True
)

# Print detection results
for result in results:
    boxes = result.boxes
    print(f"\nDetected {len(boxes)} objects:")
    
    for box in boxes:
        # Get box coordinates
        x1, y1, x2, y2 = box.xyxy[0]
        confidence = box.conf[0]
        class_id = box.cls[0]
        
        print(f"  - Class: {result.names[int(class_id)]}")
        print(f"    Confidence: {confidence:.2f}")
        print(f"    Box: ({x1:.0f}, {y1:.0f}) to ({x2:.0f}, {y2:.0f})")

print("\n✓ Results saved to runs/detect/predict/")
