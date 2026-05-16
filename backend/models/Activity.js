const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ActivityDefinition'
  },
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
  templateFieldsSnapshot: {
    type: [
      {
        key: String,
        label: String,
        type: String
      }
    ],
    default: []
  },
  fieldValues: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  date: {
    type: Date,
    default: Date.now
  },
  activityType: {
    type: String,
    required: true
  },
  beneficiaryCount: {
    type: Number,
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