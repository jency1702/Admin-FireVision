



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
import { createAlert, saveFireEvent } from "../services/mlApi";

const API_URL = "http://localhost:5001"; // Python backend

const CCTVMonitoring = () => {
  const [streamUrl, setStreamUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const captureFrame = async () => {
    if (!streamUrl) {
      alert("Please enter a CCTV / IP Webcam stream URL");
      return;
    }

    setLoading(true);
    try {
      // 🔥 CALL CCTV CNN BACKEND
      const res = await axios.post(`${API_URL}/predict/cctv`, {
        streamUrl
      });

      const data = res.data;

      setResult({
        label: data.label,
        fireProbability: data.fireProbability,
        dangerScore: data.dangerScore,
        cause: data.cause,
        confidence: data.confidence
      });

      // 💾 SAVE EVENT TO DATABASE
      await saveFireEvent({
        source: "CCTV Stream",
        label: data.label,
        fireProbability: data.fireProbability,
        dangerScore: data.dangerScore || 0,
        cause: data.cause || "N/A",
        confidence: data.confidence || 0,
        timestamp: new Date()
      });

      // 🔄 DASHBOARD REFRESH
      window.dispatchEvent(new CustomEvent("predictionUpdate"));

      // 🚨 ALERT
      if (data.label === "Fire") {
        await createAlert({
          source: "CCTV Monitoring",
          message: `🔥 Fire detected from CCTV! Cause: ${data.cause || "Unknown"}`
        });
      }
    } catch (err) {
      console.error("CCTV Prediction Error:", err);
      alert("Unable to analyze CCTV stream. Check URL or backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          CCTV Fire Monitoring
        </h1>
        <p className="text-gray-600">
          AI-based fire detection from CCTV / IP Webcam streams
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT PANEL */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-black rounded-lg aspect-video flex items-center justify-center border-4 border-gray-800 shadow-xl relative">
            <div className="text-gray-500 flex flex-col items-center">
              <Video className="w-16 h-16 mb-2 opacity-20" />
              <p>CCTV Stream (Analyzed on Server)</p>
            </div>

            {result?.label === "Fire" && (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 animate-pulse font-bold">
                <Flame className="w-5 h-5" /> FIRE DETECTED
              </div>
            )}
          </div>

          {/* INPUT + BUTTON */}
          <div className="flex gap-2">
            <input
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              placeholder="rtsp:// or http://<ip>:8080/shot.jpg"
              className="flex-1 border border-gray-300 p-3 rounded-lg outline-none"
            />
            <button
              onClick={captureFrame}
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-bold text-white transition flex items-center gap-2 ${
                loading
                  ? "bg-gray-400"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Camera />}
              {loading ? "Analyzing..." : "Analyze CCTV"}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-600" />
            Analysis Results
          </h2>

          {result ? (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-lg border-2 text-center ${
                  result.label === "Fire"
                    ? "bg-red-50 border-red-500 text-red-700"
                    : "bg-green-50 border-green-500 text-green-700"
                }`}
              >
                <p className="text-xs uppercase font-bold opacity-70">
                  Detection Status
                </p>
                <p className="text-2xl font-black">
                  {result.label.toUpperCase()}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">Fire Probability:</span>
                  <span className="font-bold">
                    {(result.fireProbability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">Cause:</span>
                  <span className="font-bold">
                    {result.cause || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">Danger Score:</span>
                  <span className="font-bold">
                    {result.dangerScore || 0}/100
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-center py-20">
              <WifiOff className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Enter CCTV stream URL and analyze</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CCTVMonitoring;
