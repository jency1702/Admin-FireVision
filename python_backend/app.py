# python_backend/app.py
# UPDATED: Uses EXACT logic from your Streamlit code

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import base64
from io import BytesIO
from PIL import Image
import cv2
from datetime import datetime

# ML imports
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# CNN imports
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array

app = Flask(__name__)
CORS(app)

# -------------------------------------------------------
# LOAD MODELS (Same as Streamlit)
# -------------------------------------------------------

print("🔥 Loading CNN model...")
cnn_model = load_model("fire_cnn_model.h5")
IMG_SIZE = 224
print("✓ CNN model loaded")

print("🔥 Loading ML model...")
# Load dataset (EXACT same code as Streamlit)
df = pd.read_csv("fire_detection/data/fire_prediction_final_dataset.csv")

def assign_fire_type(row):
    """EXACT same function from Streamlit"""
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

le = LabelEncoder()
y = le.fit_transform(y)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# ONLY RANDOM FOREST (same as Streamlit)
ML_MODEL = RandomForestClassifier(random_state=42)
ML_MODEL.fit(X_train, y_train)
print("✓ ML model loaded and trained")

# -------------------------------------------------------
# HELPER FUNCTIONS (EXACT from Streamlit)
# -------------------------------------------------------

def base64_to_image(base64_string):
    """Convert base64 string to PIL Image (same as Streamlit)"""
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    image_data = base64.b64decode(base64_string)
    image = Image.open(BytesIO(image_data)).convert('RGB')
    return image


def calculate_fire_risk(image, fire_prob):
    """EXACT same function from Streamlit"""
    img = np.array(image.resize((224, 224)))
    r, g, b = img[:,:,0], img[:,:,1], img[:,:,2]

    flame_mask = (r > 200) & (g < 120) & (b < 120)
    smoke_mask = (abs(r-g) < 20) & (abs(g-b) < 20) & (r > 150)

    flame_int = np.sum(flame_mask) / (224*224)
    smoke_int = np.sum(smoke_mask) / (224*224)

    score = fire_prob*60 + flame_int*30 + smoke_int*10
    return min(100, max(0, round(score)))


def predict_fire_cause(image):
    """EXACT same function from Streamlit"""
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
        'timestamp': datetime.now().isoformat(),
        'models': {
            'cnn': 'loaded',
            'ml': 'loaded'
        }
    })


@app.route('/predict/cnn', methods=['POST'])
def predict_cnn():
    """
    CNN Fire Detection from Image
    EXACT same logic as Streamlit "Fire Image Detection" tab
    """
    try:
        data = request.get_json()
        
        if 'image' not in data:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        # Convert base64 to image
        img = base64_to_image(data['image'])
        
        # EXACT same CNN prediction as Streamlit
        arr = img_to_array(img.resize((IMG_SIZE, IMG_SIZE))) / 255.0
        arr = np.expand_dims(arr, 0)
        
        # Predict with CNN
        result = cnn_model.predict(arr)[0][0]
        fire_prob = 1 - result
        label = "Fire" if result < 0.5 else "No Fire"
        
        # Base response (same as Streamlit rec dict)
        response = {
            'success': True,
            'time': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'source': 'CNN Image Upload',
            'raw_output': float(result),
            'fireProbability': float(fire_prob),
            'label': label,
            'dangerScore': None,
            'cause': None,
            'confidence': None
        }
        
        # If fire detected, calculate additional metrics (same as Streamlit)
        if result < 0.5:
            danger_score = calculate_fire_risk(img, fire_prob)
            cause, conf = predict_fire_cause(img)
            
            response['dangerScore'] = danger_score
            response['cause'] = cause
            response['confidence'] = conf
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in CNN prediction: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/predict/ml', methods=['POST'])
def predict_ml():
    """
    ML Fire Type Prediction
    EXACT same logic as Streamlit "Fire Type Prediction" tab
    """
    try:
        data = request.get_json()
        
        # Extract features (EXACT order as Streamlit)
        # features = ["NDVI","bright_t31","brightness","confidence","temperature","humidity","wind_speed"]
        NDVI = data.get('ndvi', 0)
        t31 = data.get('t31', 290)
        brightness = data.get('brightness', 300)
        conf = data.get('confidence', 80)
        temp = data.get('temperature', 25)
        hum = data.get('humidity', 50)
        wind = data.get('windSpeed', 5)
        
        # Create input array (EXACT same as Streamlit)
        inp = np.array([[NDVI, t31, brightness, conf, temp, hum, wind]])
        inp_scaled = scaler.transform(inp)
        
        # Predict (EXACT same as Streamlit)
        pred = ML_MODEL.predict(inp_scaled)[0]
        fire_type = le.inverse_transform([pred])[0]
        
        # Get confidence
        probabilities = ML_MODEL.predict_proba(inp_scaled)[0]
        confidence = float(max(probabilities) * 100)
        
        return jsonify({
            'success': True,
            'time': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'prediction': fire_type,
            'confidence': confidence,
            'inputs': {
                'NDVI': NDVI,
                'Brightness': brightness,
                'T31': t31,
                'Confidence': conf,
                'Temperature': temp,
                'Humidity': hum,
                'Wind Speed': wind
            }
        })
        
    except Exception as e:
        print(f"Error in ML prediction: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/predict/cctv', methods=['POST'])
def predict_cctv():
    """
    CCTV Frame Analysis
    EXACT same logic as Streamlit "Real-Time CCTV Monitoring" tab
    """
    try:
        data = request.get_json()
        
        if 'frame' in data:
            # Use provided frame
            img = base64_to_image(data['frame'])
        elif 'streamUrl' in data:
            # Capture frame from stream (same as Streamlit)
            stream_url = data['streamUrl']
            cap = cv2.VideoCapture(stream_url)
            ret, frame = cap.read()
            cap.release()
            
            if not ret:
                return jsonify({
                    'success': False, 
                    'error': 'Could not fetch frame from stream'
                }), 400
            
            # Convert CV2 frame to PIL Image (same as Streamlit)
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            img = Image.fromarray(frame_rgb)
        else:
            return jsonify({
                'success': False, 
                'error': 'No frame or streamUrl provided'
            }), 400
        
        # EXACT same prediction logic as Streamlit CCTV tab
        resized = cv2.resize(np.array(img), (IMG_SIZE, IMG_SIZE))
        arr = img_to_array(resized) / 255.0
        arr = np.expand_dims(arr, 0)
        
        result = cnn_model.predict(arr)[0][0]
        fire_prob = 1 - result
        label = "Fire" if result < 0.5 else "No Fire"
        
        # Base response (same as Streamlit rec dict)
        response = {
            'success': True,
            'time': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'source': 'CCTV Stream',
            'raw_output': float(result),
            'fireProbability': float(fire_prob),
            'label': label,
            'dangerScore': None,
            'cause': None,
            'confidence': None,
            'timestamp': datetime.now().isoformat()
        }
        
        # If fire detected (same as Streamlit)
        if result < 0.5:
            danger_score = calculate_fire_risk(img, fire_prob)
            cause, conf = predict_fire_cause(img)
            
            response['dangerScore'] = danger_score
            response['cause'] = cause
            response['confidence'] = conf
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in CCTV prediction: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


# -------------------------------------------------------
# RUN SERVER
# -------------------------------------------------------

if __name__ == '__main__':
    print("\n" + "="*70)
    print("🔥 FireVision ML/CNN API Server")
    print("="*70)
    print("✓ CNN Model: Loaded")
    print("✓ ML Model: Random Forest (Trained)")
    print("✓ Logic: EXACT match with Streamlit")
    print(f"✓ Server: Running on http://localhost:5001")
    print("="*70)
    print("\nEndpoints:")
    print("  GET  /health            - Health check")
    print("  POST /predict/cnn       - CNN fire detection")
    print("  POST /predict/ml        - ML fire type prediction")
    print("  POST /predict/cctv      - CCTV stream analysis")
    print("="*70 + "\n")
    
    # Run on port 5001
    app.run(host='0.0.0.0', port=5001, debug=True)