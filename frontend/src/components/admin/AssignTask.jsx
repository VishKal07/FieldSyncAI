import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Send, Brain, Calendar, Users, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AssignTask = () => {
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [task, setTask] = useState({
    taskType: '',
    description: '',
    dueDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState('');

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await api.get('/workers');
      setWorkers(response.data);
      
      // AI recommendation for East region
      const eastWorker = response.data.find(w => w.region === 'East');
      if (eastWorker) {
        setAiRecommendation(`East Region shows low engagement. Assigning an awareness campaign to ${eastWorker.name} is recommended to improve outreach before end of week.`);
      }
    } catch (error) {
      console.error('Failed to fetch workers:', error);
      // Mock data
      setWorkers([
        { _id: '1', name: 'Arjun Kumar', region: 'Kurnool' },
        { _id: '2', name: 'Sunita Rao', region: 'Guntur' },
        { _id: '3', name: 'Mahesh Naidu', region: 'East' },
        { _id: '4', name: 'Lakshmi Patel', region: 'Nalgonda' }
      ]);
      setAiRecommendation('East Region shows low engagement. Assigning an awareness campaign to Mahesh Naidu is recommended to improve outreach before end of week.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWorker || !task.taskType || !task.description || !task.dueDate) {
      toast.error('Please fill all fields');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/tasks/assign', {
        workerId: selectedWorker,
        ...task
      });
      toast.success('Task assigned successfully!');
      setTask({ taskType: '', description: '', dueDate: '' });
      setSelectedWorker('');
    } catch (error) {
      toast.error('Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  const taskTypes = [
    'Awareness Campaign',
    'Survey Collection',
    'Training',
    'Beneficiary Visit',
    'Meeting'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* AI Recommendation Banner */}
      {aiRecommendation && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-900 mb-1">AI Recommendation</p>
              <p className="text-gray-700">{aiRecommendation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Intelligent Task Assignment</h2>
          <p className="text-gray-600 mt-1">Assign tasks to field workers based on region and performance</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Worker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Assign to worker
            </label>
            <select
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              required
            >
              <option value="">Select a worker</option>
              {workers.map(worker => (
                <option key={worker._id} value={worker._id}>
                  {worker.name} ({worker.region} Region)
                </option>
              ))}
            </select>
          </div>

          {/* Activity Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Activity type</label>
            <select
              value={task.taskType}
              onChange={(e) => setTask({ ...task, taskType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              required
            >
              <option value="">Select activity type</option>
              {taskTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={task.description}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              placeholder="Describe the task details and expectations..."
              required
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Due date
            </label>
            <input
              type="date"
              value={task.dueDate}
              onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Assigning...' : 'Assign Task'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssignTask;