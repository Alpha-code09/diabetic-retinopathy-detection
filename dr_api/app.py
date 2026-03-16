from fastapi import FastAPI, UploadFile, File
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import io

app = FastAPI()

models = {
    "densenet_finetuned": load_model("models/DenseNet121_finetuned.keras"),
    "densenet_base": load_model("models/densenet_dr_model.keras"),
    "resnet50": load_model("models/resnet50_frozen_phase.keras")
}

classes = [
    "Normal",
    "Mild",
    "Moderate",
    "Severe",
    "Proliferative DR"
]

def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((224, 224))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)
    return image

@app.post("/predict/{model_name}")
async def predict(model_name: str, file: UploadFile = File(...)):

    if model_name not in models:
        return {"error": "Model not found"}

    contents = await file.read()
    img = preprocess_image(contents)

    prediction = models[model_name].predict(img)

    class_id = int(np.argmax(prediction))
    confidence = float(np.max(prediction))

    return {
        "model": model_name,
        "class_id": class_id,
        "class_name": classes[class_id],
        "confidence": confidence
    }


@app.post("/predict_all")
async def predict_all(file: UploadFile = File(...)):

    contents = await file.read()
    img = preprocess_image(contents)

    results = {}

    for name, model in models.items():

        prediction = model.predict(img)

        class_id = int(np.argmax(prediction))
        confidence = float(np.max(prediction))

        results[name] = {
            "class_id": class_id,
            "class_name": classes[class_id],
            "confidence": confidence
        }

    return results


