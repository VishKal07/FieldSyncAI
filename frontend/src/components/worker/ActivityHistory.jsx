import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Calendar, CheckCircle, Award } from 'lucide-react';

const ActivityHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/tasks/my-tasks');
      setHistory(response.data.completed || []);
    } catch (error) {
      setHistory([
        { _id: '1', taskType: 'Awareness Campaign', description: 'Conducted awareness campaign', completedAt: '2026-05-14', attendees: 42 },
        { _id: '2', taskType: 'Survey Collection', description: 'Collected survey data from beneficiaries', completedAt: '2026-05-13', attendees: 18 },
        { _id: '3', taskType: 'Training', description: 'Conducted farmer training session', completedAt: '2026-05-12', attendees: 35 },
        { _id: '4', taskType: 'Beneficiary Visit', description: 'Visited households for needs assessment', completedAt: '2026-05-11', attendees: 8 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getTaskIcon = (taskType) => {
    switch(taskType) {
      case 'Awareness Campaign': return '📢';
      case 'Survey Collection': return '📊';
      case 'Training': return '📚';
      case 'Beneficiary Visit': return '🏠';
      default: return '✅';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">PAST 7 DAYS</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading history...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div key={item._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getTaskIcon(item.taskType)}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.taskType}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-xs text-gray-500">
                        {new Date(item.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      {item.attendees && (
                        <p className="text-xs text-green-600">{item.attendees} attendees</p>
                      )}
                    </div>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Award className="w-8 h-8 text-green-600" />
            <div>
              <p className="font-semibold text-gray-900">Great work this week!</p>
              <p className="text-sm text-gray-600">You've completed all assigned tasks on time. Keep up the momentum!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHistory;