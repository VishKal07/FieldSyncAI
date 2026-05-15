const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workerName: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  taskType: {
    type: String,
    enum: ['Awareness Campaign', 'Survey Collection', 'Training', 'Beneficiary Visit', 'Meeting'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Overdue'],
    default: 'Pending'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Task', taskSchema);
