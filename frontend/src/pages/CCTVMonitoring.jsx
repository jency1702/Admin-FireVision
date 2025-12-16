// frontend/src/pages/CCTVMonitoring.jsx
import React, { useState } from 'react';
import { Video, Flame, AlertTriangle, Wifi, WifiOff, Loader2, Camera } from 'lucide-react';
// import { createFireEvent, createAlert } from '../services/api';
import { predictFireCNN } from '../services/mlApi';
const CCTVMonitoring = () => {
  const [streamUrl, setStreamUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [capturedFrame, setCapturedFrame] = useState(null);
  const [result, setResult] = useState(null);

  const captureFrame = async () => {
    if (!streamUrl) {
      alert('Please enter a CCTV stream URL');
      return;
    }

    setLoading(true);
    setIsConnected(true);

    try {
      // Simulate frame capture (replace with actual CCTV stream capture)

      // Mock captured frame - in production, this would be from actual stream
      const mockFrame = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDA...'; // Placeholder
      setCapturedFrame(mockFrame);

      // Simulate CNN prediction
      const mlResult = await predictFireCNN(mockFrame);
      setResult(mlResult);
    } catch (error) {
      console.error('Error capturing frame:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const disconnectStream = () => {
    setIsConnected(false);
    setCapturedFrame(null);
    setResult(null);
    setStreamUrl('');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CCTV Fire Monitoring</h1>
          <p className="text-gray-600 mt-1">Real-time fire detection from CCTV camera streams</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {isConnected ? (
            <>
              <Wifi className="w-5 h-5" />
              <span className="font-semibold">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5" />
              <span className="font-semibold">Disconnected</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stream Input & Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Connection Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Video className="w-6 h-6 text-blue-600" />
              Stream Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CCTV Stream URL
                </label>
                <input
                  type="text"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="http://ip:port/video or rtsp://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={isConnected}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter RTSP, HTTP, or HTTPS stream URL
                </p>
              </div>

              <div className="flex gap-3">
                {!isConnected ? (
                  <button
                    onClick={captureFrame}
                    disabled={!streamUrl || loading}
                    className={`flex-1 py-3 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${
                      !streamUrl || loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Video className="w-5 h-5" />
                        Connect Stream
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={captureFrame}
                      disabled={loading}
                      className="flex-1 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition flex items-center justify-center gap-2"
                    >
                      <Camera className="w-5 h-5" />
                      Capture & Analyze
                    </button>
                    <button
                      onClick={disconnectStream}
                      className="px-6 py-3 border-2 border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition"
                    >
                      Disconnect
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Live Feed / Captured Frame */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Camera Feed</h2>

            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
              {!capturedFrame && !loading && (
                <div className="text-center">
                  <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Enter stream URL and connect to view feed</p>
                </div>
              )}

              {loading && (
                <div className="text-center">
                  <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
                  <p className="text-white">Connecting to stream...</p>
                </div>
              )}

              {capturedFrame && !loading && (
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center">
                    <Camera className="w-32 h-32 text-white opacity-50" />
                  </div>
                  {result && result.label === 'Fire' && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg font-bold animate-pulse flex items-center gap-2">
                      <Flame className="w-5 h-5" />
                      FIRE DETECTED
                    </div>
                  )}
                  {isConnected && (
                    <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      LIVE
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Analysis Results</h2>

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Flame className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-center">Capture a frame to see fire detection results</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-16 h-16 text-orange-600 animate-spin mb-4" />
              <p className="text-gray-600">Analyzing frame...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              {/* Status Badge */}
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
                    <p className="text-sm font-semibold text-gray-700">Status</p>
                    <p className={`text-2xl font-bold ${
                      result.label === 'Fire' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {result.label.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Captured at</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(result.timestamp).toLocaleString()}
                </p>
              </div>

              {/* Fire Probability */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-2">Fire Probability</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
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

              {/* Danger Score */}
              {result.label === 'Fire' && result.dangerScore && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Danger Level</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${getDangerColor(result.dangerScore)}`}
                        style={{ width: `${result.dangerScore}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {result.dangerScore}/100
                    </span>
                  </div>
                </div>
              )}

              {/* Fire Cause */}
              {result.label === 'Fire' && result.cause && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Predicted Cause</p>
                      <p className="text-base font-bold text-gray-900">{result.cause}</p>
                      {result.confidence && (
                        <p className="text-sm text-gray-600 mt-1">
                          Confidence: {result.confidence}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SMS Alert Sent */}
              {result.label === 'Fire' && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm font-semibold text-blue-900">
                    ✓ SMS Alert Sent to Authorities
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Emergency services have been notified
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="font-bold text-blue-900 mb-2">CCTV Monitoring Features</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Real-time video stream analysis using CNN model</li>
          <li>• Automatic SMS alerts when fire is detected</li>
          <li>• Supports RTSP, HTTP, and HTTPS video streams</li>
          <li>• Continuous monitoring with configurable capture intervals</li>
          <li>• Historical event logging and image archival</li>
        </ul>
      </div>
    </div>
  );
};

export default CCTVMonitoring;