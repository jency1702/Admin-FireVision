// import React from 'react';
// import { Bell, MessageSquare, Clock, AlertCircle } from 'lucide-react';
// import { format } from 'date-fns';

// const AlertList = ({ alerts }) => {
//   const getSourceIcon = (source) => {
//     switch (source.toLowerCase()) {
//       case 'cctv':
//         return <AlertCircle className="w-5 h-5 text-red-500" />;
//       case 'manual':
//         return <MessageSquare className="w-5 h-5 text-blue-500" />;
//       default:
//         return <Bell className="w-5 h-5 text-orange-500" />;
//     }
//   };

//   const formatTimestamp = (timestamp) => {
//     try {
//       if (timestamp?.seconds) {
//         return format(new Date(timestamp.seconds * 1000), 'MMM dd, yyyy HH:mm:ss');
//       }
//       return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
//     } catch (error) {
//       return timestamp;
//     }
//   };

//   if (!alerts || alerts.length === 0) {
//     return (
//       <div className="text-center py-12 bg-gray-50 rounded-lg">
//         <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//         <p className="text-gray-500 text-lg">No alerts yet</p>
//         <p className="text-gray-400 text-sm mt-2">SMS alerts will appear here when fires are detected</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-3">
//       {alerts.map((alert, index) => (
//         <div 
//           key={alert.id || index} 
//           className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border-l-4 border-orange-500"
//         >
//           <div className="flex items-start gap-4">
//             <div className="flex-shrink-0 mt-1">
//               {getSourceIcon(alert.source)}
//             </div>

//             <div className="flex-1 min-w-0">
//               <div className="flex items-start justify-between gap-2">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2 mb-1">
//                     <span className="font-semibold text-gray-900">{alert.source}</span>
//                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
//                       alert.source === 'CCTV' 
//                         ? 'bg-red-100 text-red-700' 
//                         : 'bg-blue-100 text-blue-700'
//                     }`}>
//                       {alert.source}
//                     </span>
//                   </div>
//                   <p className="text-gray-700 text-sm leading-relaxed">{alert.message}</p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-1 text-gray-500 text-xs mt-2">
//                 <Clock className="w-3 h-3" />
//                 {formatTimestamp(alert.timestamp || alert.time)}
//               </div>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default AlertList;



