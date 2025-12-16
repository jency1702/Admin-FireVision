import React from 'react';
import { Database, Thermometer, Wind, Droplets, Sun, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';

const MLPredictionCard = ({ prediction }) => {
  const formatTimestamp = (timestamp) => {
    try {
      if (timestamp?.seconds) {
        return format(new Date(timestamp.seconds * 1000), 'MMM dd, yyyy HH:mm:ss');
      }
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
    } catch (error) {
      return timestamp;
    }
  };

  const getFireTypeColor = (fireType) => {
    const colors = {
      'Static Fire': 'bg-blue-100 text-blue-800 border-blue-300',
      'Offshore Fire': 'bg-cyan-100 text-cyan-800 border-cyan-300',
      'Vegetation Fire': 'bg-green-100 text-green-800 border-green-300',
      'Agricultural Fire': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Urban Fire': 'bg-red-100 text-red-800 border-red-300',
      'Lightning Fire': 'bg-purple-100 text-purple-800 border-purple-300',
      'Other': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[fireType] || colors['Other'];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-full">
            <Database className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">ML Prediction</h3>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Clock className="w-4 h-4" />
              {formatTimestamp(prediction.timestamp || prediction.time)}
            </div>
          </div>
        </div>
        
        <span className={`px-4 py-2 rounded-lg text-sm font-bold border-2 ${getFireTypeColor(prediction.prediction || prediction.fireType)}`}>
          {prediction.prediction || prediction.fireType}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Sun className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-gray-700">NDVI</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{prediction.ndvi?.toFixed(4) || prediction.NDVI?.toFixed(4)}</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Sun className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-semibold text-gray-700">Brightness</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{prediction.brightness || prediction.Brightness} K</p>
        </div>

        <div className="bg-red-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className="w-4 h-4 text-red-600" />
            <span className="text-xs font-semibold text-gray-700">Temperature</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{prediction.temperature || prediction.Temperature}°C</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-gray-700">Humidity</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{prediction.humidity || prediction.Humidity}%</p>
        </div>

        <div className="bg-cyan-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Wind className="w-4 h-4 text-cyan-600" />
            <span className="text-xs font-semibold text-gray-700">Wind Speed</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{prediction.windSpeed || prediction['Wind Speed']} m/s</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-semibold text-gray-700">Confidence</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{prediction.confidence || prediction.Confidence}%</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">T31 Temperature:</span>
          <span className="font-semibold text-gray-900">{prediction.t31 || prediction.T31} K</span>
        </div>
      </div>
    </div>
  );
};

export default MLPredictionCard;
