

// frontend/src/pages/FireDetection.jsx
// UPDATED VERSION - Uses real Python ML backend

import React, { useState } from 'react';
import { Upload, Flame, AlertTriangle, Camera, Loader2 } from 'lucide-react';
import {
  predictFireCNN,
  saveFireEvent,
  createAlert
} from '../services/mlApi';
import { createFireEvent,
} from '../services/api';

const FireDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setResult(null);
      setError(null);
    }
  };

  const predictFire = async () => {
  try {
    // ✅ Call Python ML backend
    const mlResult = await predictFireCNN(imagePreview);
    
    setResult({
      label: mlResult.label,
      fireProbability: mlResult.fireProbability,
      dangerScore: mlResult.dangerScore,
      cause: mlResult.cause,
      confidence: mlResult.confidence
    });

    // Send to Node backend for storage
    await createFireEvent({
      source: 'CNN Image Upload',
      label: mlResult.label,
      fireProbability: mlResult.fireProbability,
      dangerScore: mlResult.dangerScore,
      cause: mlResult.cause,
      confidence: mlResult.confidence,
      imageBase64: imagePreview
    });
  } catch (error) {
    setError(error.message);
  }
};

  const getDangerColor = (score) => {
    if (score >= 80) return 'bg-red-600';
    if (score >= 60) return 'bg-orange-600';
    if (score >= 40) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fire Image Detection</h1>
        <p className="text-gray-600 mt-1">Upload an image to detect fire using CNN model</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-red-800 text-sm">{error}</p>
              <p className="text-red-700 text-xs mt-2">
                Make sure Python backend is running on port 5001
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Image</h2>
          
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              {imagePreview ? (
                <div>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-64 mx-auto rounded-lg mb-4"
                  />
                  <p className="text-sm text-gray-500">Click to change image</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-700">Click to upload image</p>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 10MB</p>
                </div>
              )}
            </label>
          </div>

          {/* Predict Button */}
          <button
            onClick={predictFire}
            disabled={!selectedImage || loading}
            className={`w-full mt-6 py-3 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${
              !selectedImage || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing with CNN Model...
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                Predict Fire
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Detection Results</h2>

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Flame className="w-16 h-16 mb-4 opacity-50" />
              <p>Upload an image and click "Predict Fire" to see results</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-16 h-16 text-orange-600 animate-spin mb-4" />
              <p className="text-gray-600">Running CNN prediction...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              {/* Fire Status */}
              <div className={`p-4 rounded-lg ${
                result.label === 'Fire' 
                  ? 'bg-red-50 border-2 border-red-500' 
                  : 'bg-green-50 border-2 border-green-500'
              }`}>
                <div className="flex items-center gap-3">
                  {result.label === 'Fire' ? (
                    <Flame className="w-8 h-8 text-red-600" />
                  ) : (
                    <Flame className="w-8 h-8 text-green-600" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Detection Result</p>
                    <p className={`text-2xl font-bold ${
                      result.label === 'Fire' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {result.label.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Probability */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-2">Fire Probability</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full ${
                        result.fireProbability > 0.5 ? 'bg-red-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${result.fireProbability * 100}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {(result.fireProbability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Danger Score (only if fire detected) */}
              {result.label === 'Fire' && result.dangerScore && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Danger Score</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full ${getDangerColor(result.dangerScore)}`}
                        style={{ width: `${result.dangerScore}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {result.dangerScore}/100
                    </span>
                  </div>
                </div>
              )}

              {/* Fire Cause (only if fire detected) */}
              {result.label === 'Fire' && result.cause && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Predicted Cause</p>
                      <p className="text-lg font-bold text-gray-900">{result.cause}</p>
                      {result.confidence && (
                        <p className="text-sm text-gray-600 mt-1">
                          Confidence: {result.confidence}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                    setResult(null);
                    setError(null);
                  }}
                  className="flex-1 py-2 px-4 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Reset
                </button>
                <button
                  onClick={predictFire}
                  className="flex-1 py-2 px-4 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
                >
                  Analyze Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="font-bold text-blue-900 mb-2">How it works</h3>
        <p className="text-blue-800 text-sm">
          Our CNN (Convolutional Neural Network) model analyzes the uploaded image to detect fire presence, 
          calculate danger levels, and predict the most likely cause of the fire based on visual patterns.
          The model is running on a Python backend server.
        </p>
      </div>
    </div>
  );
};

export default FireDetection;




