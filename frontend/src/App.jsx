// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
// import { Flame, AlertTriangle, Activity, Database, Home } from 'lucide-react';
// import Dashboard from './pages/Dashboard';
// import FireEvents from './pages/FireEvents';
// import Alerts from './pages/Alerts';
// import MLPredictions from './pages/MLPredictions';

// // Navigation component
// const Navigation = () => {
//   const location = useLocation();
  
//   const isActive = (path) => {
//     return location.pathname === path;
//   };

//   const navItems = [
//     { path: '/', label: 'Dashboard', icon: Home },
//     { path: '/fire-events', label: 'Fire Events', icon: Flame },
//     { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
//     { path: '/predictions', label: 'ML/CNN', icon: Database }
//   ];

//   return (
//     <nav className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg">
//       <div className="max-w-7xl mx-auto px-4">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo */}
//           <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition">
//             <div className="p-2 bg-white/20 rounded-lg">
//               <Flame className="w-6 h-6" />
//             </div>
//             <div>
//               <span className="text-xl font-bold block">FireVision</span>
//               <span className="text-xs text-orange-100">Admin Dashboard</span>
//             </div>
//           </Link>
          
//           {/* Navigation Links */}
//           <div className="flex gap-2">
//             {navItems.map((item) => {
//               const Icon = item.icon;
//               return (
//                 <Link
//                   key={item.path}
//                   to={item.path}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
//                     isActive(item.path)
//                       ? 'bg-white text-orange-600 font-semibold shadow-lg'
//                       : 'hover:bg-white/20'
//                   }`}
//                 >
//                   <Icon className="w-5 h-5" />
//                   <span className="hidden md:inline">{item.label}</span>
//                 </Link>
//               );
//             })}
//           </div>

//           {/* Status Indicator */}
//           <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
//             <Activity className="w-4 h-4 animate-pulse text-green-300" />
//             <span className="text-sm font-semibold">Live</span>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// // Main App Component
// function App() {
//   return (
//     <Router>
//       <div className="min-h-screen bg-gray-100">
//         <Navigation />
        
//         {/* Main Content */}
//         <main className="max-w-7xl mx-auto px-4 py-6">
//           <Routes>
//             <Route path="/" element={<Dashboard />} />
//             <Route path="/fire-events" element={<FireEvents />} />
//             <Route path="/alerts" element={<Alerts />} />
//             <Route path="/predictions" element={<MLPredictions />} />
//           </Routes>
//         </main>

//         {/* Footer */}
//         <footer className="bg-white border-t border-gray-200 mt-12">
//           <div className="max-w-7xl mx-auto px-4 py-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2 text-gray-600">
//                 <Flame className="w-5 h-5 text-orange-600" />
//                 <span className="font-semibold">FireVision Admin Dashboard</span>
//               </div>
//               <p className="text-gray-500 text-sm">
//                 © 2024 FireVision. All rights reserved.
//               </p>
//             </div>
//           </div>
//         </footer>
//       </div>
//     </Router>
//   );
// }

// export default App;



// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Flame, AlertTriangle, Activity, Database, Home, Camera, Video, TrendingUp } from 'lucide-react';

// Import all pages
import Dashboard from './pages/Dashboard';
import FireEvents from './pages/FireEvents';
import Alerts from './pages/Alerts';
import MLPredictions from './pages/MLPredictions';
import FireDetection from './pages/FireDetection';
import MLFireTypePrediction from './pages/MLFireTypePrediction';
import CCTVMonitoring from './pages/CCTVMonitoring';

// Navigation component
const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/fire-detection', label: 'Fire Detection', icon: Camera },
    { path: '/ml-prediction', label: 'ML Prediction', icon: TrendingUp },
    { path: '/cctv', label: 'CCTV Monitor', icon: Video },
    { path: '/fire-events', label: 'Fire Events', icon: Flame },
    { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
    { path: '/predictions', label: 'History', icon: Database }
  ];

  return (
    <nav className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition">
            <div className="p-2 bg-white/20 rounded-lg">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold block">FireVision</span>
              <span className="text-xs text-orange-100">Admin Dashboard</span>
            </div>
          </Link>
          
          {/* Navigation Links */}
          <div className="flex gap-2 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
                    isActive(item.path)
                      ? 'bg-white text-orange-600 font-semibold shadow-lg'
                      : 'hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
            <Activity className="w-4 h-4 animate-pulse text-green-300" />
            <span className="text-sm font-semibold hidden lg:inline">Live</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/fire-detection" element={<FireDetection />} />
            <Route path="/ml-prediction" element={<MLFireTypePrediction />} />
            <Route path="/cctv" element={<CCTVMonitoring />} />
            <Route path="/fire-events" element={<FireEvents />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/predictions" element={<MLPredictions />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Flame className="w-5 h-5 text-orange-600" />
                <span className="font-semibold">FireVision ML & CNN Fire Detection System</span>
              </div>
              <p className="text-gray-500 text-sm">
                © 2024 FireVision. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

