import React from 'react';
import { Bell, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const AlertList = ({ alerts }) => {
  const getSourceIcon = (source) => {
    switch (source.toLowerCase()) {
      case 'cctv':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'manual':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-orange-500" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      if (timestamp?.seconds) {
        return format(new Date(timestamp.seconds * 1000), 'MMM dd, yyyy HH:mm:ss');
      }
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
    } catch (error) {
      return timestamp;
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No alerts yet</p>
        <p className="text-gray-400 text-sm mt-2">SMS alerts will appear here when fires are detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <div 
          key={alert.id || index} 
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border-l-4 border-orange-500"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              {getSourceIcon(alert.source)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{alert.source}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      alert.source === 'CCTV' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {alert.source}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{alert.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-gray-500 text-xs mt-2">
                <Clock className="w-3 h-3" />
                {formatTimestamp(alert.timestamp || alert.time)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertList;