from ultralytics import YOLO
import cv2

# Load the trained model
model = YOLO("runs/detect/gauge_quick/weights/best.pt")

# Test images
test_images = ["1.jpg", "2.jpg", "gauge.jpg"]

print("="*60)
print("Testing Trained Gauge Detection Model")
print("="*60)

for img_path in test_images:
    print(f"\nTesting: {img_path}")
    print("-"*60)
    
    try:
        # Run prediction
        results = model.predict(
            source=img_path,
            conf=0.25,  # Confidence threshold
            save=True,  # Save result images
            project="runs/detect",
            name="test_gauge"
        )
        
        # Display results
        for result in results:
            boxes = result.boxes
            if len(boxes) > 0:
                print(f"✓ Detected {len(boxes)} gauge(s)!")
                for i, box in enumerate(boxes):
                    conf = box.conf[0].item()
                    cls = int(box.cls[0].item())
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    print(f"  Gauge {i+1}: Confidence={conf:.2%}")
                    print(f"           Box: [{int(x1)}, {int(y1)}, {int(x2)}, {int(y2)}]")
            else:
                print(f"✗ No gauges detected")
                
    except Exception as e:
        print(f"✗ Error: {str(e)}")

print("\n" + "="*60)
print("Detection complete! Results saved in runs/detect/test_gauge/")
print("="*60)
