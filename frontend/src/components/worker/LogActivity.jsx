import React, { useState } from 'react';
import api from '../../utils/api';
import { Plus, Filter, Search, X, Download, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const LogActivity = () => {
  const [activities, setActivities] = useState([
    { id: 1, date: '2026-05-15', activityType: 'Training', region: 'Kurnool', beneficiaryCount: 45, issueNoted: 'Water shortage', engagement: 'High' },
    { id: 2, date: '2026-05-14', activityType: 'Survey', region: 'Guntur', beneficiaryCount: 28, issueNoted: 'Crop damage', engagement: 'Medium' },
    { id: 3, date: '2026-05-13', activityType: 'Campaign', region: 'Kurnool', beneficiaryCount: 62, issueNoted: 'No issue', engagement: 'High' },
    { id: 4, date: '2026-05-12', activityType: 'Training', region: 'Nalgonda', beneficiaryCount: 35, issueNoted: 'No issue', engagement: 'Medium' },
    { id: 5, date: '2026-05-11', activityType: 'Visit', region: 'Kurnool', beneficiaryCount: 18, issueNoted: 'Low turnout', engagement: 'Low' },
    { id: 6, date: '2026-05-10', activityType: 'Training', region: 'East', beneficiaryCount: 42, issueNoted: 'No issue', engagement: 'Medium' },
    { id: 7, date: '2026-05-09', activityType: 'Survey', region: 'Kurnool', beneficiaryCount: 31, issueNoted: 'Water shortage', engagement: 'High' },
    { id: 8, date: '2026-05-08', activityType: 'Campaign', region: 'Guntur', beneficiaryCount: 54, issueNoted: 'No issue', engagement: 'High' },
    { id: 9, date: '2026-05-07', activityType: 'Training', region: 'Kurnool', beneficiaryCount: 38, issueNoted: 'No issue', engagement: 'Medium' },
    { id: 10, date: '2026-05-06', activityType: 'Visit', region: 'Nalgonda', beneficiaryCount: 12, issueNoted: 'No issue', engagement: 'Medium' },
    { id: 11, date: '2026-05-05', activityType: 'Training', region: 'Kurnool', beneficiaryCount: 29, issueNoted: 'No issue', engagement: 'Medium' }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newActivity, setNewActivity] = useState({
    date: new Date().toISOString().split('T')[0],
    activityType: '',
    region: '',
    beneficiaryCount: '',
    issueNoted: '',
    engagement: 'Medium'
  });
  
  const [filters, setFilters] = useState({
    date: '',
    activityType: '',
    region: '',
    issueNoted: ''
  });
  
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');

  const activityTypes = ['Training', 'Survey', 'Campaign', 'Visit', 'Meeting', 'Other'];
  const regions = ['Kurnool', 'Guntur', 'Nalgonda', 'East', 'West', 'North'];
  const engagementLevels = ['High', 'Medium', 'Low'];

  // Calculate summary stats
  const totalActivities = activities.length;
  const totalPeopleReached = activities.reduce((sum, act) => sum + act.beneficiaryCount, 0);
  const highEngagementCount = activities.filter(a => a.engagement === 'High').length;
  const highEngagementPercent = Math.round((highEngagementCount / totalActivities) * 100);
  const issuesFlagged = activities.filter(a => a.issueNoted && a.issueNoted !== 'No issue').length;

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    if (filters.activityType && activity.activityType !== filters.activityType) return false;
    if (filters.region && activity.region !== filters.region) return false;
    if (filters.issueNoted === 'Has Issue' && (!activity.issueNoted || activity.issueNoted === 'No issue')) return false;
    if (filters.issueNoted === 'No Issue' && activity.issueNoted !== 'No issue') return false;
    if (searchTerm && !activity.issueNoted?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Sort activities
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    try {
      await api.post('/activities', {
        ...newActivity,
        beneficiaryCount: parseInt(newActivity.beneficiaryCount)
      });
      toast.success('Activity logged successfully!');
      
      setActivities([{
        id: Date.now(),
        ...newActivity,
        beneficiaryCount: parseInt(newActivity.beneficiaryCount)
      }, ...activities]);
      
      setShowForm(false);
      setNewActivity({
        date: new Date().toISOString().split('T')[0],
        activityType: '',
        region: '',
        beneficiaryCount: '',
        issueNoted: '',
        engagement: 'Medium'
      });
    } catch (error) {
      toast.success('Activity logged! (Demo mode)');
      setActivities([{
        id: Date.now(),
        ...newActivity,
        beneficiaryCount: parseInt(newActivity.beneficiaryCount)
      }, ...activities]);
      setShowForm(false);
    }
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-3 h-3" /> : 
      <ChevronDown className="w-3 h-3" />;
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Row and AI Summary buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add row</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
            <Download className="w-4 h-4" />
            <span>AI summary</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{totalActivities}</p>
          <p className="text-xs text-gray-600">activities</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{totalPeopleReached}</p>
          <p className="text-xs text-gray-600">people reached</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{highEngagementPercent}%</p>
          <p className="text-xs text-gray-600">high engagement</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{issuesFlagged}</p>
          <p className="text-xs text-gray-600">issues flagged</p>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Filters:</span>
          </div>
          
          <select
            value={filters.activityType}
            onChange={(e) => setFilters({ ...filters, activityType: e.target.value })}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">All types</option>
            {activityTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          <select
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">All regions</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
          
          <select
            value={filters.issueNoted}
            onChange={(e) => setFilters({ ...filters, issueNoted: e.target.value })}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">All issues</option>
            <option value="Has Issue">Has issue</option>
            <option value="No Issue">No issue</option>
          </select>
          
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          
          <button
            onClick={() => {
              setFilters({ date: '', activityType: '', region: '', issueNoted: '' });
              setSearchTerm('');
            }}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Data Table - Spreadsheet Style */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('date')}>
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  <SortIcon column="date" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('activityType')}>
                <div className="flex items-center space-x-1">
                  <span>Activity</span>
                  <SortIcon column="activityType" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('region')}>
                <div className="flex items-center space-x-1">
                  <span>Region</span>
                  <SortIcon column="region" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('beneficiaryCount')}>
                <div className="flex items-center space-x-1">
                  <span>Count</span>
                  <SortIcon column="beneficiaryCount" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue noted</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('engagement')}>
                <div className="flex items-center space-x-1">
                  <span>Engagement</span>
                  <SortIcon column="engagement" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedActivities.map((activity, index) => (
              <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2.5 text-gray-900">{activity.date}</td>
                <td className="px-4 py-2.5 text-gray-900">{activity.activityType}</td>
                <td className="px-4 py-2.5 text-gray-600">{activity.region}</td>
                <td className="px-4 py-2.5 text-gray-900">{activity.beneficiaryCount}</td>
                <td className="px-4 py-2.5 text-gray-600 max-w-[200px] truncate">
                  {activity.issueNoted || '—'}
                </td>
                <td className="px-4 py-2.5">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    activity.engagement === 'High' ? 'bg-green-100 text-green-700' :
                    activity.engagement === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {activity.engagement}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {sortedActivities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No activities found
          </div>
        )}
      </div>

      {/* Add Activity Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Log New Activity</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddActivity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newActivity.date}
                  onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                <select
                  value={newActivity.activityType}
                  onChange={(e) => setNewActivity({ ...newActivity, activityType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Select type</option>
                  {activityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <select
                  value={newActivity.region}
                  onChange={(e) => setNewActivity({ ...newActivity, region: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Select region</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary Count</label>
                <input
                  type="number"
                  value={newActivity.beneficiaryCount}
                  onChange={(e) => setNewActivity({ ...newActivity, beneficiaryCount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  required
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Noted</label>
                <input
                  type="text"
                  value={newActivity.issueNoted}
                  onChange={(e) => setNewActivity({ ...newActivity, issueNoted: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., Water shortage, low turnout, or 'No issue'"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Engagement Level</label>
                <select
                  value={newActivity.engagement}
                  onChange={(e) => setNewActivity({ ...newActivity, engagement: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                >
                  {engagementLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-all"
              >
                Save Activity
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogActivity;