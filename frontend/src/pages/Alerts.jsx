// import React, { useState, useEffect } from 'react';
// import { getUserAlerts, acknowledgeAlert, resolveAlert } from '../services/alertService';

// const Alerts = () => {
//   const [alerts, setAlerts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filter, setFilter] = useState('all'); // all, sent, acknowledged, resolved

//   const userId = localStorage.getItem('userId'); // Get from login session

//   useEffect(() => {
//     fetchAlerts();
//     // Poll for new alerts every 5 seconds
//     const interval = setInterval(fetchAlerts, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   const fetchAlerts = async () => {
//     try {
//       setLoading(true);
//       const data = await getUserAlerts(userId);
//       setAlerts(data);
//       setError(null);
//     } catch (err) {
//       setError('Failed to load alerts');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAcknowledge = async (alertId) => {
//     try {
//       await acknowledgeAlert(alertId);
//       setAlerts(alerts.map(a => 
//         a._id === alertId ? { ...a, status: 'acknowledged' } : a
//       ));
//     } catch (err) {
//       console.error('Error acknowledging alert:', err);
//     }
//   };

//   const handleResolve = async (alertId) => {
//     try {
//       await resolveAlert(alertId);
//       setAlerts(alerts.map(a => 
//         a._id === alertId ? { ...a, status: 'resolved' } : a
//       ));
//     } catch (err) {
//       console.error('Error resolving alert:', err);
//     }
//   };

//   const filteredAlerts = alerts.filter(alert => 
//     filter === 'all' ? true : alert.status === filter
//   );

//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'sent': return 'bg-red-100 border-red-500 text-red-900';
//       case 'acknowledged': return 'bg-yellow-100 border-yellow-500 text-yellow-900';
//       case 'resolved': return 'bg-green-100 border-green-500 text-green-900';
//       default: return 'bg-gray-100 border-gray-500 text-gray-900';
//     }
//   };

//   const getStatusBadge = (status) => {
//     switch(status) {
//       case 'sent': return '🚨 ACTIVE';
//       case 'acknowledged': return '⏱️ ACKNOWLEDGED';
//       case 'resolved': return '✅ RESOLVED';
//       default: return status;
//     }
//   };

//   if (loading && alerts.length === 0) {
//     return <div className="p-6 text-center">Loading alerts...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-800 mb-6">Fire Detection Alerts</h1>

//         {/* Filter Buttons */}
//         <div className="mb-6 flex gap-2 flex-wrap">
//           {['all', 'sent', 'acknowledged', 'resolved'].map(status => (
//             <button
//               key={status}
//               onClick={() => setFilter(status)}
//               className={`px-4 py-2 rounded-lg font-semibold transition ${
//                 filter === status
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//               }`}
//             >
//               {status.charAt(0).toUpperCase() + status.slice(1)}
//             </button>
//           ))}
//         </div>

//         {error && (
//           <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
//             {error}
//           </div>
//         )}

//         {filteredAlerts.length === 0 ? (
//           <div className="text-center p-8 bg-white rounded-lg shadow">
//             <p className="text-gray-600 text-lg">No {filter === 'all' ? '' : filter} alerts found</p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {filteredAlerts.map(alert => (
//               <div
//                 key={alert._id}
//                 className={`border-l-4 rounded-lg p-6 shadow transition ${getStatusColor(alert.status)}`}
//               >
//                 <div className="flex justify-between items-start mb-3">
//                   <div className="flex-1">
//                     <h3 className="text-xl font-bold mb-2">
//                       {alert.fireLocation}
//                     </h3>
//                     <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
//                       alert.status === 'sent' ? 'bg-red-500 text-white' :
//                       alert.status === 'acknowledged' ? 'bg-yellow-500 text-white' :
//                       'bg-green-500 text-white'
//                     }`}>
//                       {getStatusBadge(alert.status)}
//                     </span>
//                   </div>
//                   <span className="text-sm opacity-75">
//                     {new Date(alert.timestamp).toLocaleString()}
//                   </span>
//                 </div>

//                 <div className="my-4 text-sm space-y-1">
//                   <p><strong>Confidence:</strong> {(alert.confidence * 100).toFixed(2)}%</p>
//                   <p><strong>CCTV Footage:</strong> {alert.cctvFootage}</p>
//                 </div>

//                 <p className="my-4 whitespace-pre-wrap text-sm">{alert.message}</p>

