import React, { useState, useEffect } from 'react';
import { TrendingUp, Loader2, Database, Clock } from 'lucide-react';
import { predictFireTypeML, saveMLPrediction, getMLPredictions } from '../services/mlApi';

const MLFireTypePrediction = () => {
  const [formData, setFormData] = useState({
    ndvi: '',
    brightness: '',
    t31: '',
    confidence: '',
    temperature: '',
    humidity: '',
    windSpeed: ''
  });

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getMLPredictions();
      setHistory(data.data || data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Removing the "|| 0" allows the field to be empty so the '0' doesn't stay in front
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : parseFloat(value)
    }));
  };

  const predictFireType = async () => {
    setLoading(true);
    try {
      // Convert any empty strings to 0 for the API call
      const submissionData = Object.fromEntries(
        Object.entries(formData).map(([k, v]) => [k, v === '' ? 0 : v])
      );

      const mlResult = await predictFireTypeML(submissionData);
      const predictedType = mlResult.prediction;
      setPrediction(predictedType);

      const dbPayload = { ...submissionData, prediction: predictedType };
      await saveMLPrediction(dbPayload);

      fetchHistory();

      window.dispatchEvent(new CustomEvent('predictionUpdate', {
        detail: { fireCount: predictedType !== 'Other' ? 1 : 0, noFireCount: 0 }
      }));
    } catch (error) {
      console.error("Prediction failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFireTypeColor = (type) => {
    const colors = {
      'Static Fire': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
      'Offshore Fire': 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-300',
      'Vegetation Fire': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300',
      'Agricultural Fire': 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Urban Fire': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300',
      'Lightning Fire': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300',
      'Other': 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[type] || colors['Other'];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ML Fire Type Prediction</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            Input Parameters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <input
                  type="number"
                  name={key}
                  value={formData[key]}
                  onChange={handleInputChange}
                  placeholder="Enter value..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            ))}
          </div>
          <button
            onClick={predictFireType}
            disabled={loading}
            className={`w-full mt-6 py-3 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${loading ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'}`}
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Predicting...</> : <><TrendingUp className="w-5 h-5" /> Predict Fire Type</>}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Current Result</h2>
          {!prediction && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Database className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-center text-sm">Enter parameters to see classification</p>
            </div>
          )}
          {prediction && !loading && (
            <div className="space-y-6">
              <div className={`p-6 rounded-lg border-2 ${getFireTypeColor(prediction)} text-center`}>
                <p className="text-sm font-semibold mb-2">Predicted Fire Type</p>
                <p className="text-3xl font-bold">{prediction}</p>
              </div>
              <button onClick={() => setPrediction(null)} className="w-full py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Clear Result
              </button>
            </div>
          )}
        </div>
      </div>

      {/* History Table with ALL parameters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6 text-orange-600" />
          Detailed Prediction History
        </h2>

        {loadingHistory ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-600" /></div>
        ) : history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b dark:border-gray-700 text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Prediction</th>
                  <th className="py-3 px-2">NDVI</th>
                  <th className="py-3 px-2">Bright (K)</th>
                  <th className="py-3 px-2">T31 (K)</th>
                  <th className="py-3 px-2">Conf %</th>
                  <th className="py-3 px-2">Temp °C</th>
                  <th className="py-3 px-2">Hum %</th>
                  <th className="py-3 px-2">Wind m/s</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {history.slice().reverse().map((item, index) => (
                  <tr key={item._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-sm">
                    <td className="py-3 px-2 whitespace-nowrap dark:text-gray-300">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${getFireTypeColor(item.prediction)}`}>
                        {item.prediction}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-mono dark:text-gray-300">{(item.ndvi || 0).toFixed(4)}</td>
                    <td className="py-3 px-2 dark:text-gray-300">{item.brightness}</td>
                    <td className="py-3 px-2 dark:text-gray-300">{item.t31}</td>
                    <td className="py-3 px-2 dark:text-gray-300">{item.confidence}%</td>
                    <td className="py-3 px-2 dark:text-gray-300">{item.temperature}</td>
                    <td className="py-3 px-2 dark:text-gray-300">{item.humidity}</td>
                    <td className="py-3 px-2 dark:text-gray-300">{item.windSpeed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">No historical data available.</p>
        )}
      </div>
    </div>
  );
};

export default MLFireTypePrediction;