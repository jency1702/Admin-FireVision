import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'orange', trend, subtitle }) => {
  const colorClasses = {
    orange: 'text-orange-500 bg-orange-50',
    red: 'text-red-500 bg-red-50',
    blue: 'text-blue-500 bg-blue-50',
    green: 'text-green-500 bg-green-50',
    purple: 'text-purple-500 bg-purple-50',
    yellow: 'text-yellow-500 bg-yellow-50'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-gray-400 text-xs mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`mt-2 text-xs font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className={`p-4 rounded-full ${colorClasses[color]}`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;