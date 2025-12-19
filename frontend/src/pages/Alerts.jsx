import React, { useState, useEffect } from 'react';
import { Download, Filter, Search } from 'lucide-react';
import { getAlerts } from '../services/api';
import AlertList from '../components/AlertList';
import LoadingSpinner from '../components/LoadingSpinner';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
  filterAlerts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchTerm, filterSource, alerts]);

  const loadAlerts = async () => {
    try {
      const response = await getAlerts();
      setAlerts(response.data);
      setFilteredAlerts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading alerts:', error);
      setLoading(false);
    }
  };

  const filterAlerts = () => {
    let filtered = alerts;

    // Filter by source
    if (filterSource !== 'all') {
      filtered = filtered.filter(alert => alert.source === filterSource);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAlerts(filtered);
  };

  const handleExport = () => {
    const csv = [
      ['Time', 'Source', 'Message'],
      ...filteredAlerts.map(alert => [
        alert.timestamp || alert.time,
        alert.source,
        alert.message
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alerts-${new Date().toISOString()}.csv`;
    a.click();
  };

  if (loading) {
    return <LoadingSpinner message="Loading alerts..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SMS Alerts</h1>

        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-500 text-sm">Total Alerts</p>
          <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-500 text-sm">CCTV Alerts</p>
          <p className="text-2xl font-bold text-red-600">
            {alerts.filter(a => a.source === 'CCTV').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-500 text-sm">Manual Alerts</p>
          <p className="text-2xl font-bold text-blue-600">
            {alerts.filter(a => a.source === 'Manual').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Sources</option>
              <option value="CCTV">CCTV Only</option>
              <option value="Manual">Manual Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <AlertList alerts={filteredAlerts} />
    </div>
  );
};

export default Alerts;
