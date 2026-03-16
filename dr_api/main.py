from fastapi import FastAPI, UploadFile, File
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import io

app = FastAPI()

model = load_model("Models/densenet_dr_model.keras")

classes = [
    "Normal",
    "Mild",
    "Moderate",
    "Severe",
    "Proliferative DR"
]

IMG_SIZE = 224


def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((IMG_SIZE, IMG_SIZE))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image


@app.get("/")
def home():
    return {"message": "Diabetic Retinopathy Detection API is running"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    contents = await file.read()
    img = preprocess_image(contents)

    prediction = model.predict(img)

    class_id = int(np.argmax(prediction))
    confidence = float(np.max(prediction))

    return {
    "class_id": class_id,
    "class_name": classes[class_id],
    "confidence": confidence,
    "probabilities": prediction.tolist()
}