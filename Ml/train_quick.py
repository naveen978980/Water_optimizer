from ultralytics import YOLO

# Load YOLOv8 nano model (fastest)
model = YOLO("yolov8n.pt")

# Quick training with optimized parameters
model.train(
    data="gauge/data.yaml",      # Use the water-meter dataset
    epochs=15,                    # Reduced epochs for quick training
    imgsz=416,                    # Smaller image size for faster training
    batch=16,                     # Batch size (auto-adjust if GPU memory limited)
    cache=True,                   # Cache images for faster training
    device='cpu',                 # Use CPU (no GPU available)
    patience=5,                   # Early stopping patience
    project="runs/detect",        # Save location
    name="gauge_quick",           # Experiment name
    pretrained=True,              # Use pretrained weights
    optimizer='Adam',             # Adam optimizer (often faster convergence)
    verbose=True,                 # Show training progress
    save=True,                    # Save best and last checkpoints
    plots=True                    # Generate training plots
)

print("\n" + "="*60)
print("Training Complete!")
print("="*60)
print(f"Best model saved at: runs/detect/gauge_quick/weights/best.pt")
print(f"Last model saved at: runs/detect/gauge_quick/weights/last.pt")
print("="*60)
