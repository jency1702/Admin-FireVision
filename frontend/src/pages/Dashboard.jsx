import React, { useState, useEffect } from 'react';
import { Flame, AlertTriangle, TrendingUp, Clock, Activity } from 'lucide-react';
import { getStatistics, getFireEvents, getAlerts } from '../services/api';
import StatCard from '../components/StatCard';
import FireEventCard from '../components/FireEventCard';
import ChartCard from '../components/ChartCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsData, eventsData, alertsData] = await Promise.all([
        getStatistics(),
        getFireEvents(),
        getAlerts()
      ]);
      
      setStats(statsData.data);
      setRecentEvents(eventsData.data.slice(0, 6));
      setRecentAlerts(alertsData.data.slice(0, 5));
      
      // Prepare chart data
      const sourceData = Object.entries(statsData.data.firesBySource || {}).map(([name, value]) => ({
        name,
        value
      }));
      setChartData(sourceData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time fire detection monitoring</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Activity className="w-4 h-4 animate-pulse text-green-500" />
          <span>Live</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Fires Detected"
          value={stats?.totalFires || 0}
          icon={Flame}
          color="orange"
        />
        <StatCard
          title="SMS Alerts Sent"
          value={stats?.totalAlerts || 0}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Avg Danger Score"
          value={stats?.avgDangerScore || 0}
          icon={TrendingUp}
          color="blue"
          subtitle="out of 100"
        />
        <StatCard
          title="Last Updated"
          value="Live"
          icon={Clock}
          color="green"
          subtitle="Real-time monitoring"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard
          title="Fire Detection by Source"
          type="pie"
          data={chartData}
          dataKey="value"
          colors={['#f97316', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6']}
        />
        <ChartCard
          title="Fire Causes Distribution"
          type="bar"
          data={Object.entries(stats?.firesByCause || {}).map(([name, value]) => ({ name, value }))}
          dataKey="value"
          xKey="name"
          colors={['#f97316']}
        />
      </div>

      {/* Recent Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Recent Fire Events</h2>
          <a href="/fire-events" className="text-orange-600 hover:text-orange-700 font-semibold text-sm">
            View All →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentEvents.length > 0 ? (
            recentEvents.map((event, index) => (
              <FireEventCard key={event.id || index} event={event} />
            ))
          ) : (
            <div className="col-span-3 text-center py-12 bg-gray-50 rounded-lg">
              <Flame className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No fire events detected yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Alerts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Recent Alerts</h2>
          <a href="/alerts" className="text-orange-600 hover:text-orange-700 font-semibold text-sm">
            View All →
          </a>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          {recentAlerts.length > 0 ? (
            <div className="space-y-3">
              {recentAlerts.map((alert, index) => (
                <div key={alert.id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500">{alert.source} • {new Date(alert.timestamp || alert.time).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No alerts yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;