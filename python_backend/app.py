from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import numpy as np
import pandas as pd
import base64
from io import BytesIO
from PIL import Image
import cv2
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import os

# ML imports
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# CNN imports
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array

# -------------------------------------------------------
# FLASK SETUP
# -------------------------------------------------------

app = Flask(__name__)
CORS(app)

# -------------------------------------------------------
# LOAD CNN MODEL
# -------------------------------------------------------

print("🔥 Loading CNN model...")
cnn_model = load_model("fire_cnn_model.h5")
IMG_SIZE = 224
print("✓ CNN model loaded")

# -------------------------------------------------------
# LOAD ML MODEL
# -------------------------------------------------------

print("🔥 Loading ML dataset...")
df = pd.read_csv("fire_detection/data/fire_prediction_final_dataset.csv")

def assign_fire_type(row):
    b, t, c, nd, lon = (
        row["brightness"],
        row["bright_t31"],
        row["confidence"],
        row["NDVI"],
        row["longitude"],
    )
    if 320 <= b <= 340 and 290 <= t <= 300 and c > 80:
        return "Static Fire"
    if 300 <= b <= 330 and lon < -60:
        return "Offshore Fire"
    if nd > 0.3 and b > 340:
        return "Vegetation Fire"
    if 0.1 < nd <= 0.35 and 330 <= b <= 360:
        return "Agricultural Fire"
    if nd <= 0.1 and b > 350 and c > 70:
        return "Urban Fire"
    if b > 350 and nd < 0.05:
        return "Lightning Fire"
    return "Other"

df["fire_type"] = df.apply(assign_fire_type, axis=1)

FEATURES = [
    "NDVI",
    "bright_t31",
    "brightness",
    "confidence",
    "temperature",
    "humidity",
    "wind_speed",
]

df = df.dropna(subset=FEATURES)

X = df[FEATURES]
y = df["fire_type"]

le = LabelEncoder()
y = le.fit_transform(y)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42
)

ML_MODEL = RandomForestClassifier(random_state=42)
ML_MODEL.fit(X_train, y_train)
print("✓ ML model trained")

# -------------------------------------------------------
# HELPER FUNCTIONS
# -------------------------------------------------------

def base64_to_image(base64_string):
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    return Image.open(BytesIO(base64.b64decode(base64_string))).convert("RGB")

def calculate_fire_risk(image, fire_prob):
    img = np.array(image.resize((224, 224)))
    r, g, b = img[:, :, 0], img[:, :, 1], img[:, :, 2]
    flame = (r > 200) & (g < 120)
    smoke = (abs(r - g) < 20) & (r > 150)
    return min(100, round(fire_prob * 60 + flame.mean() * 30 + smoke.mean() * 10))

def predict_fire_cause(image):
    img = np.array(image.resize((224, 224)))
    r, g, b = img[:, :, 0], img[:, :, 1], img[:, :, 2]
    scores = {
        "Electrical Fire": 40 if np.mean((r > 200) & (g < 120)) > 0.35 else 0,
        "Gas Leakage Fire": 50 if np.mean((b > 200) & (r < 150)) > 0.05 else 0,
        "Wildfire (Forest Fire)": 40 if np.mean((g > 150) & (r < 120)) > 0.05 else 0,
        "Vehicle Fire": 30 if np.mean(abs(r - g) < 20) > 0.35 else 0,
        "Cooking Fire": 30 if np.mean((b > 200) & (r < 150)) > 0.03 else 0,
        "Other Fire": 10,
    }
    cause = max(scores, key=scores.get)
    conf = int(scores[cause] / sum(scores.values()) * 100)
    return cause, conf

# -------------------------------------------------------
# FAST AI EXPLANATION (NO LLM)
# -------------------------------------------------------

BASE_EXPLANATIONS = {
    "Vegetation Fire": "Fire detected in a vegetation-rich area.",
    "Urban Fire": "Fire detected in a built-up urban environment.",
    "Agricultural Fire": "Fire associated with agricultural land.",
    "Offshore Fire": "Fire detected near offshore infrastructure.",
    "Lightning Fire": "Fire likely caused by natural ignition.",
    "Static Fire": "Stationary heat source detected.",
    "Other": "Fire type could not be clearly classified."
}

def generate_dynamic_explanation(fire_type, d):
    reasons = []

    if d["ndvi"] > 0.3:
        reasons.append("Vegetation density provided fuel.")
    if d["brightness"] > 350:
        reasons.append("High brightness indicates intense burning.")
    if d["humidity"] < 30:
        reasons.append("Low humidity increased ignition risk.")
    if d["windSpeed"] > 10:
        reasons.append("Strong winds accelerated fire spread.")

    return f"""
Cause:
{BASE_EXPLANATIONS.get(fire_type)}

Reason:
{' '.join(reasons)}

Safety Actions:
1. Evacuate nearby regions.
2. Deploy emergency response teams immediately.
"""

# -------------------------------------------------------
# API ENDPOINTS
# -------------------------------------------------------

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "time": datetime.now().isoformat()})

# ---------------- ML PREDICTION ----------------

@app.route("/predict/ml", methods=["POST"])
def predict_ml():
    d = request.get_json()

    inp = np.array([[ 
        d.get("ndvi", 0),
        d.get("t31", 290),
        d.get("brightness", 300),
        d.get("confidence", 80),
        d.get("temperature", 25),
        d.get("humidity", 50),
        d.get("windSpeed", 5),
    ]])

    inp_scaled = scaler.transform(inp)

    pred = ML_MODEL.predict(inp_scaled)[0]
    fire_type = le.inverse_transform([pred])[0]
    conf = float(np.max(ML_MODEL.predict_proba(inp_scaled)) * 100)

    return jsonify({
        "success": True,
        "prediction": fire_type,
        "confidence": conf,
        "aiAnalysis": "Click history to view AI explanation."
    })

# ---------------- AI EXPLANATION ----------------

@app.route("/explain/fire", methods=["POST"])
def explain_fire():
    d = request.get_json()
    explanation = generate_dynamic_explanation(d["prediction"], d)

    return jsonify({
        "success": True,
        "aiExplanation": explanation
    })

# ---------------- CNN IMAGE ----------------

@app.route("/predict/cnn", methods=["POST"])
def predict_cnn():
    img = base64_to_image(request.get_json()["image"])
    arr = img_to_array(img.resize((IMG_SIZE, IMG_SIZE))) / 255.0
    arr = np.expand_dims(arr, 0)

    result = cnn_model.predict(arr)[0][0]
    fire_prob = 1 - result

    res = {
        "success": True,
        "label": "Fire" if result < 0.5 else "No Fire",
        "fireProbability": float(fire_prob)
    }

    if result < 0.5:
        res["dangerScore"] = calculate_fire_risk(img, fire_prob)
        res["cause"], res["confidence"] = predict_fire_cause(img)

    return jsonify(res)

# ---------------- CCTV ----------------
@app.route("/predict/cctv", methods=["POST"])
def predict_cctv():
    data = request.get_json()
    stream_url = data.get("streamUrl")

    if not stream_url:
        return jsonify({"success": False, "error": "Stream URL required"}), 400

    # 1️⃣ Capture frame from CCTV
    cap = cv2.VideoCapture(stream_url)
    ret, frame = cap.read()
    cap.release()

    if not ret:
        return jsonify({"success": False, "error": "Unable to read CCTV stream"}), 500

    # 2️⃣ Convert OpenCV → PIL
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    img = Image.fromarray(frame_rgb)

    # 3️⃣ CNN preprocessing
    arr = img.resize((IMG_SIZE, IMG_SIZE))
    arr = img_to_array(arr) / 255.0
    arr = np.expand_dims(arr, axis=0)

    # 4️⃣ CNN prediction
    result = cnn_model.predict(arr)[0][0]
    fire_prob = 1 - result

    response = {
        "success": True,
        "label": "Fire" if result < 0.5 else "No Fire",
        "fireProbability": float(fire_prob),
        "source": "CCTV Stream"
    }

    # 5️⃣ Fire intelligence
    if result < 0.5:
        response["dangerScore"] = calculate_fire_risk(img, fire_prob)
        response["cause"], response["confidence"] = predict_fire_cause(img)

    return jsonify(response)




# ---------------- PDF DOWNLOAD (FIXED) ----------------

@app.route("/download/report", methods=["POST"])
def download_report():
    data = request.get_json()
    records = data.get("records", [])

    if not records:
        return jsonify({"success": False, "message": "No data found"}), 400

    file_path = "fire_report.pdf"
    pdf = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4

    y = height - 40
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(40, y, "Fire Prediction Report")
    y -= 30

    pdf.setFont("Helvetica", 10)
    for r in records:
        if y < 120:
            pdf.showPage()
            y = height - 40

        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawString(40, y, f"Date & Time: {r['createdAt']}")
        y -= 15

        pdf.setFont("Helvetica", 10)
        pdf.drawString(40, y, f"Fire Type: {r['prediction']}")
        y -= 15
        pdf.drawString(40, y, f"NDVI: {r['ndvi']}")
        y -= 15
        pdf.drawString(40, y, f"Brightness: {r['brightness']}")
        y -= 15
        pdf.drawString(40, y, f"Temperature: {r['temperature']} °C")
        y -= 15
        pdf.drawString(40, y, f"Humidity: {r['humidity']} %")
        y -= 15
        pdf.drawString(40, y, f"Wind Speed: {r['windSpeed']} m/s")
        y -= 15

        pdf.drawString(40, y, "-" * 70)
        y -= 20


    pdf.save()

    return send_file(
        file_path,
        as_attachment=True,
        download_name="fire_report.pdf",
        mimetype="application/pdf"
    )

# -------------------------------------------------------
# RUN SERVER
# -------------------------------------------------------

if __name__ == "__main__":
    print("\n🔥 FireVision Backend Running")
    print("→ http://localhost:5001")
    print(" POST /predict/ml")
    print(" POST /explain/fire")
    print(" POST /predict/cnn")
    print(" POST /download/report")
    print(" GET  /health\n")
    app.run(host="0.0.0.0", port=5001, debug=True)