import React, { useState, useEffect } from 'react';
import { Bell, Flame, X, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const AlertList = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // ⭐ FETCH ALERTS ON MOUNT AND SET UP POLLING
  useEffect(() => {
    fetchAlerts();
    
    // Poll for new alerts every 5 seconds
    const interval = setInterval(fetchAlerts, 5000);

    // Listen for custom events from CCTV component
    const handlePredictionUpdate = () => {
      console.log('📡 Prediction update event received, refreshing alerts...');
      fetchAlerts();
    };

    window.addEventListener('predictionUpdate', handlePredictionUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('predictionUpdate', handlePredictionUpdate);
    };
  }, []);

  // ⭐ FETCH ALERTS FROM BACKEND
  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${API_URL}/fire-alerts/recent`);
      const data = await response.json();

      if (data.success && data.data?.alerts) {
        setAlerts(data.data.alerts);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch alerts');
      }
    } catch (err) {
      console.error('❌ Error fetching alerts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ DELETE ALERT
  const deleteAlert = async (alertId) => {
    try {
      const response = await fetch(`${API_URL}/fire-alerts/${alertId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setAlerts(alerts.filter((alert) => alert.id !== alertId));
        console.log(`✅ Alert ${alertId} deleted`);
      }
    } catch (error) {
      console.error('❌ Error deleting alert:', error);
    }
  };

  // ⭐ FORMAT TIMESTAMP
  const formatTimestamp = (timestamp) => {
    try {
      if (!timestamp) return 'N/A';

      // Handle Firestore Timestamp object
      if (timestamp?.toDate) {
        return format(timestamp.toDate(), 'MMM dd, yyyy HH:mm:ss');
      }

      // Handle seconds property (Firestore format)
      if (timestamp?.seconds) {
        return format(new Date(timestamp.seconds * 1000), 'MMM dd, yyyy HH:mm:ss');
      }

      // Handle Date object or string
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
    } catch {
      return timestamp?.toString?.() || 'Invalid date';
    }
  };

  // ⭐ GET CONFIDENCE COLOR
  const getConfidenceColor = (confidence) => {
    if (!confidence) return 'text-gray-500';
    const confValue = typeof confidence === 'number' ? confidence : parseFloat(confidence);
    if (confValue >= 0.9) return 'text-red-600 font-bold';
    if (confValue >= 0.7) return 'text-orange-600';
    return 'text-yellow-600';
  };

  // ⭐ EMPTY STATE
  if (!loading && alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-100">
        <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <h3 className="text-gray-500 font-semibold mb-2">No Fire Alerts Yet</h3>
        <p className="text-gray-400 text-sm">
          SMS alerts will appear here when fires are detected by CCTV monitoring
        </p>
      </div>
    );
  }

  // ⭐ LOADING STATE
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-100">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-orange-600 mb-2" />
        <p className="text-gray-500">Loading alerts...</p>
      </div>
    );
  }

  // ⭐ ERROR STATE
  if (error) {
    return (
      <div className="bg-red-50 rounded-lg shadow-md p-6 border border-red-200">
        <h3 className="text-red-700 font-semibold mb-2">⚠️ Error Loading Alerts</h3>
        <p className="text-red-600 text-sm mb-3">{error}</p>
        <button
          onClick={fetchAlerts}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-red-600" />
          Fire Alerts ({alerts.length})
        </h2>
        <button
          onClick={fetchAlerts}
          className="px-3 py-1 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
        >
          Refresh
        </button>
      </div>

      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg border-l-4 transition ${
            alert.source === 'CCTV'
              ? 'bg-red-50 border-red-500 shadow-md'
              : 'bg-yellow-50 border-yellow-500'
          }`}
        >
          {/* ALERT HEADER */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                alert.source === 'CCTV' ? 'bg-red-100' : 'bg-yellow-100'
              }`}>
                <Flame className={`w-5 h-5 ${
                  alert.source === 'CCTV' ? 'text-red-600' : 'text-yellow-600'
                }`} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  🚨 {alert.fireLocation || 'CCTV Alert'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Source: <span className="font-semibold">{alert.source || 'CCTV'}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => deleteAlert(alert.id)}
              className="text-gray-400 hover:text-red-600 transition p-1"
              title="Delete alert"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* ALERT DETAILS */}
          <div className="space-y-2 text-sm mb-3 ml-11">
            {alert.message && (
              <p className="text-gray-800 font-medium">{alert.message}</p>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-600">Confidence</p>
                <p className={`font-bold ${getConfidenceColor(alert.confidence)}`}>
                  {alert.confidence ? `${(alert.confidence * 100).toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Fire Type</p>
                <p className="font-semibold text-gray-900">{alert.cause || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-gray-600">Danger Score</p>
                <p className="font-bold text-orange-600">{alert.dangerScore || 0}/10</p>
              </div>
              <div>
                <p className="text-gray-600">CCTV Source</p>
                <p className="font-semibold text-gray-900">{alert.cctvFootage || 'CCTV-001'}</p>
              </div>
            </div>

            {/* EMAILS SENT INFO */}
            {alert.emailsSent && alert.emailsSent.length > 0 && (
              <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                <p className="text-green-700 font-semibold text-xs mb-1">
                  ✅ Alert sent to {alert.emailsSent.length} users:
                </p>
                <div className="flex flex-wrap gap-1">
                  {alert.emailsSent.map((email, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                    >
                      {email}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* TIMESTAMP */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200 ml-11">
            <span>⏰ {formatTimestamp(alert.timestamp)}</span>
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
              ACTIVE
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertList;