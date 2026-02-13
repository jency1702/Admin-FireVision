



// import React, { useState } from "react";
// import {
//   Video,
//   Flame,
//   WifiOff,
//   Loader2,
//   Camera,
//   Activity
// } from "lucide-react";
// import axios from "axios";
// import { createAlert, saveFireEvent } from "../services/mlApi";

// const API_URL = "http://localhost:5001"; // Python backend

// const CCTVMonitoring = () => {
//   const [streamUrl, setStreamUrl] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);

//   const captureFrame = async () => {
//     if (!streamUrl) {
//       alert("Please enter a CCTV / IP Webcam stream URL");
//       return;
//     }

//     setLoading(true);
//     try {
//       // 🔥 CALL CCTV CNN BACKEND
//       const res = await axios.post(`${API_URL}/predict/cctv`, {
//         streamUrl
//       });

//       const data = res.data;

//       setResult({
//         label: data.label,
//         fireProbability: data.fireProbability,
//         dangerScore: data.dangerScore,
//         cause: data.cause,
//         confidence: data.confidence
//       });

//       // 💾 SAVE EVENT TO DATABASE
//       await saveFireEvent({
//         source: "CCTV Stream",
//         label: data.label,
//         fireProbability: data.fireProbability,
//         dangerScore: data.dangerScore || 0,
//         cause: data.cause || "N/A",
//         confidence: data.confidence || 0,
//         timestamp: new Date()
//       });

//       // 🔄 DASHBOARD REFRESH
//       window.dispatchEvent(new CustomEvent("predictionUpdate"));

//       // 🚨 ALERT
//       if (data.label === "Fire") {
//         await createAlert({
//           source: "CCTV Monitoring",
//           message: `🔥 Fire detected from CCTV! Cause: ${data.cause || "Unknown"}`
//         });
//       }
//     } catch (err) {
//       console.error("CCTV Prediction Error:", err);
//       alert("Unable to analyze CCTV stream. Check URL or backend.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6 p-6">
//       {/* HEADER */}
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900">
//           CCTV Fire Monitoring
//         </h1>
//         <p className="text-gray-600">
//           AI-based fire detection from CCTV / IP Webcam streams
//         </p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* LEFT PANEL */}
//         <div className="lg:col-span-2 space-y-4">
//           <div className="bg-black rounded-lg aspect-video flex items-center justify-center border-4 border-gray-800 shadow-xl relative">
//             <div className="text-gray-500 flex flex-col items-center">
//               <Video className="w-16 h-16 mb-2 opacity-20" />
//               <p>CCTV Stream (Analyzed on Server)</p>
//             </div>

//             {result?.label === "Fire" && (
//               <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 animate-pulse font-bold">
//                 <Flame className="w-5 h-5" /> FIRE DETECTED
//               </div>
//             )}
//           </div>

//           {/* INPUT + BUTTON */}
//           <div className="flex gap-2">
//             <input
//               value={streamUrl}
//               onChange={(e) => setStreamUrl(e.target.value)}
//               placeholder="rtsp:// or http://<ip>:8080/shot.jpg"
//               className="flex-1 border border-gray-300 p-3 rounded-lg outline-none"
//             />
//             <button
//               onClick={captureFrame}
//               disabled={loading}
//               className={`px-6 py-2 rounded-lg font-bold text-white transition flex items-center gap-2 ${
//                 loading
//                   ? "bg-gray-400"
//                   : "bg-orange-600 hover:bg-orange-700"
//               }`}
//             >
//               {loading ? <Loader2 className="animate-spin" /> : <Camera />}
//               {loading ? "Analyzing..." : "Analyze CCTV"}
//             </button>
//           </div>
//         </div>

//         {/* RIGHT PANEL */}
//         <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
//           <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//             <Activity className="w-5 h-5 text-orange-600" />
//             Analysis Results
//           </h2>

//           {result ? (
//             <div className="space-y-4">
//               <div
//                 className={`p-4 rounded-lg border-2 text-center ${
//                   result.label === "Fire"
//                     ? "bg-red-50 border-red-500 text-red-700"
//                     : "bg-green-50 border-green-500 text-green-700"
//                 }`}
//               >
//                 <p className="text-xs uppercase font-bold opacity-70">
//                   Detection Status
//                 </p>
//                 <p className="text-2xl font-black">
//                   {result.label.toUpperCase()}
//                 </p>
//               </div>

//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between border-b pb-1">
//                   <span className="text-gray-500">Fire Probability:</span>
//                   <span className="font-bold">
//                     {(result.fireProbability * 100).toFixed(1)}%
//                   </span>
//                 </div>
//                 <div className="flex justify-between border-b pb-1">
//                   <span className="text-gray-500">Cause:</span>
//                   <span className="font-bold">
//                     {result.cause || "N/A"}
//                   </span>
//                 </div>
//                 <div className="flex justify-between border-b pb-1">
//                   <span className="text-gray-500">Danger Score:</span>
//                   <span className="font-bold">
//                     {result.dangerScore || 0}/100
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="text-gray-400 text-center py-20">
//               <WifiOff className="w-12 h-12 mx-auto mb-2 opacity-20" />
//               <p>Enter CCTV stream URL and analyze</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CCTVMonitoring;



import React, { useState } from "react";
import {
  Video,
  Flame,
  WifiOff,
  Loader2,
  Camera,
  Activity
} from "lucide-react";
import axios from "axios";

// ⭐ API CONFIGURATION
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const ML_API_URL = process.env.REACT_APP_ML_API_URL || 'http://localhost:5001'; // Python backend

const CCTVMonitoring = () => {
  const [streamUrl, setStreamUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [alertCreating, setAlertCreating] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertError, setAlertError] = useState('');

  // 🚨 BROADCAST FIRE ALERT TO ALL USERS
  const broadcastFireAlert = async (fireData) => {
    try {
      setAlertCreating(true);
      setAlertError('');
      setAlertMessage('🚨 Broadcasting alert to all users...');

      console.log('📨 Creating broadcast alert:', fireData);

      const alertPayload = {
        fireLocation: fireData.location || 'CCTV Stream - Location TBD',
        cctvFootage: fireData.cctvId || 'CCTV-001',
        confidence: fireData.confidence || fireData.fireProbability || 0,
        message: `🚨 FIRE ALERT - IMMEDIATE ACTION REQUIRED!\n\n📍 Location: CCTV Stream\n🔥 Fire Detected!\n\nDetails:\n• Fire Probability: ${(fireData.fireProbability * 100).toFixed(1)}%\n• Danger Score: ${fireData.dangerScore || 0}/100\n• Cause: ${fireData.cause || 'Unknown'}\n• Detected at: ${new Date().toLocaleString()}\n\n⚠️ EVACUATE IF NECESSARY\n☎️ CALL EMERGENCY SERVICES`,
        severity: 'critical',
        source: 'CCTV',
        metadata: {
          fireProbability: fireData.fireProbability,
          dangerScore: fireData.dangerScore,
          cause: fireData.cause,
          source: 'CCTV Stream'
        }
      };

      // 🚀 SEND BROADCAST ALERT TO BACKEND
      const response = await axios.post(
        `${API_URL}/fire-alerts/broadcast`,
        alertPayload,
        {
          timeout: 10000
        }
      );

      console.log('✅ Fire alert broadcast successful:', response.data);

      setAlertMessage(`✅ Alert sent to ${response.data.data.alertsCreated} users!`);

      return response.data;

    } catch (err) {
      console.error('❌ Error broadcasting alert:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to broadcast alert';
      setAlertError(`⚠️ ${errorMsg}`);
      throw err;
    } finally {
      setAlertCreating(false);
      // Clear message after 5 seconds
      setTimeout(() => {
        setAlertMessage('');
        setAlertError('');
      }, 5000);
    }
  };

  // 📊 CAPTURE AND ANALYZE CCTV FRAME
  const captureFrame = async () => {
    if (!streamUrl) {
      alert('Please enter a CCTV / IP Webcam stream URL');
      return;
    }

    setLoading(true);
    setAlertMessage('');
    setAlertError('');

    try {
      console.log('🎥 Analyzing CCTV frame from:', streamUrl);

      // 🔥 CALL PYTHON ML BACKEND
      const res = await axios.post(
        `${ML_API_URL}/predict/cctv`,
        { streamUrl },
        { timeout: 30000 }
      );

      const data = res.data;
      console.log('📊 ML Analysis result:', data);

      // ✅ UPDATE UI WITH RESULTS
      setResult({
        label: data.label,
        fireProbability: data.fireProbability,
        dangerScore: data.dangerScore,
        cause: data.cause,
        confidence: data.confidence
      });

      // 🚨 IF FIRE DETECTED - BROADCAST ALERT IMMEDIATELY
      if (data.label === 'Fire') {
        console.log('🔥🔥🔥 FIRE DETECTED! BROADCASTING ALERT TO ALL USERS!');

        try {
          await broadcastFireAlert({
            location: 'CCTV Stream',
            cctvId: 'CCTV-001',
            fireProbability: data.fireProbability,
            dangerScore: data.dangerScore,
            cause: data.cause,
            confidence: data.confidence,
            timestamp: new Date()
          });

          // 📢 Dispatch custom event for dashboard
          window.dispatchEvent(new CustomEvent('fireDetected', {
            detail: {
              label: data.label,
              fireProbability: data.fireProbability,
              cause: data.cause,
              timestamp: new Date()
            }
          }));

        } catch (alertErr) {
          console.error('❌ Failed to broadcast alert:', alertErr);
          setAlertError('⚠️ Fire detected but alert broadcast failed!');
        }
      } else {
        setAlertMessage('✅ No fire detected - System safe!');
        setTimeout(() => setAlertMessage(''), 3000);
      }

    } catch (err) {
      console.error('❌ CCTV Prediction Error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Unable to analyze CCTV stream';
      setAlertError(`❌ ${errorMsg}`);
      alert(`Error: ${errorMsg}\n\nCheck:\n1. CCTV URL is correct\n2. Python backend is running on ${ML_API_URL}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          🔥 CCTV Fire Monitoring
        </h1>
        <p className="text-gray-600">
          AI-based real-time fire detection from CCTV / IP Webcam streams
        </p>
      </div>

      {/* ALERT MESSAGES */}
      {alertMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded text-green-700">
          {alertMessage}
        </div>
      )}
      {alertError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-red-700">
          {alertError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT PANEL - VIDEO DISPLAY */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-black rounded-lg aspect-video flex items-center justify-center border-4 border-gray-800 shadow-xl relative overflow-hidden">
            <div className="text-gray-500 flex flex-col items-center">
              <Video className="w-16 h-16 mb-2 opacity-20" />
              <p className="text-sm">CCTV Stream (Analyzed on Server)</p>
            </div>

            {/* FIRE DETECTED BANNER */}
            {result?.label === 'Fire' && (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-6 py-3 rounded-full flex items-center gap-2 animate-pulse font-bold shadow-lg">
                <Flame className="w-6 h-6 animate-bounce" />
                FIRE DETECTED
              </div>
            )}

            {/* LOADING INDICATOR */}
            {loading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Analyzing CCTV...</p>
                </div>
              </div>
            )}
          </div>

          {/* INPUT + BUTTON */}
          <div className="flex gap-2">
            <input
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              placeholder="rtsp:// or http://<ip>:8080/shot.jpg"
              className="flex-1 border border-gray-300 p-3 rounded-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
            <button
              onClick={captureFrame}
              disabled={loading || alertCreating}
              className={`px-6 py-3 rounded-lg font-bold text-white transition flex items-center gap-2 ${
                loading || alertCreating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-600 hover:bg-orange-700 active:scale-95'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Analyzing...
                </>
              ) : alertCreating ? (
                <>
                  <Loader2 className="animate-spin" />
                  Broadcasting...
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  Analyze CCTV
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL - RESULTS */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-600" />
            Analysis Results
          </h2>

          {result ? (
            <div className="space-y-4">
              {/* DETECTION STATUS */}
              <div
                className={`p-4 rounded-lg border-2 text-center font-bold ${
                  result.label === 'Fire'
                    ? 'bg-red-50 border-red-500 text-red-700'
                    : 'bg-green-50 border-green-500 text-green-700'
                }`}
              >
                <p className="text-xs uppercase opacity-70 mb-1">
                  Detection Status
                </p>
                <p className="text-2xl">
                  {result.label === 'Fire' ? '🔥 FIRE!' : '✅ SAFE'}
                </p>
              </div>

              {/* METRICS */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Fire Probability:</span>
                  <span className="font-bold text-lg">
                    {(result.fireProbability * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Danger Score:</span>
                  <span className="font-bold text-lg">
                    {result.dangerScore || 0}/100
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Cause:</span>
                  <span className="font-bold">
                    {result.cause || 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Confidence:</span>
                  <span className="font-bold">
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* ALERT STATUS */}
              {result.label === 'Fire' && (
                <div className="mt-4 p-3 bg-red-50 border-2 border-red-500 rounded text-red-700 text-sm font-bold text-center">
                  <p>🚨 ALERTS SENT TO ALL USERS</p>
                  {alertCreating && <p className="text-xs mt-1">Broadcasting...</p>}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-12">
              <WifiOff className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Enter CCTV stream URL and click Analyze</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CCTVMonitoring;