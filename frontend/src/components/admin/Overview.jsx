import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { TrendingUp, Users, MapPin, Activity, PieChart, BarChart } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Overview = () => {
  const [stats, setStats] = useState({
    totalActivities: 0,
    activeWorkers: 0,
    regionsCovered: 0,
    avgEngagement: 78,
    regionStats: [],
    activityBreakdown: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/activities/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total activities (month)', value: stats.totalActivities, icon: Activity, color: 'bg-blue-500' },
    { label: 'Active workers', value: stats.activeWorkers, icon: Users, color: 'bg-green-500' },
    { label: 'Regions covered', value: stats.regionsCovered, icon: MapPin, color: 'bg-purple-500' },
    { label: 'Avg engagement', value: `${stats.avgEngagement}%`, icon: TrendingUp, color: 'bg-orange-500' },
  ];

  const regionColors = {
    Kurnool: '#8B5CF6',
    Guntur: '#10B981',
    Nalgonda: '#F59E0B',
    East: '#EF4444',
    West: '#3B82F6',
    North: '#EC4899'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Region Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Region Performance</h3>
          </div>
          <div className="space-y-3">
            {stats.regionStats.map((region, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{region.region}</span>
                  <span className="text-gray-600">{Math.min(100, region.count * 10)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, region.count * 10)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <PieChart className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Activity Breakdown</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPie>
              <Pie
                data={stats.activityBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry._id} ${Math.round((entry.count / stats.totalActivities) * 100)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="_id"
              >
                {stats.activityBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={[ '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6' ][index % 5]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Overview;