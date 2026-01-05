from ultralytics import YOLO
import cv2

model = YOLO("../runs/detect/train3/weights/best.pt")

img = cv2.imread("test.jpg")
if img is None:
    print("Image not found")
    exit()

results = model(img, conf=0.4)

for r in results:
    for box in r.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        label = model.names[int(box.cls)]

        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(
            img,
            label,
            (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 0),
            2,
        )
print("Trained classes:")
for k, v in model.names.items():
    print(k, "->", v)

cv2.imshow("Detection", img)
cv2.waitKey(0)
