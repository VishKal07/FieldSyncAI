const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
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
  date: {
    type: Date,
    default: Date.now
  },
  activityType: {
    type: String,
    enum: ['Campaign', 'Survey', 'Training', 'Visit', 'Meeting', 'Other'],
    required: true
  },
  beneficiaryCount: {
    type: Number,
    required: true,
    min: 0
  },
  issueNoted: {
    type: String,
    default: ''
  },
  engagement: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Activity', activitySchema);