//                 <div className="flex gap-3 mt-4">
//                   {alert.status === 'sent' && (
//                     <>
//                       <button
//                         onClick={() => handleAcknowledge(alert._id)}
//                         className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition font-semibold"
//                       >
//                         Acknowledge
//                       </button>
//                       <button
//                         onClick={() => handleResolve(alert._id)}
//                         className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition font-semibold"
//                       >
//                         Resolve
//                       </button>
//                     </>
//                   )}
//                   {alert.status === 'acknowledged' && (
//                     <button
//                       onClick={() => handleResolve(alert._id)}
//                       className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition font-semibold"
//                     >
//                       Mark as Resolved
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Alerts;




// import React, { useState, useEffect } from 'react';
// import { AlertCircle, Check, X, Clock } from 'lucide-react';
// import axios from 'axios';

// const Alerts = () => {
//   const [alerts, setAlerts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filter, setFilter] = useState('all');
//   const [userId, setUserId] = useState(null);
//   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

//   // ⭐ Get userId from localStorage on component mount
//   useEffect(() => {
//     const storedUserId = localStorage.getItem('userId');
//     console.log('📋 Retrieved userId from localStorage:', storedUserId);
    
//     if (!storedUserId) {
//       setError('❌ User not logged in. Please login first.');
//       setLoading(false);
//       return;
//     }
    
//     setUserId(storedUserId);
//   }, []);

//   // ⭐ Fetch alerts when userId is available
//   useEffect(() => {
//     if (!userId) return;

//     const fetchAlerts = async () => {
//       try {
//         console.log(`🔍 Fetching alerts for userId: ${userId}`);
//         setLoading(true);
        
//         const response = await axios.get(
//           `${API_URL}/fire-alerts/user/${userId}`,
//           { timeout: 10000 }
//         );
        
//         console.log('✅ Alerts fetched:', response.data);
//         setAlerts(response.data.data || []);
//         setError(null);
//       } catch (err) {
//         console.error('❌ Error fetching alerts:', err);
//         setError(`Failed to load alerts: ${err.message}`);
//         setAlerts([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     // Initial fetch
//     fetchAlerts();

//     // Poll every 10 seconds (not 5 to reduce server load)
//     const interval = setInterval(fetchAlerts, 10000);
    
//     return () => clearInterval(interval);
//   }, [userId, API_URL]);

//   // ⭐ Handle acknowledge alert
//   const handleAcknowledge = async (alertId) => {
//     try {
//       const response = await axios.put(
//         `${API_URL}/fire-alerts/${alertId}/acknowledge`
//       );
      
//       console.log('✅ Alert acknowledged:', response.data);
      
//       // Update local state
//       setAlerts(alerts.map(a => 
//         a._id === alertId ? { ...a, status: 'acknowledged' } : a
//       ));
//     } catch (err) {
//       console.error('❌ Error acknowledging alert:', err);
//       alert('Failed to acknowledge alert');
//     }
//   };

//   // ⭐ Handle resolve alert
//   const handleResolve = async (alertId) => {
//     try {
//       const response = await axios.put(
//         `${API_URL}/fire-alerts/${alertId}/resolve`
//       );
      
//       console.log('✅ Alert resolved:', response.data);
      
//       // Update local state
//       setAlerts(alerts.map(a => 
//         a._id === alertId ? { ...a, status: 'resolved' } : a
//       ));
//     } catch (err) {
//       console.error('❌ Error resolving alert:', err);
//       alert('Failed to resolve alert');
//     }
//   };

//   // Filter alerts
//   const filteredAlerts = alerts.filter(alert => 
//     filter === 'all' ? true : alert.status === filter
//   );

//   // Status colors
//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'sent': return 'bg-red-50 border-red-200 text-red-900';
//       case 'acknowledged': return 'bg-yellow-50 border-yellow-200 text-yellow-900';
//       case 'resolved': return 'bg-green-50 border-green-200 text-green-900';
//       default: return 'bg-gray-50 border-gray-200 text-gray-900';
//     }
//   };

//   const getStatusBadge = (status) => {
//     switch(status) {
//       case 'sent': 
//         return <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
//           🚨 ACTIVE
//         </span>;
//       case 'acknowledged': 
//         return <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
//           ⏱️ ACKNOWLEDGED
//         </span>;
//       case 'resolved': 
//         return <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
//           ✅ RESOLVED
//         </span>;
//       default: return null;
//     }
//   };

//   // ⭐ Not logged in
//   if (error && !userId) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6">
//         <div className="max-w-4xl mx-auto">
//           <h1 className="text-3xl font-bold text-gray-800 mb-6">Fire Detection Alerts</h1>
          
//           <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded text-red-700">
//             <div className="flex items-center gap-3">
//               <AlertCircle className="w-6 h-6" />
//               <div>
//                 <p className="font-bold text-lg">{error}</p>
//                 <p className="text-sm mt-1">Please go back to login and then return to this page.</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ⭐ Loading state
//   if (loading && alerts.length === 0) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6">
//         <div className="max-w-4xl mx-auto">
//           <h1 className="text-3xl font-bold text-gray-800 mb-6">Fire Detection Alerts</h1>
//           <div className="text-center p-12 bg-white rounded-lg shadow">
//             <div className="inline-block animate-spin">
//               <AlertCircle className="w-8 h-8 text-blue-600" />
//             </div>
//             <p className="text-gray-600 mt-4">Loading alerts...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-4xl mx-auto">
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold text-gray-800">Fire Detection Alerts</h1>
//           <p className="text-gray-600 text-sm mt-1">
//             Logged in as: <span className="font-semibold">{localStorage.getItem('userName') || 'User'}</span>
//           </p>
//         </div>

//         {/* ⭐ Error message if any */}
//         {error && userId && (
//           <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-3">
//             <AlertCircle className="w-5 h-5 flex-shrink-0" />
//             <p>{error}</p>
//           </div>
//         )}

//         {/* Filter Buttons */}
//         <div className="mb-6 flex gap-2 flex-wrap">
//           {['all', 'sent', 'acknowledged', 'resolved'].map(status => (
//             <button
//               key={status}
//               onClick={() => setFilter(status)}
//               className={`px-4 py-2 rounded-lg font-semibold transition ${
//                 filter === status
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//               }`}
//             >
//               {status === 'sent' ? '🚨 ' : status === 'acknowledged' ? '⏱️ ' : status === 'resolved' ? '✅ ' : ''}
//               {status.charAt(0).toUpperCase() + status.slice(1)}
//               {alerts.filter(a => a.status === status).length > 0 && (
//                 <span className="ml-2 text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
//                   {alerts.filter(a => a.status === status).length}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>

