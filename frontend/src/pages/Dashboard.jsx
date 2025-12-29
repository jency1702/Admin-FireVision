

// import React, { useState, useEffect } from 'react';
// import { Database, Cpu, Video, RefreshCw, Activity } from 'lucide-react';
// import { getFireEvents, getMLPredictions } from '../services/api';
// import StatCard from '../components/StatCard';
// import LoadingSpinner from '../components/LoadingSpinner';
// import GeminiChatbot from '../components/GeminiChatbot';

// const Dashboard = () => {
//   const [loading, setLoading] = useState(true);
//   const [counts, setCounts] = useState({ total: 0, cnnFire: 0, cctvFire: 0, mlCount: 0 });

//   useEffect(() => {
//     loadData();
//     const interval = setInterval(loadData, 5000);

//     const handlePredictionUpdate = () => loadData();
//     window.addEventListener('predictionUpdate', handlePredictionUpdate);

//     return () => {
//       clearInterval(interval);
//       window.removeEventListener('predictionUpdate', handlePredictionUpdate);
//     };
//   }, []);

//   const loadData = async () => {
//     try {
//       const [eventsResponse, mlResponse] = await Promise.all([
//         getFireEvents(),
//         getMLPredictions()
//       ]);

//       const allEvents = eventsResponse.data || [];
//       const allML = mlResponse.data || [];

//       // 1. CNN Fires (Excluding "No Fire")
//       const cnnCount = allEvents.filter(e => 
//         (e.label === 'Fire') && (e.source === 'CNN Image Upload' || !e.source.toLowerCase().includes('cctv'))
//       ).length;

//       // 2. CCTV Fires (Excluding "No Fire")
//       const cctvCount = allEvents.filter(e => 
//         (e.label === 'Fire') && (e.source && e.source.toLowerCase().includes('cctv'))
//       ).length;

//       // 3. ML Prediction Count
//       const mlCount = allML.length;

//       setCounts({
//         total: cnnCount + cctvCount + mlCount,
//         cnnFire: cnnCount,
//         cctvFire: cctvCount,
//         mlCount: mlCount
//       });
      
//       setLoading(false);
//     } catch (error) {
//       console.error('Error loading dashboard data:', error);
//       setLoading(false);
//     }
//   };

//   if (loading) return <LoadingSpinner message="Syncing Statistics..." />;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
//         </div>
//         <button 
//           onClick={() => { setLoading(true); loadData(); }} 
//           className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition shadow-md"
//         >
//           <RefreshCw className="w-5 h-5" /> Refresh
//         </button>
//       </div>

//       {/* Main Stats Row - Now including Total Prediction as a Card */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatCard
//           title="Total Events"
//           value={counts.total}
//           icon={Activity}
//           color="orange"
//         />
//         <StatCard
//           title="ML Predictions"
//           value={counts.mlCount}
//           icon={Database}
//           color="orange"
//         />
//         <StatCard
//           title="CNN Detections"
//           value={counts.cnnFire}
//           icon={Cpu}
//           color="red"
//         />
//         <StatCard
//           title="CCTV Detections"
//           value={counts.cctvFire}
//           icon={Video}
//           color="blue"
//         />
//       </div>

//       {/* GIS Heatmap Section */}
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h2 className="text-2xl font-bold text-gray-900 mb-4">Fire Distribution - GIS Heatmap</h2>
//         <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center relative border border-gray-200 overflow-hidden">
//           <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
//             <defs>
//               <radialGradient id="mainHeat" cx="35%" cy="40%">
//                 <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
//                 <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.3" />
//                 <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
//               </radialGradient>
//             </defs>
//             {(counts.cnnFire > 0 || counts.cctvFire > 0) && (
//                <circle cx="400" cy="200" r="130" fill="url(#mainHeat)" />
//             )}
//             <circle cx="400" cy="200" r="6" fill="#b91c1c" stroke="white" strokeWidth="2" />
//           </svg>
          
//           <div className="absolute top-4 right-4 bg-white/80 p-3 rounded-md shadow-sm text-xs space-y-2">
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-red-500 rounded-full"></div> <span>Active Fire Hotspots</span>
//             </div>
//             <div className="text-gray-500 italic">Tracking {counts.cnnFire + counts.cctvFire} live sources</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


import React, { useState, useEffect } from 'react';
import { Database, Cpu, Video, RefreshCw, Activity } from 'lucide-react';
import { getFireEvents, getMLPredictions } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import GeminiChatbot from '../components/GeminiChatbot';
import FireRiskMonitor from '../components/FireRiskMonitor';


const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ total: 0, cnnFire: 0, cctvFire: 0, mlCount: 0 });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);

    const handlePredictionUpdate = () => loadData();
    window.addEventListener('predictionUpdate', handlePredictionUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('predictionUpdate', handlePredictionUpdate);
    };
  }, []);

  const loadData = async () => {
    try {
      const [eventsResponse, mlResponse] = await Promise.all([
        getFireEvents(),
        getMLPredictions()
      ]);

      const allEvents = eventsResponse.data || [];
      const allML = mlResponse.data || [];

      const cnnCount = allEvents.filter(e =>
        e.label === 'Fire' &&
        (e.source === 'CNN Image Upload' || !e.source.toLowerCase().includes('cctv'))
      ).length;

      const cctvCount = allEvents.filter(e =>
        e.label === 'Fire' &&
        e.source &&
        e.source.toLowerCase().includes('cctv')
      ).length;

      const mlCount = allML.length;

      setCounts({
        total: cnnCount + cctvCount + mlCount,
        cnnFire: cnnCount,
        cctvFire: cctvCount,
        mlCount
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Syncing Statistics..." />;

  return (
    <>
      {/* Dashboard Content */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={() => { setLoading(true); loadData(); }}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition shadow-md"
          >
            <RefreshCw className="w-5 h-5" /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Events" value={counts.total} icon={Activity} color="orange" />
          <StatCard title="ML Predictions" value={counts.mlCount} icon={Database} color="orange" />
          <StatCard title="CNN Detections" value={counts.cnnFire} icon={Cpu} color="red" />
          <StatCard title="CCTV Detections" value={counts.cctvFire} icon={Video} color="blue" />
        </div>
        <FireRiskMonitor />
        
      </div>
     
      {/* ✅ Gemini Chatbot Added (No dashboard change) */}
      <GeminiChatbot />
    </>
  );
};

export default Dashboard;

