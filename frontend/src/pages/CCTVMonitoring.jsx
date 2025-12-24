


// import React, { useState } from "react";
// // Added Activity to the imports below
// import { Video, Flame, WifiOff, Loader2, Camera, Activity } from "lucide-react";
// import { predictFireCCTV, createAlert, saveFireEvent } from '../services/mlApi';

// const CCTVMonitoring = () => {
//   const [streamUrl, setStreamUrl] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);

//   const captureFrame = async () => {
//     if (!streamUrl) return alert("Please enter a Stream URL first");
    
//     setLoading(true);
//     try {
//       // 1. Call Python ML backend
//       const mlResult = await predictFireCCTV(streamUrl);
      
//       setResult({
//         label: mlResult.label,
//         fireProbability: mlResult.fireProbability,
//         dangerScore: mlResult.dangerScore,
//         cause: mlResult.cause,
//         confidence: mlResult.confidence
//       });

//       // 2. SAVE TO DATABASE (Updates Dashboard CCTV count)
//       const dbPayload = {
//         source: 'CCTV Stream', 
//         label: mlResult.label,
//         fireProbability: mlResult.fireProbability,
//         dangerScore: mlResult.dangerScore || 0,
//         cause: mlResult.cause || "N/A",
//         confidence: mlResult.confidence || 0,
//         timestamp: new Date()
//       };

//       await saveFireEvent(dbPayload);

//       // 3. TRIGGER DASHBOARD REFRESH
//       window.dispatchEvent(new CustomEvent('predictionUpdate'));

//       if (mlResult.label === 'Fire') {
//         await createAlert({
//           source: 'CCTV Monitoring',
//           message: `Fire detected! Type: ${mlResult.cause || 'Unknown'}`
//         });
//       }
//     } catch (error) {
//       console.error("CCTV Analysis Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6 p-6">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900">CCTV Fire Monitoring</h1>
//         <p className="text-gray-600">Analyze real-time HTTP video streams</p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 space-y-4">
//           <div className="bg-black rounded-lg aspect-video flex items-center justify-center overflow-hidden border-4 border-gray-800 shadow-xl relative">
//             {streamUrl ? (
//               <img 
//                 src={streamUrl} 
//                 alt="CCTV Feed" 
//                 className="w-full h-full object-cover"
//                 onError={(e) => { e.target.style.display='none'; }} 
//               />
//             ) : (
//               <div className="text-gray-500 flex flex-col items-center">
//                 <Video className="w-16 h-16 mb-2 opacity-20" />
//                 <p>No Active Stream URL</p>
//               </div>
//             )}
            
//             {result?.label === 'Fire' && (
//               <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 animate-pulse font-bold">
//                 <Flame className="w-5 h-5" /> FIRE DETECTED
//               </div>
//             )}
//           </div>

//           <div className="flex gap-2">
//             <input
//               value={streamUrl}
//               onChange={(e) => setStreamUrl(e.target.value)}
//               placeholder="Enter Stream URL"
//               className="flex-1 border border-gray-300 p-3 rounded-lg outline-none"
//             />
//             <button
//               onClick={captureFrame}
//               disabled={loading}
//               className={`px-6 py-2 rounded-lg font-bold text-white transition flex items-center gap-2 ${loading ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'}`}
//             >
//               {loading ? <Loader2 className="animate-spin" /> : <Camera />}
//               {loading ? "Analyzing..." : "Analyze Frame"}
//             </button>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
//           <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//             <Activity className="w-5 h-5 text-orange-600" />
//             Analysis Results
//           </h2>
          
//           {result ? (
//             <div className="space-y-4">
//               <div className={`p-4 rounded-lg border-2 text-center ${result.label === 'Fire' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-green-50 border-green-500 text-green-700'}`}>
//                 <p className="text-xs uppercase font-bold opacity-70">Detection Status</p>
//                 <p className="text-2xl font-black">{result.label.toUpperCase()}</p>
//               </div>

//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between border-b pb-1">
//                   <span className="text-gray-500">Probability:</span>
//                   <span className="font-bold">{(result.fireProbability * 100).toFixed(1)}%</span>
//                 </div>
//                 <div className="flex justify-between border-b pb-1">
//                   <span className="text-gray-500">Cause:</span>
//                   <span className="font-bold">{result.cause || "N/A"}</span>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="text-gray-400 text-center py-20">
//               <WifiOff className="w-12 h-12 mx-auto mb-2 opacity-20" />
//               <p>Connect and analyze to see data</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CCTVMonitoring;



import React, { useState } from "react";
import { Video, Flame, WifiOff, Loader2, Camera, Activity, AlertCircle } from "lucide-react";
import { predictFireCCTV, createAlert, saveFireEvent } from '../services/mlApi';
import axios from 'axios';

const CCTVMonitoring = () => {
  const [streamUrl, setStreamUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [alertStatus, setAlertStatus] = useState(null); // ⭐ NEW: Track alert sending status
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // ⭐ NEW FUNCTION: Send alert to all registered users
  const sendAlertToUsers = async (detectionData, imageBase64) => {
    try {
      const payload = {
        fireLocation: detectionData.location || 'CCTV Stream',
        confidence: detectionData.fireProbability || 0.95,
        cctvFootage: detectionData.source || 'CCTV-001',
        imageBase64: imageBase64 || null
      };

      console.log('📤 Sending fire alert to all users:', payload);

      const response = await axios.post(`${API_URL}/fire-alerts/send`, payload);

      if (response.data.success) {
        setAlertStatus({
          type: 'success',
          message: `✅ Alert sent to ${response.data.data.alertCount} users!`,
          timestamp: new Date()
        });

        // Clear success message after 5 seconds
        setTimeout(() => setAlertStatus(null), 5000);

        console.log('✅ Fire alert sent successfully:', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('❌ Error sending fire alert:', error);
      setAlertStatus({
        type: 'error',
        message: `❌ Failed to send alert: ${error.response?.data?.error || error.message}`,
        timestamp: new Date()
      });

      // Clear error message after 5 seconds
      setTimeout(() => setAlertStatus(null), 5000);
    }
  };

  // ⭐ UPDATED: Capture frame with user alerts
  const captureFrame = async () => {
    if (!streamUrl) return alert("Please enter a Stream URL first");
    
    setLoading(true);
    try {
      // 1. Call Python ML backend
      const mlResult = await predictFireCCTV(streamUrl);
      
      setResult({
        label: mlResult.label,
        fireProbability: mlResult.fireProbability,
        dangerScore: mlResult.dangerScore,
        cause: mlResult.cause,
        confidence: mlResult.confidence
      });

      // 2. SAVE TO DATABASE (Updates Dashboard CCTV count)
      const dbPayload = {
        source: 'CCTV Stream', 
        label: mlResult.label,
        fireProbability: mlResult.fireProbability,
        dangerScore: mlResult.dangerScore || 0,
        cause: mlResult.cause || "N/A",
        confidence: mlResult.confidence || 0,
        timestamp: new Date()
      };

      await saveFireEvent(dbPayload);

      // 3. TRIGGER DASHBOARD REFRESH
      window.dispatchEvent(new CustomEvent('predictionUpdate'));

      // ⭐ NEW: If fire detected, send alert to ALL registered users
      if (mlResult.label === 'Fire') {
        console.log('🚨 Fire detected! Sending alerts to registered users...');
        
        // Send alert to users
        await sendAlertToUsers({
          location: 'CCTV Stream - Location',
          source: 'CCTV Monitoring',
          fireProbability: mlResult.fireProbability,
          cause: mlResult.cause || 'Unknown'
        }, null); // Can pass image base64 if available

        // Also create local alert (existing functionality)
        await createAlert({
          source: 'CCTV Monitoring',
          message: `Fire detected! Type: ${mlResult.cause || 'Unknown'}`
        });
      }
    } catch (error) {
      console.error("CCTV Analysis Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">CCTV Fire Monitoring</h1>
        <p className="text-gray-600">Analyze real-time HTTP video streams</p>
      </div>

      {/* ⭐ NEW: Alert Status Display */}
      {alertStatus && (
        <div className={`p-4 rounded-lg flex items-center gap-3 border-l-4 ${
          alertStatus.type === 'success' 
            ? 'bg-green-50 border-green-500 text-green-700' 
            : 'bg-red-50 border-red-500 text-red-700'
        }`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">{alertStatus.message}</p>
            <p className="text-xs opacity-75">{alertStatus.timestamp.toLocaleTimeString()}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-black rounded-lg aspect-video flex items-center justify-center overflow-hidden border-4 border-gray-800 shadow-xl relative">
            {streamUrl ? (
              <img 
                src={streamUrl} 
                alt="CCTV Feed" 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display='none'; }} 
              />
            ) : (
              <div className="text-gray-500 flex flex-col items-center">
                <Video className="w-16 h-16 mb-2 opacity-20" />
                <p>No Active Stream URL</p>
              </div>
            )}
            
            {result?.label === 'Fire' && (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 animate-pulse font-bold">
                <Flame className="w-5 h-5" /> FIRE DETECTED
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              placeholder="Enter Stream URL"
              className="flex-1 border border-gray-300 p-3 rounded-lg outline-none"
            />
            <button
              onClick={captureFrame}
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-bold text-white transition flex items-center gap-2 ${loading ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'}`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Camera />}
              {loading ? "Analyzing..." : "Analyze Frame"}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-600" />
            Analysis Results
          </h2>
          
          {result ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border-2 text-center ${result.label === 'Fire' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-green-50 border-green-500 text-green-700'}`}>
                <p className="text-xs uppercase font-bold opacity-70">Detection Status</p>
                <p className="text-2xl font-black">{result.label.toUpperCase()}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">Probability:</span>
                  <span className="font-bold">{(result.fireProbability * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">Confidence:</span>
                  <span className="font-bold">{(result.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">Danger Score:</span>
                  <span className="font-bold">{result.dangerScore || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">Cause:</span>
                  <span className="font-bold">{result.cause || "N/A"}</span>
                </div>
              </div>

              {/* ⭐ NEW: Show when alert was sent */}
              {result.label === 'Fire' && alertStatus?.type === 'success' && (
                <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded text-green-800 text-sm">
                  <p className="font-semibold flex items-center gap-2">
                    <Flame className="w-4 h-4" /> Alert Status
                  </p>
                  <p className="text-xs mt-1">{alertStatus.message}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-20">
              <WifiOff className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Connect and analyze to see data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CCTVMonitoring;