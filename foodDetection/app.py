from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os

# Use local best.pt for Docker deployment, fallback to dev path
MODEL_PATH = os.environ.get("MODEL_PATH", "best.pt")
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = "../runs/detect/train3/weights/best.pt"

model = YOLO(MODEL_PATH)

@app.post("/detect")
async def detect_food(file: UploadFile = File(...)):
    img_bytes = await file.read()
    img_np = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)

    results = model(img, conf=0.10)

    food_counts = {}
    for r in results:
        for box in r.boxes:
            class_name = model.names[int(box.cls)]
            food_counts[class_name] = food_counts.get(class_name, 0) + 1

    return { "detected_food_counts": food_counts }
