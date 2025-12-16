// frontend/src/pages/MLFireTypePrediction.jsx
import React, { useState } from 'react';
import { Database, TrendingUp, AlertCircle, Sun, Thermometer, Wind, Droplets, Loader2 } from 'lucide-react';
// import { createMLPrediction } from '../services/api';
import { predictFireTypeML } from '../services/mlApi';
const MLFireTypePrediction = () => {
  const [formData, setFormData] = useState({
    ndvi: 0,
    brightness: 300,
    t31: 290,
    confidence: 80,
    temperature: 25,
    humidity: 50,
    windSpeed: 5
  });

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const predictFireType = async () => {
    setLoading(true);
    
    try {
      // Simulate ML prediction (replace with actual API call to Python backend)
      
      
      // Mock fire type prediction based on input values
      const mlResult = await predictFireTypeML(formData);
      setPrediction(mlResult.fire_type);

    } catch (error) {
      console.error('Error predicting fire type:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFireTypeColor = (type) => {
    const colors = {
      'Static Fire': 'bg-blue-100 text-blue-800 border-blue-300',
      'Offshore Fire': 'bg-cyan-100 text-cyan-800 border-cyan-300',
      'Vegetation Fire': 'bg-green-100 text-green-800 border-green-300',
      'Agricultural Fire': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Urban Fire': 'bg-red-100 text-red-800 border-red-300',
      'Lightning Fire': 'bg-purple-100 text-purple-800 border-purple-300',
      'Other': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[type] || colors['Other'];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ML Fire Type Prediction</h1>
        <p className="text-gray-600 mt-1">Predict fire type using environmental and satellite data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form - Left Column */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            Input Parameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NDVI */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Sun className="w-4 h-4 text-green-600" />
                NDVI (Normalized Difference Vegetation Index)
              </label>
              <input
                type="number"
                name="ndvi"
                value={formData.ndvi}
                onChange={handleInputChange}
                step="0.0001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0.0000 to 1.0000"
              />
              <p className="text-xs text-gray-500 mt-1">Vegetation health indicator (-1 to 1)</p>
            </div>

            {/* Brightness */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Sun className="w-4 h-4 text-orange-600" />
                Brightness (Kelvin)
              </label>
              <input
                type="number"
                name="brightness"
                value={formData.brightness}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="300 - 400"
              />
              <p className="text-xs text-gray-500 mt-1">Fire temperature in Kelvin</p>
            </div>

            {/* T31 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Thermometer className="w-4 h-4 text-red-600" />
                T31 Temperature (Kelvin)
              </label>
              <input
                type="number"
                name="t31"
                value={formData.t31}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="280 - 310"
              />
              <p className="text-xs text-gray-500 mt-1">Thermal infrared band reading</p>
            </div>

            {/* Confidence */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                Confidence (%)
              </label>
              <input
                type="number"
                name="confidence"
                value={formData.confidence}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0 - 100"
              />
              <p className="text-xs text-gray-500 mt-1">Detection confidence level</p>
            </div>

            {/* Temperature */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Thermometer className="w-4 h-4 text-red-600" />
                Air Temperature (°C)
              </label>
              <input
                type="number"
                name="temperature"
                value={formData.temperature}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="-10 to 50"
              />
              <p className="text-xs text-gray-500 mt-1">Ambient air temperature</p>
            </div>

            {/* Humidity */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Droplets className="w-4 h-4 text-blue-600" />
                Humidity (%)
              </label>
              <input
                type="number"
                name="humidity"
                value={formData.humidity}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0 - 100"
              />
              <p className="text-xs text-gray-500 mt-1">Relative humidity level</p>
            </div>

            {/* Wind Speed */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Wind className="w-4 h-4 text-cyan-600" />
                Wind Speed (m/s)
              </label>
              <input
                type="number"
                name="windSpeed"
                value={formData.windSpeed}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0 - 30"
              />
              <p className="text-xs text-gray-500 mt-1">Wind speed in meters/second</p>
            </div>
          </div>

          {/* Predict Button */}
          <button
            onClick={predictFireType}
            disabled={loading}
            className={`w-full mt-6 py-3 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Predicting...
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5" />
                Predict Fire Type
              </>
            )}
          </button>
        </div>

        {/* Results - Right Column */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Prediction Result</h2>

          {!prediction && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Database className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-center">Enter parameters and click "Predict" to see fire type classification</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-16 h-16 text-orange-600 animate-spin mb-4" />
              <p className="text-gray-600">Running ML model...</p>
            </div>
          )}

          {prediction && !loading && (
            <div className="space-y-6">
              {/* Fire Type Badge */}
              <div className={`p-6 rounded-lg border-2 ${getFireTypeColor(prediction)} text-center`}>
                <p className="text-sm font-semibold mb-2">Predicted Fire Type</p>
                <p className="text-3xl font-bold">{prediction}</p>
              </div>

              {/* Input Summary */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Input Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">NDVI:</span>
                    <span className="font-semibold">{formData.ndvi.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brightness:</span>
                    <span className="font-semibold">{formData.brightness} K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">T31:</span>
                    <span className="font-semibold">{formData.t31} K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence:</span>
                    <span className="font-semibold">{formData.confidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Temperature:</span>
                    <span className="font-semibold">{formData.temperature}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Humidity:</span>
                    <span className="font-semibold">{formData.humidity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wind Speed:</span>
                    <span className="font-semibold">{formData.windSpeed} m/s</span>
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => setPrediction(null)}
                className="w-full py-2 px-4 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                New Prediction
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-blue-900 mb-1">Fire Type Classifications</h3>
            <div className="text-blue-800 text-sm space-y-1">
              <p><strong>Static Fire:</strong> Stationary fire with consistent brightness</p>
              <p><strong>Vegetation Fire:</strong> Fire in areas with high vegetation index</p>
              <p><strong>Agricultural Fire:</strong> Controlled burning in agricultural areas</p>
              <p><strong>Urban Fire:</strong> Fire in low-vegetation urban environments</p>
              <p><strong>Lightning Fire:</strong> Fire caused by lightning strikes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLFireTypePrediction;