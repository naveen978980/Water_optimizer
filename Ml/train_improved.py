from ultralytics import YOLO

# Load YOLOv8 nano model
model = YOLO("yolov8n.pt")

# Extended training for higher confidence
model.train(
    data="gauge/data.yaml",      # Use the water-meter dataset
    epochs=50,                    # Increased to 50 epochs for better confidence
    imgsz=640,                    # Increased from 416 to 640 for better accuracy
    batch=8,                      # Reduced batch for better learning
    cache=True,                   # Cache images for faster training
    device='cpu',                 # Use CPU
    patience=10,                  # Increased patience for early stopping
    project="runs/detect",        # Save location
    name="gauge_improved",        # New experiment name
    pretrained=True,              # Use pretrained weights
    optimizer='AdamW',            # AdamW optimizer (better than Adam)
    lr0=0.001,                    # Lower initial learning rate
    lrf=0.01,                     # Final learning rate
    warmup_epochs=5,              # More warmup epochs
    cos_lr=True,                  # Cosine learning rate scheduler
    verbose=True,                 # Show training progress
    save=True,                    # Save best and last checkpoints
    plots=True,                   # Generate training plots
    augment=True,                 # Enable data augmentation
    hsv_h=0.015,                  # HSV-Hue augmentation
    hsv_s=0.7,                    # HSV-Saturation augmentation
    hsv_v=0.4,                    # HSV-Value augmentation
    degrees=10.0,                 # Rotation augmentation
    translate=0.1,                # Translation augmentation
    scale=0.5,                    # Scaling augmentation
    fliplr=0.5                    # Horizontal flip augmentation
)

print("\n" + "="*60)
print("Training Complete!")
print("="*60)
print(f"Best model saved at: runs/detect/gauge_improved/weights/best.pt")
print(f"Last model saved at: runs/detect/gauge_improved/weights/last.pt")
print("="*60)
