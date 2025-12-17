// frontend/src/pages/MLFireTypePrediction.jsx
import React, { useState } from 'react';
import { Database, TrendingUp, AlertCircle, Sun, Thermometer, Wind, Droplets, Loader2 } from 'lucide-react';
import { predictFireTypeML, saveMLPrediction } from '../services/mlApi';

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
      // 1. Call Python ML backend
      const mlResult = await predictFireTypeML({
        ndvi: formData.ndvi,
        brightness: formData.brightness,
        t31: formData.t31,
        confidence: formData.confidence,
        temperature: formData.temperature,
        humidity: formData.humidity,
        windSpeed: formData.windSpeed
      });

      const predictedType = mlResult.prediction;
      setPrediction(predictedType);

      // 2. Save to MongoDB in background
      const dbPayload = {
        ndvi: formData.ndvi,
        brightness: formData.brightness,
        t31: formData.t31,
        confidence: formData.confidence,
        temperature: formData.temperature,
        humidity: formData.humidity,
        windSpeed: formData.windSpeed,
        prediction: predictedType
      };

      await saveMLPrediction(dbPayload);

      // 3. Trigger Dashboard Sync
      window.dispatchEvent(new CustomEvent('predictionUpdate', {
        detail: { fireCount: predictedType !== 'Other' ? 1 : 0, noFireCount: 0 }
      }));

    } catch (error) {
      console.error("Prediction or Saving failed:", error);
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ML Fire Type Prediction</h1>
        <p className="text-gray-600 mt-1">Predict fire type using environmental and satellite data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            Input Parameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Sun className="w-4 h-4 text-green-600" /> NDVI
              </label>
              <input type="number" name="ndvi" value={formData.ndvi} onChange={handleInputChange} step="0.0001" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Sun className="w-4 h-4 text-orange-600" /> Brightness (K)
              </label>
              <input type="number" name="brightness" value={formData.brightness} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Thermometer className="w-4 h-4 text-red-600" /> T31 Temperature (K)
              </label>
              <input type="number" name="t31" value={formData.t31} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-600" /> Confidence (%)
              </label>
              <input type="number" name="confidence" value={formData.confidence} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Thermometer className="w-4 h-4 text-red-600" /> Air Temp (°C)
              </label>
              <input type="number" name="temperature" value={formData.temperature} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Droplets className="w-4 h-4 text-blue-600" /> Humidity (%)
              </label>
              <input type="number" name="humidity" value={formData.humidity} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Wind className="w-4 h-4 text-cyan-600" /> Wind Speed (m/s)
              </label>
              <input type="number" name="windSpeed" value={formData.windSpeed} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>

          <button
            onClick={predictFireType}
            disabled={loading}
            className={`w-full mt-6 py-3 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${loading ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'}`}
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Predicting...</> : <><TrendingUp className="w-5 h-5" /> Predict Fire Type</>}
          </button>
        </div>

        {/* Right Column: Results & Parameters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Prediction Result</h2>

          {!prediction && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Database className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-center text-sm">Enter parameters and click "Predict" to see classification</p>
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
              <div className={`p-6 rounded-lg border-2 ${getFireTypeColor(prediction)} text-center`}>
                <p className="text-sm font-semibold mb-2">Predicted Fire Type</p>
                <p className="text-3xl font-bold">{prediction}</p>
              </div>

              {/* restored parameters summary */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 border-b pb-1">Input Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">NDVI:</span><span className="font-semibold">{formData.ndvi.toFixed(4)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Brightness:</span><span className="font-semibold">{formData.brightness} K</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">T31:</span><span className="font-semibold">{formData.t31} K</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Confidence:</span><span className="font-semibold">{formData.confidence}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Temperature:</span><span className="font-semibold">{formData.temperature}°C</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Humidity:</span><span className="font-semibold">{formData.humidity}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Wind Speed:</span><span className="font-semibold">{formData.windSpeed} m/s</span></div>
                </div>
              </div>

              <button onClick={() => setPrediction(null)} className="w-full py-2 px-4 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50">
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
            <h3 className="font-bold text-blue-900 mb-1 text-sm">Fire Type Classifications</h3>
            <div className="text-blue-800 text-xs space-y-1">
              <p><strong>Static Fire:</strong> Stationary fire with consistent brightness</p>
              <p><strong>Vegetation Fire:</strong> Fire in areas with high vegetation index</p>
              <p><strong>Urban Fire:</strong> Fire in low-vegetation urban environments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLFireTypePrediction;























// // frontend/src/pages/MLFireTypePrediction.jsx
// import React, { useState } from 'react';
// import { Database, TrendingUp, AlertCircle, Sun, Thermometer, Wind, Droplets, Loader2, CheckCircle } from 'lucide-react';
// import { predictFireTypeML, saveMLPrediction } from '../services/mlApi';

// const MLFireTypePrediction = () => {
//   const [formData, setFormData] = useState({
//     ndvi: 0,
//     brightness: 300,
//     t31: 290,
//     confidence: 80,
//     temperature: 25,
//     humidity: 50,
//     windSpeed: 5
//   });

//   const [loading, setLoading] = useState(false);
//   const [prediction, setPrediction] = useState(null);
//   const [success, setSuccess] = useState(false); // To show "Saved to DB" status

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: parseFloat(value) || 0
//     }));
//   };

//   const predictFireType = async () => {
//     setLoading(true);
//     setSuccess(false);
//     try {
//       // 1. Call Python ML backend for the prediction
//       const mlResult = await predictFireTypeML({
//         ndvi: formData.ndvi,
//         brightness: formData.brightness,
//         t31: formData.t31,
//         confidence: formData.confidence,
//         temperature: formData.temperature,
//         humidity: formData.humidity,
//         windSpeed: formData.windSpeed
//       });

//       const predictedType = mlResult.prediction;
//       setPrediction(predictedType);

//       // 2. SAVE TO DATABASE (MongoDB via Node.js backend)
//       // Mapping the inputs and results to your MLPredictionSchema
//       const dbPayload = {
//         ndvi: formData.ndvi,
//         brightness: formData.brightness,
//         t31: formData.t31,
//         confidence: formData.confidence,
//         temperature: formData.temperature,
//         humidity: formData.humidity,
//         windSpeed: formData.windSpeed,
//         prediction: predictedType
//       };

//       await saveMLPrediction(dbPayload);
//       setSuccess(true); // Confirmation that MongoDB save worked

//       // 3. Optional: Trigger Dashboard Refresh
//       window.dispatchEvent(new CustomEvent('predictionUpdate', {
//         detail: { fireCount: predictedType !== 'Other' ? 1 : 0, noFireCount: 0 }
//       }));

//     } catch (error) {
//       console.error("Prediction or Saving failed:", error);
//       alert("Failed to process prediction. Check console for details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getFireTypeColor = (type) => {
//     const colors = {
//       'Static Fire': 'bg-blue-100 text-blue-800 border-blue-300',
//       'Offshore Fire': 'bg-cyan-100 text-cyan-800 border-cyan-300',
//       'Vegetation Fire': 'bg-green-100 text-green-800 border-green-300',
//       'Agricultural Fire': 'bg-yellow-100 text-yellow-800 border-yellow-300',
//       'Urban Fire': 'bg-red-100 text-red-800 border-red-300',
//       'Lightning Fire': 'bg-purple-100 text-purple-800 border-purple-300',
//       'Other': 'bg-gray-100 text-gray-800 border-gray-300'
//     };
//     return colors[type] || colors['Other'];
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900">ML Fire Type Prediction</h1>
//         <p className="text-gray-600 mt-1">Predict fire type using environmental and satellite data</p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Input Form - Left Column */}
//         <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
//             <Database className="w-6 h-6 text-blue-600" />
//             Input Parameters
//           </h2>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
//                 <Sun className="w-4 h-4 text-green-600" /> NDVI
//               </label>
//               <input type="number" name="ndvi" value={formData.ndvi} onChange={handleInputChange} step="0.0001" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
//             </div>

//             <div>
//               <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
//                 <Sun className="w-4 h-4 text-orange-600" /> Brightness (K)
//               </label>
//               <input type="number" name="brightness" value={formData.brightness} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
//             </div>

//             <div>
//               <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
//                 <Thermometer className="w-4 h-4 text-red-600" /> T31 (K)
//               </label>
//               <input type="number" name="t31" value={formData.t31} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
//             </div>

//             <div>
//               <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
//                 <TrendingUp className="w-4 h-4 text-purple-600" /> Confidence (%)
//               </label>
//               <input type="number" name="confidence" value={formData.confidence} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
//             </div>

//             <div>
//               <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
//                 <Thermometer className="w-4 h-4 text-red-600" /> Temperature (°C)
//               </label>
//               <input type="number" name="temperature" value={formData.temperature} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
//             </div>

//             <div>
//               <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
//                 <Droplets className="w-4 h-4 text-blue-600" /> Humidity (%)
//               </label>
//               <input type="number" name="humidity" value={formData.humidity} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
//             </div>

//             <div>
//               <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
//                 <Wind className="w-4 h-4 text-cyan-600" /> Wind Speed (m/s)
//               </label>
//               <input type="number" name="windSpeed" value={formData.windSpeed} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
//             </div>
//           </div>

//           <button
//             onClick={predictFireType}
//             disabled={loading}
//             className={`w-full mt-6 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 ${loading ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'}`}
//           >
//             {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Predicting...</> : <><TrendingUp className="w-5 h-5" /> Predict & Save</>}
//           </button>
//         </div>

//         {/* Results - Right Column */}
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-xl font-bold text-gray-900 mb-6">Prediction Result</h2>

//           {success && (
//             <div className="mb-4 p-2 bg-green-50 text-green-700 text-xs rounded border border-green-200 flex items-center gap-2">
//               <CheckCircle className="w-4 h-4" /> Data stored in MongoDB
//             </div>
//           )}

//           {prediction && !loading ? (
//             <div className="space-y-6">
//               <div className={`p-6 rounded-lg border-2 ${getFireTypeColor(prediction)} text-center`}>
//                 <p className="text-sm font-semibold mb-2">Predicted Fire Type</p>
//                 <p className="text-3xl font-bold">{prediction}</p>
//               </div>
//               <button onClick={() => {setPrediction(null); setSuccess(false);}} className="w-full py-2 px-4 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">
//                 New Prediction
//               </button>
//             </div>
//           ) : (
//             <div className="flex flex-col items-center justify-center h-64 text-gray-400">
//               <Database className="w-16 h-16 mb-4 opacity-50" />
//               <p className="text-center">Enter parameters and click "Predict" to store result</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MLFireTypePrediction;










// // frontend/src/pages/MLFireTypePrediction.jsx
// import React, { useState } from 'react';
// import { Database, TrendingUp, AlertCircle, Sun, Thermometer, Wind, Droplets, Loader2 } from 'lucide-react';
// // import { createMLPrediction } from '../services/api';
// import { predictFireTypeML, saveMLPrediction } from '../services/mlApi';
// const MLFireTypePrediction = () => {
//   const [formData, setFormData] = useState({
//     ndvi: 0,
//     brightness: 300,
//     t31: 290,
//     confidence: 80,
//     temperature: 25,
//     humidity: 50,
//     windSpeed: 5
//   });

//   const [loading, setLoading] = useState(false);
//   const [prediction, setPrediction] = useState(null);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: parseFloat(value) || 0
//     }));
//   };
//   const predictFireType = async () => {
//   try {
//     // ✅ Call Python ML backend
//     const mlResult = await predictFireTypeML({
//       ndvi: formData.ndvi,
//       brightness: formData.brightness,
//       t31: formData.t31,
//       confidence: formData.confidence,
//       temperature: formData.temperature,
//       humidity: formData.humidity,
//       windSpeed: formData.windSpeed
//     });
    
//     setPrediction(mlResult.prediction);
//   } catch (error) {
//     console.error(error);
//   }
// };

//   const getFireTypeColor = (type) => {
//     const colors = {
//       'Static Fire': 'bg-blue-100 text-blue-800 border-blue-300',
//       'Offshore Fire': 'bg-cyan-100 text-cyan-800 border-cyan-300',
//       'Vegetation Fire': 'bg-green-100 text-green-800 border-green-300',
//       'Agricultural Fire': 'bg-yellow-100 text-yellow-800 border-yellow-300',
//       'Urban Fire': 'bg-red-100 text-red-800 border-red-300',
//       'Lightning Fire': 'bg-purple-100 text-purple-800 border-purple-300',
//       'Other': 'bg-gray-100 text-gray-800 border-gray-300'
//     };
//     return colors[type] || colors['Other'];
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900">ML Fire Type Prediction</h1>
//         <p className="text-gray-600 mt-1">Predict fire type using environmental and satellite data</p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Input Form - Left Column */}
//         <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
//             <Database className="w-6 h-6 text-blue-600" />
//             Input Parameters
//           </h2>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* NDVI */}
//             <div>
//               <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
//                 <Sun className="w-4 h-4 text-green-600" />
//                 NDVI (Normalized Difference Vegetation Index)
//               </label>
//               <input
//                 type="number"
//                 name="ndvi"
//                 value={formData.ndvi}
//                 onChange={handleInputChange}
//                 step="0.0001"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                 placeholder="0.0000 to 1.0000"
//               />
//               <p className="text-xs text-gray-500 mt-1">Vegetation health indicator (-1 to 1)</p>
//             </div>

//             {/* Brightness */}
//             <div>
//               <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
//                 <Sun className="w-4 h-4 text-orange-600" />
//                 Brightness (Kelvin)
//               </label>
//               <input
//                 type="number"
//                 name="brightness"
//                 value={formData.brightness}
//                 onChange={handleInputChange}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                 placeholder="300 - 400"
//               />
//               <p className="text-xs text-gray-500 mt-1">Fire temperature in Kelvin</p>
//             </div>

//             {/* T31 */}
//             <div>
//               <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
//                 <Thermometer className="w-4 h-4 text-red-600" />
//                 T31 Temperature (Kelvin)
//               </label>
//               <input
//                 type="number"
//                 name="t31"
//                 value={formData.t31}
//                 onChange={handleInputChange}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                 placeholder="280 - 310"
//               />
//               <p className="text-xs text-gray-500 mt-1">Thermal infrared band reading</p>
//             </div>

//             {/* Confidence */}
//             <div>
//               <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
//                 <TrendingUp className="w-4 h-4 text-purple-600" />
//                 Confidence (%)
//               </label>
//               <input
//                 type="number"
//                 name="confidence"
//                 value={formData.confidence}
//                 onChange={handleInputChange}
//                 min="0"
//                 max="100"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                 placeholder="0 - 100"
//               />
//               <p className="text-xs text-gray-500 mt-1">Detection confidence level</p>
//             </div>

//             {/* Temperature */}
//             <div>
//               <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
//                 <Thermometer className="w-4 h-4 text-red-600" />
//                 Air Temperature (°C)
//               </label>
//               <input
//                 type="number"
//                 name="temperature"
//                 value={formData.temperature}
//                 onChange={handleInputChange}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                 placeholder="-10 to 50"
//               />
//               <p className="text-xs text-gray-500 mt-1">Ambient air temperature</p>
//             </div>

//             {/* Humidity */}
//             <div>
//               <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
//                 <Droplets className="w-4 h-4 text-blue-600" />
//                 Humidity (%)
//               </label>
//               <input
//                 type="number"
//                 name="humidity"
//                 value={formData.humidity}
//                 onChange={handleInputChange}
//                 min="0"
//                 max="100"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                 placeholder="0 - 100"
//               />
//               <p className="text-xs text-gray-500 mt-1">Relative humidity level</p>
//             </div>

//             {/* Wind Speed */}
//             <div>
//               <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
//                 <Wind className="w-4 h-4 text-cyan-600" />
//                 Wind Speed (m/s)
//               </label>
//               <input
//                 type="number"
//                 name="windSpeed"
//                 value={formData.windSpeed}
//                 onChange={handleInputChange}
//                 min="0"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                 placeholder="0 - 30"
//               />
//               <p className="text-xs text-gray-500 mt-1">Wind speed in meters/second</p>
//             </div>
//           </div>

//           {/* Predict Button */}
//           <button
//             onClick={predictFireType}
//             disabled={loading}
//             className={`w-full mt-6 py-3 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${
//               loading
//                 ? 'bg-gray-400 cursor-not-allowed'
//                 : 'bg-orange-600 hover:bg-orange-700'
//             }`}
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="w-5 h-5 animate-spin" />
//                 Predicting...
//               </>
//             ) : (
//               <>
//                 <TrendingUp className="w-5 h-5" />
//                 Predict Fire Type
//               </>
//             )}
//           </button>
//         </div>

//         {/* Results - Right Column */}
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-xl font-bold text-gray-900 mb-6">Prediction Result</h2>

//           {!prediction && !loading && (
//             <div className="flex flex-col items-center justify-center h-64 text-gray-400">
//               <Database className="w-16 h-16 mb-4 opacity-50" />
//               <p className="text-center">Enter parameters and click "Predict" to see fire type classification</p>
//             </div>
//           )}

//           {loading && (
//             <div className="flex flex-col items-center justify-center h-64">
//               <Loader2 className="w-16 h-16 text-orange-600 animate-spin mb-4" />
//               <p className="text-gray-600">Running ML model...</p>
//             </div>
//           )}

//           {prediction && !loading && (
//             <div className="space-y-6">
//               {/* Fire Type Badge */}
//               <div className={`p-6 rounded-lg border-2 ${getFireTypeColor(prediction)} text-center`}>
//                 <p className="text-sm font-semibold mb-2">Predicted Fire Type</p>
//                 <p className="text-3xl font-bold">{prediction}</p>
//               </div>

//               {/* Input Summary */}
//               <div className="space-y-3">
//                 <h3 className="font-semibold text-gray-900">Input Summary</h3>
//                 <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">NDVI:</span>
//                     <span className="font-semibold">{formData.ndvi.toFixed(4)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Brightness:</span>
//                     <span className="font-semibold">{formData.brightness} K</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">T31:</span>
//                     <span className="font-semibold">{formData.t31} K</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Confidence:</span>
//                     <span className="font-semibold">{formData.confidence}%</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Temperature:</span>
//                     <span className="font-semibold">{formData.temperature}°C</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Humidity:</span>
//                     <span className="font-semibold">{formData.humidity}%</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Wind Speed:</span>
//                     <span className="font-semibold">{formData.windSpeed} m/s</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Reset Button */}
//               <button
//                 onClick={() => setPrediction(null)}
//                 className="w-full py-2 px-4 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
//               >
//                 New Prediction
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Info Section */}
//       <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
//         <div className="flex items-start gap-3">
//           <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
//           <div>
//             <h3 className="font-bold text-blue-900 mb-1">Fire Type Classifications</h3>
//             <div className="text-blue-800 text-sm space-y-1">
//               <p><strong>Static Fire:</strong> Stationary fire with consistent brightness</p>
//               <p><strong>Vegetation Fire:</strong> Fire in areas with high vegetation index</p>
//               <p><strong>Agricultural Fire:</strong> Controlled burning in agricultural areas</p>
//               <p><strong>Urban Fire:</strong> Fire in low-vegetation urban environments</p>
//               <p><strong>Lightning Fire:</strong> Fire caused by lightning strikes</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MLFireTypePrediction;











