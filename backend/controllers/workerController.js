const User = require('../models/User');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

const getWorkers = async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker' }).select('-password');
    
    // Get task counts for each worker
    const workersWithStats = await Promise.all(workers.map(async (worker) => {
      const tasks = await Task.find({ workerId: worker._id });
      const completedTasks = tasks.filter(t => t.status === 'Completed').length;
      const activities = await Activity.find({ workerId: worker._id });
      
      return {
        ...worker.toObject(),
        taskCount: tasks.length,
        completedTasks,
        activityCount: activities.length
      };
    }));
    
    res.json(workersWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addWorker = async (req, res) => {
  try {
    const { name, email, password, region } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    const worker = new User({
      name,
      email,
      password,
      role: 'worker',
      region
    });
    
    await worker.save();
    
    res.status(201).json({
      message: 'Worker added successfully',
      worker: { ...worker.toObject(), password: undefined }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateWorker = async (req, res) => {
  try {
    const { name, region, isActive } = req.body;
    const worker = await User.findByIdAndUpdate(
      req.params.id,
      { name, region, isActive },
      { new: true }
    ).select('-password');
    
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteWorker = async (req, res) => {
  try {
    const worker = await User.findByIdAndDelete(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    res.json({ message: 'Worker deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getWorkers, addWorker, updateWorker, deleteWorker };