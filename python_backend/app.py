# python_backend/app.py
# Python API Server for ML/CNN Models

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import cv2

# ML imports
from sklearn.preprocessing import StandardScaler, LabelEncoder
import pickle

# CNN imports
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# -------------------------------------------------------
# LOAD MODELS (Load once when server starts)
# -------------------------------------------------------

# Load CNN Model
print("Loading CNN model...")
cnn_model = load_model("fire_cnn_model.h5")
IMG_SIZE = 224
print("✓ CNN model loaded")

# Load ML Model Components
print("Loading ML model...")
# Assuming you saved your trained model and scaler
# ml_model = pickle.load(open('ml_fire_model.pkl', 'rb'))
# scaler = pickle.load(open('scaler.pkl', 'rb'))
# label_encoder = pickle.load(open('label_encoder.pkl', 'rb'))

# For now, we'll recreate it (replace with loading saved model)
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

df = pd.read_csv("fire_detection/data/fire_prediction_final_dataset.csv")

def assign_fire_type(row):
    b, t, c, nd, lon = row["brightness"], row["bright_t31"], row["confidence"], row["NDVI"], row["longitude"]
    if 320<=b<=340 and 290<=t<=300 and c>80: return "Static Fire"
    if 300<=b<=330 and lon<-60: return "Offshore Fire"
    if nd>0.3 and b>340: return "Vegetation Fire"
    if 0.1<nd<=0.35 and 330<=b<=360: return "Agricultural Fire"
    if nd<=0.1 and b>350 and c>70: return "Urban Fire"
    if b>350 and nd<0.05: return "Lightning Fire"
    return "Other"

df["fire_type"] = df.apply(assign_fire_type, axis=1)
features = ["NDVI","bright_t31","brightness","confidence","temperature","humidity","wind_speed"]
df = df.dropna(subset=features)

X = df[features]
y = df["fire_type"]

label_encoder = LabelEncoder()
y = label_encoder.fit_transform(y)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2)

ml_model = RandomForestClassifier()
ml_model.fit(X_train, y_train)
print("✓ ML model loaded")


# -------------------------------------------------------
# HELPER FUNCTIONS
# -------------------------------------------------------

def base64_to_image(base64_string):
    """Convert base64 string to PIL Image"""
    # Remove data URL prefix if present
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    image_data = base64.b64decode(base64_string)
    image = Image.open(BytesIO(image_data)).convert('RGB')
    return image


def calculate_fire_risk(image, fire_prob):
    """Calculate fire danger score"""
    img = np.array(image.resize((224, 224)))
    r, g, b = img[:,:,0], img[:,:,1], img[:,:,2]

    flame_mask = (r > 200) & (g < 120) & (b < 120)
    smoke_mask = (abs(r-g) < 20) & (abs(g-b) < 20) & (r > 150)

    flame_int = np.sum(flame_mask) / (224*224)
    smoke_int = np.sum(smoke_mask) / (224*224)

    score = fire_prob*60 + flame_int*30 + smoke_int*10
    return min(100, max(0, round(score)))


def predict_fire_cause(image):
    """Predict fire cause from image"""
    img = np.array(image.resize((224, 224)))
    r, g, b = img[:,:,0], img[:,:,1], img[:,:,2]

    flame = np.sum((r>200)&(g<120))/(224*224)
    smoke = np.sum((abs(r-g)<20)&(r>150))/(224*224)
    bluef = np.sum((b>200)&(r<150))/(224*224)
    veg   = np.sum((g>150)&(r<120))/(224*224)

    scores = {
        "Electrical Fire": 40 if flame>0.35 else 0,
        "Gas Leakage Fire": 50 if bluef>0.05 else 0,
        "Wildfire (Forest Fire)": 40 if veg>0.05 else 0,
        "Vehicle Fire": 30 if smoke>0.35 else 0,
        "Cooking Fire": 30 if bluef>0.03 else 0,
        "Other Fire": 10
    }
    cause = max(scores, key=scores.get)
    confidence = int((scores[cause]/sum(scores.values()))*100)
    return cause, confidence


# -------------------------------------------------------
# API ENDPOINTS
# -------------------------------------------------------

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'models_loaded': {
            'cnn': True,
            'ml': True
        }
    })