//         {/* Alerts List */}
//         {filteredAlerts.length === 0 ? (
//           <div className="text-center p-12 bg-white rounded-lg shadow">
//             <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
//             <p className="text-gray-600 text-lg">
//               {filter === 'all' 
//                 ? 'No alerts yet. System is safe! ✅' 
//                 : `No ${filter} alerts`}
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {filteredAlerts.map(alert => (
//               <div
//                 key={alert._id}
//                 className={`border-l-4 rounded-lg p-6 shadow transition ${getStatusColor(alert.status)}`}
//               >
//                 <div className="flex justify-between items-start mb-4">
//                   <div className="flex-1">
//                     <h3 className="text-xl font-bold mb-2">
//                       📍 {alert.fireLocation || 'Unknown Location'}
//                     </h3>
//                     <div className="flex gap-2 items-center flex-wrap">
//                       {getStatusBadge(alert.status)}
//                     </div>
//                   </div>
//                   <span className="text-sm opacity-75 text-right">
//                     {new Date(alert.timestamp).toLocaleString()}
//                   </span>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4 my-4 text-sm">
//                   <div className="bg-white bg-opacity-50 p-3 rounded">
//                     <p className="text-xs opacity-75">Confidence</p>
//                     <p className="text-lg font-bold">
//                       {(alert.confidence * 100).toFixed(1)}%
//                     </p>
//                   </div>
//                   <div className="bg-white bg-opacity-50 p-3 rounded">
//                     <p className="text-xs opacity-75">CCTV Footage</p>
//                     <p className="text-sm font-semibold">{alert.cctvFootage}</p>
//                   </div>
//                 </div>

//                 {alert.message && (
//                   <div className="my-4 p-4 bg-white bg-opacity-50 rounded text-sm whitespace-pre-wrap">
//                     {alert.message}
//                   </div>
//                 )}

//                 {/* Timestamps */}
//                 <div className="text-xs opacity-75 space-y-1 mb-4">
//                   {alert.acknowledgedAt && (
//                     <p>✓ Acknowledged: {new Date(alert.acknowledgedAt).toLocaleString()}</p>
//                   )}
//                   {alert.resolvedAt && (
//                     <p>✓ Resolved: {new Date(alert.resolvedAt).toLocaleString()}</p>
//                   )}
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex gap-3 mt-4">
//                   {alert.status === 'sent' && (
//                     <>
//                       <button
//                         onClick={() => handleAcknowledge(alert._id)}
//                         className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition font-semibold flex items-center gap-2"
//                       >
//                         <Clock className="w-4 h-4" /> Acknowledge
//                       </button>
//                       <button
//                         onClick={() => handleResolve(alert._id)}
//                         className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition font-semibold flex items-center gap-2"
//                       >
//                         <Check className="w-4 h-4" /> Resolve
//                       </button>
//                     </>
//                   )}
//                   {alert.status === 'acknowledged' && (
//                     <button
//                       onClick={() => handleResolve(alert._id)}
//                       className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition font-semibold flex items-center gap-2"
//                     >
//                       <Check className="w-4 h-4" /> Mark as Resolved
//                     </button>
//                   )}
//                   {alert.status === 'resolved' && (
//                     <span className="px-4 py-2 bg-green-500 text-white rounded font-semibold flex items-center gap-2">
//                       <Check className="w-4 h-4" /> Resolved
//                     </span>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Alerts;



import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, Clock } from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [userId, setUserId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [newAlertSound, setNewAlertSound] = useState(null);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

  // ⭐ Get userId from localStorage on component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    console.log('📋 Retrieved userId from localStorage:', storedUserId);
    
    if (!storedUserId) {
      setError('❌ User not logged in. Please login first.');
      setLoading(false);
      return;
    }
    
    setUserId(storedUserId);
  }, []);

  // ⭐ Initialize Socket.io connection when userId is available
  useEffect(() => {
    if (!userId) return;

    console.log('🔌 Connecting to Socket.io server...');
    
    const newSocket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket.io connected');
      // Join the user's alerts room
      newSocket.emit('join-alerts', userId);
    });

    newSocket.on('alert-status', (data) => {
      console.log('📡 Alert connection status:', data);
    });

    // ⭐ Listen for NEW FIRE ALERTS (real-time)
    newSocket.on('new-fire-alert', (alert) => {
      console.log('🚨 NEW FIRE ALERT RECEIVED:', alert);
      
      // Add alert to top of list
      setAlerts(prevAlerts => [alert, ...prevAlerts]);
      
      // Play sound notification
      playAlertSound();
      
      // Show browser notification
      showBrowserNotification(alert);
    });

    // ⭐ Listen for ALERT ACKNOWLEDGED
    newSocket.on('alert-acknowledged', (data) => {
      console.log('⏱️ Alert acknowledged:', data);
      setAlerts(prevAlerts =>
        prevAlerts.map(a =>
          a._id === data.alertId
            ? { ...a, status: 'acknowledged', acknowledgedAt: data.acknowledgedAt }
            : a
        )
      );
    });

    // ⭐ Listen for ALERT RESOLVED
    newSocket.on('alert-resolved', (data) => {
      console.log('✅ Alert resolved:', data);
      setAlerts(prevAlerts =>
        prevAlerts.map(a =>
          a._id === data.alertId
            ? { ...a, status: 'resolved', resolvedAt: data.resolvedAt }
            : a
        )
      );
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket.io disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-alerts', userId);
      newSocket.disconnect();
    };
  }, [userId, SOCKET_URL]);

  // ⭐ Fetch initial alerts when userId is available
  useEffect(() => {
    if (!userId) return;

    const fetchAlerts = async () => {
      try {
        console.log(`🔍 Fetching initial alerts for userId: ${userId}`);
        setLoading(true);
        
        const response = await axios.get(
          `${API_URL}/fire-alerts/user/${userId}`,
          { timeout: 10000 }
        );
        
        console.log('✅ Initial alerts fetched:', response.data);
        setAlerts(response.data.data || []);
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching alerts:', err);
        setError(`Failed to load alerts: ${err.message}`);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [userId, API_URL]);

  // ⭐ Play alert sound
  const playAlertSound = () => {
    // Using Web Audio API for a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  // ⭐ Show browser notification
  const showBrowserNotification = (alert) => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('🚨 Fire Detected!', {
          body: `Fire detected at ${alert.fireLocation}\nConfidence: ${(alert.confidence * 100).toFixed(1)}%`,
          icon: '🔥',
          requireInteraction: true,
        });
      }
    }
  };

  // ⭐ Handle acknowledge alert
  const handleAcknowledge = async (alertId) => {
    try {
      const response = await axios.put(
        `${API_URL}/fire-alerts/${alertId}/acknowledge`
      );
      
      console.log('✅ Alert acknowledged:', response.data);
      
      // Update local state
      setAlerts(alerts.map(a => 
        a._id === alertId ? { ...a, status: 'acknowledged' } : a
      ));
    } catch (err) {
      console.error('❌ Error acknowledging alert:', err);
      alert('Failed to acknowledge alert');
    }
  };

  // ⭐ Handle resolve alert
  const handleResolve = async (alertId) => {
    try {
      const response = await axios.put(
        `${API_URL}/fire-alerts/${alertId}/resolve`
      );
      
      console.log('✅ Alert resolved:', response.data);
      
      // Update local state
      setAlerts(alerts.map(a => 
        a._id === alertId ? { ...a, status: 'resolved' } : a
      ));
    } catch (err) {
      console.error('❌ Error resolving alert:', err);
      alert('Failed to resolve alert');
    }
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' ? true : alert.status === filter
  );

  // Status colors
  const getStatusColor = (status) => {
    switch(status) {
      case 'sent': return 'bg-red-50 border-red-200 text-red-900';
      case 'acknowledged': return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'resolved': return 'bg-green-50 border-green-200 text-green-900';
      default: return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'sent': 
        return <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold animate-pulse flex items-center gap-1">
          🚨 ACTIVE
        </span>;
      case 'acknowledged': 
        return <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
          ⏱️ ACKNOWLEDGED
        </span>;
      case 'resolved': 
        return <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
          ✅ RESOLVED
        </span>;
      default: return null;
    }
  };

  // ⭐ Not logged in
  if (error && !userId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Fire Detection Alerts</h1>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded text-red-700">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6" />
              <div>
                <p className="font-bold text-lg">{error}</p>
                <p className="text-sm mt-1">Please go back to login and then return to this page.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ⭐ Loading state
  if (loading && alerts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Fire Detection Alerts</h1>
          <div className="text-center p-12 bg-white rounded-lg shadow">
            <div className="inline-block animate-spin">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-600 mt-4">Loading alerts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🚨 Fire Detection Alerts</h1>
          <div className="flex justify-between items-center mt-2">
            <p className="text-gray-600 text-sm">
              Logged in as: <span className="font-semibold">{localStorage.getItem('userName') || 'User'}</span>
            </p>
            <div className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${socket ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span className="text-xs text-gray-600">{socket ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>

        {/* Error message if any */}
        {error && userId && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {['all', 'sent', 'acknowledged', 'resolved'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status === 'sent' ? '🚨 ' : status === 'acknowledged' ? '⏱️ ' : status === 'resolved' ? '✅ ' : ''}
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {alerts.filter(a => a.status === status).length > 0 && (
                <span className="ml-2 text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                  {alerts.filter(a => a.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        {filteredAlerts.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-lg shadow">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 text-lg">
              {filter === 'all' 
                ? 'No alerts yet. System is safe! ✅' 
                : `No ${filter} alerts`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map(alert => (
              <div
                key={alert._id}
                className={`border-l-4 rounded-lg p-6 shadow transition ${getStatusColor(alert.status)}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">
                      📍 {alert.fireLocation || 'Unknown Location'}
                    </h3>
                    <div className="flex gap-2 items-center flex-wrap">
                      {getStatusBadge(alert.status)}
                    </div>
                  </div>
                  <span className="text-sm opacity-75 text-right">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 my-4 text-sm">
                  <div className="bg-white bg-opacity-50 p-3 rounded">
                    <p className="text-xs opacity-75">Confidence</p>
                    <p className="text-lg font-bold">
                      {(alert.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-50 p-3 rounded">
                    <p className="text-xs opacity-75">CCTV Footage</p>
                    <p className="text-sm font-semibold">{alert.cctvFootage}</p>
                  </div>
                </div>

                {alert.message && (
                  <div className="my-4 p-4 bg-white bg-opacity-50 rounded text-sm whitespace-pre-wrap">
                    {alert.message}
                  </div>
                )}

                {/* Timestamps */}
                <div className="text-xs opacity-75 space-y-1 mb-4">
                  {alert.acknowledgedAt && (
                    <p>✓ Acknowledged: {new Date(alert.acknowledgedAt).toLocaleString()}</p>
                  )}
                  {alert.resolvedAt && (
                    <p>✓ Resolved: {new Date(alert.resolvedAt).toLocaleString()}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  {alert.status === 'sent' && (
                    <>
                      <button
                        onClick={() => handleAcknowledge(alert._id)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition font-semibold flex items-center gap-2"
                      >
                        <Clock className="w-4 h-4" /> Acknowledge
                      </button>
                      <button
                        onClick={() => handleResolve(alert._id)}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition font-semibold flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" /> Resolve
                      </button>
                    </>
                  )}
                  {alert.status === 'acknowledged' && (
                    <button
                      onClick={() => handleResolve(alert._id)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition font-semibold flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Mark as Resolved
                    </button>
                  )}
                  {alert.status === 'resolved' && (
                    <span className="px-4 py-2 bg-green-500 text-white rounded font-semibold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Resolved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;