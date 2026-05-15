import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Plus, Edit2, Trash2, UserPlus, Activity, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const WorkersList = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: '',
    email: '',
    password: '',
    region: ''
  });

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const response = await api.get('/workers');
      setWorkers(response.data);
    } catch (error) {
      console.error('Failed to fetch workers:', error);
      // Mock data for demo
      setWorkers([
        { 
          _id: '1', 
          name: 'Arjun Kumar', 
          email: 'arjun@fieldsync.com', 
          region: 'Kurnool', 
          taskCount: 18, 
          completedTasks: 15,
          isActive: true,
          avatarInitials: 'AK'
        },
        { 
          _id: '2', 
          name: 'Sunita Rao', 
          email: 'sunita@fieldsync.com', 
          region: 'Guntur', 
          taskCount: 14, 
          completedTasks: 12,
          isActive: true,
          avatarInitials: 'SR'
        },
        { 
          _id: '3', 
          name: 'Mahesh Naidu', 
          email: 'mahesh@fieldsync.com', 
          region: 'East', 
          taskCount: 6, 
          completedTasks: 3,
          isActive: true,
          avatarInitials: 'MN'
        },
        { 
          _id: '4', 
          name: 'Lakshmi Patel', 
          email: 'lakshmi@fieldsync.com', 
          region: 'Nalgonda', 
          taskCount: 11, 
          completedTasks: 9,
          isActive: true,
          avatarInitials: 'LP'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorker = async (e) => {
    e.preventDefault();
    try {
      await api.post('/workers', newWorker);
      toast.success('Worker added successfully');
      setShowAddModal(false);
      setNewWorker({ name: '', email: '', password: '', region: '' });
      fetchWorkers();
    } catch (error) {
      toast.error('Failed to add worker');
    }
  };

  const regions = ['Kurnool', 'Guntur', 'Nalgonda', 'East', 'West', 'North'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">FIELD WORKERS ({workers.length})</h2>
          <p className="text-gray-600 mt-1">Manage your field team and monitor their performance</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Worker</span>
        </button>
      </div>

      {/* Workers Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading workers...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workers.map((worker) => (
            <div key={worker._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {worker.avatarInitials}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{worker.name}</h3>
                    <p className="text-sm text-gray-600">{worker.region}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-1 text-gray-400 hover:text-blue-600 transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Activity className="w-4 h-4" />
                    <span>Tasks assigned</span>
                  </div>
                  <span className="font-semibold text-gray-900">{worker.taskCount}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Completed</span>
                  </div>
                  <span className="font-semibold text-green-600">{worker.completedTasks}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${(worker.completedTasks / worker.taskCount) * 100}%` }}
                  />
                </div>
                
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  worker.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {worker.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Worker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Add New Worker</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="w-6 h-6 transform rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleAddWorker} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newWorker.name}
                  onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newWorker.email}
                  onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newWorker.password}
                  onChange={(e) => setNewWorker({ ...newWorker, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <select
                  value={newWorker.region}
                  onChange={(e) => setNewWorker({ ...newWorker, region: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Select Region</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-all"
              >
                Add Worker
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkersList;