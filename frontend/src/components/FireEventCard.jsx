import React from 'react';
import { Flame, AlertTriangle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const FireEventCard = ({ event }) => {
  const getDangerColor = (score) => {
    if (score >= 80) return 'text-red-600 bg-red-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt="Fire detection" 
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
            <Flame className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        
        {event.label === 'Fire' && (
          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <Flame className="w-4 h-4" />
            FIRE DETECTED
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{event.source}</h3>
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
              <Clock className="w-4 h-4" />
              {formatTimestamp(event.timestamp || event.createdAt)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round((event.fireProbability || 0) * 100)}%
            </div>
            <div className="text-xs text-gray-500">Probability</div>
          </div>
        </div>

        {event.dangerScore && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-700">Danger Score</span>
              <span className={`text-sm font-bold px-2 py-1 rounded ${getDangerColor(event.dangerScore)}`}>
                {event.dangerScore}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  event.dangerScore >= 80 ? 'bg-red-600' :
                  event.dangerScore >= 60 ? 'bg-orange-600' :
                  event.dangerScore >= 40 ? 'bg-yellow-600' : 'bg-green-600'
                }`}
                style={{ width: `${event.dangerScore}%` }}
              />
            </div>
          </div>
        )}

        {event.cause && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Predicted Cause</p>
                <p className="text-sm text-gray-700">{event.cause}</p>
                {event.confidence && (
                  <p className="text-xs text-gray-500 mt-1">Confidence: {event.confidence}%</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-200">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
            event.label === 'Fire' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {event.label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FireEventCard;