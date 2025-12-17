import React, { useState, useEffect } from 'react';
import { Database, Brain, Download} from 'lucide-react';
import { getMLPredictions, getCNNPredictions } from '../services/api';
import MLPredictionCard from '../components/MLPredictionCard';
import FireEventCard from '../components/FireEventCard';
import LoadingSpinner from '../components/LoadingSpinner';

const MLPredictions = () => {
  const [mlPredictions, setMLPredictions] = useState([]);
  const [cnnPredictions, setCNNPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ml');

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      const [mlData, cnnData] = await Promise.all([
        getMLPredictions(),
        getCNNPredictions()
      ]);
      setMLPredictions(mlData.data);
      setCNNPredictions(cnnData.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading predictions:', error);
      setLoading(false);
    }
  };

  const handleExportML = () => {
    const dataStr = JSON.stringify(mlPredictions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `ml-predictions-${new Date().toISOString()}.json`);
    linkElement.click();
  };

  const handleExportCNN = () => {
    const dataStr = JSON.stringify(cnnPredictions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `cnn-predictions-${new Date().toISOString()}.json`);
    linkElement.click();
  };

  if (loading) {
    return <LoadingSpinner message="Loading predictions..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ML & CNN Predictions</h1>
          <p className="text-gray-600 mt-1">Machine learning and deep learning predictions</p>
        </div>
        <button
          onClick={activeTab === 'ml' ? handleExportML : handleExportCNN}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
        >
          <Download className="w-5 h-5" />
          Export Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('ml')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'ml'
              ? 'bg-orange-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Database className="w-5 h-5" />
          ML Predictions ({mlPredictions.length})
        </button>
        <button
          onClick={() => setActiveTab('cnn')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'cnn'
              ? 'bg-orange-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Brain className="w-5 h-5" />
          CNN Predictions ({cnnPredictions.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'ml' ? (
        <div>
          {mlPredictions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mlPredictions.map((prediction, index) => (
                <MLPredictionCard key={prediction.id || index} prediction={prediction} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No ML predictions yet</p>
              <p className="text-gray-400 text-sm mt-2">Predictions will appear here after fire type analysis</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {cnnPredictions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cnnPredictions.map((prediction, index) => (
                <FireEventCard key={prediction.id || index} event={prediction} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No CNN predictions yet</p>
              <p className="text-gray-400 text-sm mt-2">Image predictions will appear here after detection</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MLPredictions;



