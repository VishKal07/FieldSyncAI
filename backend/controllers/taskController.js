const Task = require('../models/Task');
const User = require('../models/User');

const assignTask = async (req, res) => {
  try {
    const { workerId, taskType, description, dueDate } = req.body;
    
    const worker = await User.findById(workerId);
    if (!worker || worker.role !== 'worker') {
      return res.status(404).json({ message: 'Worker not found' });
    }
    
    const task = new Task({
      workerId,
      workerName: worker.name,
      region: worker.region,
      taskType,
      description,
      dueDate,
      assignedBy: req.user.userId
    });
    
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getWorkerTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ 
      workerId: req.user.userId,
      status: { $ne: 'Completed' }
    }).sort({ dueDate: 1 });
    
    const completedTasks = await Task.find({ 
      workerId: req.user.userId,
      status: 'Completed'
    }).sort({ completedAt: -1 }).limit(10);
    
    res.json({ pending: tasks, completed: completedTasks });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (task.workerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    task.status = status;
    if (status === 'Completed') {
      task.completedAt = new Date();
    }
    
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }).limit(50);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { assignTask, getWorkerTasks, updateTaskStatus, getAllTasks };