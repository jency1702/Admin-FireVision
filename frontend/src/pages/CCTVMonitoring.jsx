import React, { useState } from "react";
import { Video, Flame, Wifi, WifiOff, Loader2, Camera } from "lucide-react";
// import {
//   predictFireCNN,
//   saveFireEvent,
//   createAlert,
// } from "../services/mlApi";
import { predictFireCNN, createAlert, predictFireTypeML, predictFireCCTV } from '../services/mlApi';
const CCTVMonitoring = () => {
  const [streamUrl, setStreamUrl] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [capturedFrame, setCapturedFrame] = useState(null);
  const [result, setResult] = useState(null);

  const captureFrame = async () => {
  try {
    // ✅ Call Python ML backend
    const mlResult = await predictFireCCTV(streamUrl);
    
    setResult({
      label: mlResult.label,
      fireProbability: mlResult.fireProbability,
      dangerScore: mlResult.dangerScore,
      cause: mlResult.cause,
      confidence: mlResult.confidence
    });

    if (mlResult.label === 'Fire') {
      // Send alert
      await createAlert({
        source: 'CCTV',
        message: `Fire detected (${mlResult.cause})`
      });
    }
  } catch (error) {
    console.error(error);
  }
};
  

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">CCTV Fire Monitoring</h1>

      <input
        value={streamUrl}
        onChange={(e) => setStreamUrl(e.target.value)}
        placeholder="RTSP / HTTP URL"
        className="border p-2 w-full mb-3"
      />

      <button
        onClick={captureFrame}
        disabled={loading}
        className="bg-orange-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Analyzing..." : "Capture & Analyze"}
      </button>

      {result && (
        <div className="mt-4 p-4 border rounded">
          <p>Status: <b>{result.label}</b></p>
          <p>Probability: {(result.fireProbability * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
};

export default CCTVMonitoring;