@app.route('/predict/cnn', methods=['POST'])
def predict_cnn():
    """
    CNN Fire Detection from Image
    
    Request body:
    {
        "image": "base64_encoded_image_string"
    }
    
    Response:
    {
        "success": true,
        "label": "Fire" | "No Fire",
        "fireProbability": 0.85,
        "rawOutput": 0.15,
        "dangerScore": 75,
        "cause": "Electrical Fire",
        "confidence": 82
    }
    """
    try:
        data = request.get_json()
        
        if 'image' not in data:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        # Convert base64 to image
        image = base64_to_image(data['image'])
        
        # Prepare image for CNN
        arr = img_to_array(image.resize((IMG_SIZE, IMG_SIZE))) / 255.0
        arr = np.expand_dims(arr, 0)
        
        # Predict with CNN
        result = cnn_model.predict(arr)[0][0]
        fire_prob = 1 - result
        label = "Fire" if result < 0.5 else "No Fire"
        
        response = {
            'success': True,
            'label': label,
            'fireProbability': float(fire_prob),
            'rawOutput': float(result)
        }
        
        # If fire detected, calculate additional metrics
        if result < 0.5:
            danger_score = calculate_fire_risk(image, fire_prob)
            cause, conf = predict_fire_cause(image)
            
            response['dangerScore'] = danger_score
            response['cause'] = cause
            response['confidence'] = conf
        else:
            response['dangerScore'] = None
            response['cause'] = None
            response['confidence'] = None
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/predict/ml', methods=['POST'])
def predict_ml():
    """
    ML Fire Type Prediction
    
    Request body:
    {
        "ndvi": 0.3,
        "brightness": 350,
        "t31": 295,
        "confidence": 85,
        "temperature": 30,
        "humidity": 45,
        "windSpeed": 8
    }
    
    Response:
    {
        "success": true,
        "prediction": "Vegetation Fire"
    }
    """
    try:
        data = request.get_json()
        
        # Extract features
        features_list = [
            data.get('ndvi', 0),
            data.get('t31', 290),
            data.get('brightness', 300),
            data.get('confidence', 80),
            data.get('temperature', 25),
            data.get('humidity', 50),
            data.get('windSpeed', 5)
        ]
        
        # Prepare input
        input_data = np.array([features_list])
        input_scaled = scaler.transform(input_data)
        
        # Predict
        prediction = ml_model.predict(input_scaled)[0]
        fire_type = label_encoder.inverse_transform([prediction])[0]
        
        # Get prediction probability (confidence)
        probabilities = ml_model.predict_proba(input_scaled)[0]
        confidence = float(max(probabilities) * 100)
        
        return jsonify({
            'success': True,
            'prediction': fire_type,
            'confidence': confidence
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/predict/cctv', methods=['POST'])
def predict_cctv():
    """
    CCTV Frame Analysis
    
    Request body:
    {
        "streamUrl": "http://...",
        "frame": "base64_encoded_frame" (optional)
    }
    
    Response: Same as /predict/cnn
    """
    try:
        data = request.get_json()
        
        if 'frame' in data:
            # Use provided frame
            image = base64_to_image(data['frame'])
        elif 'streamUrl' in data:
            # Capture frame from stream
            stream_url = data['streamUrl']
            cap = cv2.VideoCapture(stream_url)
            ret, frame = cap.read()
            cap.release()
            
            if not ret:
                return jsonify({'success': False, 'error': 'Could not capture frame from stream'}), 400
            
            # Convert CV2 frame to PIL Image
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image = Image.fromarray(frame_rgb)
        else:
            return jsonify({'success': False, 'error': 'No frame or streamUrl provided'}), 400
        
        # Use same CNN prediction logic
        arr = img_to_array(image.resize((IMG_SIZE, IMG_SIZE))) / 255.0
        arr = np.expand_dims(arr, 0)
        
        result = cnn_model.predict(arr)[0][0]
        fire_prob = 1 - result
        label = "Fire" if result < 0.5 else "No Fire"
        
        response = {
            'success': True,
            'label': label,
            'fireProbability': float(fire_prob),
            'rawOutput': float(result),
            'timestamp': pd.Timestamp.now().isoformat()
        }
        
        if result < 0.5:
            danger_score = calculate_fire_risk(image, fire_prob)
            cause, conf = predict_fire_cause(image)
            
            response['dangerScore'] = danger_score
            response['cause'] = cause
            response['confidence'] = conf
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# -------------------------------------------------------
# RUN SERVER
# -------------------------------------------------------

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🔥 FireVision ML/CNN API Server")
    print("="*50)
    print("✓ CNN Model: Loaded")
    print("✓ ML Model: Loaded")
    print("✓ Server: Running on http://localhost:5001")
    print("="*50 + "\n")
    
    # Run on port 5001 (different from Node backend)
    app.run(host='0.0.0.0', port=5001, debug=True)