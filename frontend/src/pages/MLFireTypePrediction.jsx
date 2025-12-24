


import { useState, useEffect } from 'react';
import { Loader2, Database } from 'lucide-react';
import {
  predictFireTypeML,
  saveMLPrediction,
  getMLPredictions
} from '../services/mlApi';

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

  // 🔥 NEW STATES
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

   
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getMLPredictions();
      setHistory(data.data || data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };
  const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString(); 
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? '' : parseFloat(value)
    }));
  };

  const downloadPDF = async () => {
  const today = new Date().toISOString().split('T')[0];  
  if (!fromDate || !toDate) {
    alert("Select date range");
    return;
  }
  if (toDate > today || fromDate > today) {
    alert("The 'To Date' cannot be in the future.");
    return;
  }
  if (fromDate > toDate) {
    alert("'From Date' cannot be later than 'To Date'");
    return;
  }
  const filtered = history.filter((h) => {
    const d = new Date(h.createdAt).toISOString().split('T')[0];
    return d >= fromDate && d <= toDate;
  });
  if (filtered.length === 0) {
    alert("No records found for the selected date range.");
    return;
  }

  try {
    const res = await fetch("http://localhost:5001/download/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: fromDate,
        endDate: toDate,
        records: filtered
      })
    });

    if (!res.ok) throw new Error("Failed to generate PDF");

    // 🔥 THE FIX: Get the response as a BLOB, not JSON
    const blob = await res.blob();
    
    // Create a local URL for the binary data
    const url = window.URL.createObjectURL(blob);
    
    // Create a hidden link and click it to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Fire_Report_${fromDate}_to_${toDate}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Download error:", error);
    alert("Error downloading PDF. Check if the backend is running.");
  }
};


  // ---------------- ML PREDICTION ----------------

  const predictFireType = async () => {
    setLoading(true);
    try {
      const submissionData = Object.fromEntries(
        Object.entries(formData).map(([k, v]) => [k, v === '' ? 0 : v])
      );

      const mlResult = await predictFireTypeML(submissionData);

      setPrediction({
        type: mlResult.prediction,
        confidence: mlResult.confidence
      });

      await saveMLPrediction({
        ...submissionData,
        prediction: mlResult.prediction
      });

      fetchHistory();
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- HISTORY CLICK → PHI-3 ----------------

  const handleHistoryClick = async (item) => {
    setSelectedHistory(item);
    setAiExplanation('');
    setLoadingAI(true);

    try {
      const res = await fetch('http://localhost:5001/explain/fire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });

      const data = await res.json();
      setAiExplanation(data.aiExplanation);
    } catch (error) {
      console.error('AI explanation failed:', error);
      setAiExplanation('Failed to generate explanation.');
    } finally {
      setLoadingAI(false);
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
      Other: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[type] || colors.Other;
  };

  return (
    <div className="space-y-6 bg-gray-50 p-4 min-h-screen">
      <h1 className="text-3xl font-bold">ML Fire Type Prediction</h1>

      {/* ---------------- INPUT + RESULT ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-6">Input Parameters</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <label className="block text-sm font-semibold mb-2 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <input
                  type="number"
                  name={key}
                  value={formData[key]}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            ))}
          </div>

          <button
            onClick={predictFireType}
            disabled={loading}
            className={`w-full mt-6 py-3 rounded-lg font-semibold text-white ${
              loading ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {loading ? 'Predicting...' : 'Predict Fire Type'}
          </button>
        </div>

        {/* Result */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-6">Current Result</h2>

          {!prediction && (
            <div className="text-gray-400 text-center">
              <Database className="mx-auto w-16 h-16 mb-4" />
              Enter parameters to predict
            </div>
          )}

          {prediction && (
            <div
              className={`p-6 rounded-lg border-2 ${getFireTypeColor(
                prediction.type
              )} text-center`}
            >
              <p className="text-sm font-semibold mb-2">Predicted Fire Type</p>
              <p className="text-3xl font-bold">{prediction.type}</p>
              <p className="mt-2 text-sm">
                Confidence: {prediction.confidence.toFixed(2)}%
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 items-end mb-6">
  <div>
    <label className="text-sm font-semibold">From Date   </label>
    <input
      type="date"
      value={fromDate}
      max={new Date().toISOString().split("T")[0]}// Prevents future selection
      onChange={(e) => setFromDate(e.target.value)}
      className="border px-3 py-2 rounded"
    />
  </div>

  <div>
    <label className="text-sm font-semibold">To Date   </label>
    <input
      type="date"
      value={toDate}
      max={new Date().toISOString().split("T")[0]}
      onChange={(e) => setToDate(e.target.value)}
      className="border px-3 py-2 rounded"
    />
  </div>

  <button
    onClick={downloadPDF}
    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
  >
    Download PDF
  </button>
</div>


      {/* ---------------- HISTORY TABLE ---------------- */}
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          
          Prediction History 
        </h2>

        {loadingHistory ? (
          <Loader2 className="animate-spin mx-auto" />
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th>Date</th>
                <th>Prediction</th>
                <th>NDVI</th>
                <th>Brightness</th>
                <th>T31</th>
                <th>Temp</th>
                <th>Hum</th>
                <th>Wind</th>
              </tr>
            </thead>
            <tbody>
              {history
                .slice()
                .reverse()
                .map((item, i) => (
                  <tr
                    key={i}
                    onClick={() => handleHistoryClick(item)}
                    className="cursor-pointer hover:bg-gray-100 border-b"
                  >
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>{item.prediction}</td>
                    <td>{item.ndvi}</td>
                    <td>{item.brightness}</td>
                    <td>{item.t31}</td>
                    <td>{item.temperature}</td>
                    <td>{item.humidity}</td>
                    <td>{item.windSpeed}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ---------------- DETAILS ---------------- */}
      {selectedHistory && (
        <div className="bg-white p-6 rounded-lg border space-y-3">
          <h3 className="text-xl font-bold">Prediction Details</h3>
           {/* ✅ DATE & TIME */}
    <p className="text-sm text-gray-500">
      <b>Date:</b> {formatDateTime(selectedHistory.createdAt)}
    </p>
          <p><b>Fire Type:</b> {selectedHistory.prediction}</p>
          <p><b>NDVI:</b> {selectedHistory.ndvi}</p>
          <p><b>Brightness:</b> {selectedHistory.brightness}</p>
          <p><b>Temperature:</b> {selectedHistory.temperature}</p>
          <p><b>Humidity:</b> {selectedHistory.humidity}</p>
          <p><b>Wind Speed:</b> {selectedHistory.windSpeed}</p>

          <hr />

          <h4 className="font-semibold">Explanation</h4>

          {loadingAI ? (
            <p>Generating explanation...</p>
          ) : (
            <p className="text-sm whitespace-pre-line">{aiExplanation}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MLFireTypePrediction;
