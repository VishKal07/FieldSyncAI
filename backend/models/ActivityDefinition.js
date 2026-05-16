const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'number', 'date', 'textarea', 'select', 'boolean'],
    default: 'text'
  },
  required: {
    type: Boolean,
    default: false
  },
  options: {
    type: [String],
    default: []
  },
  placeholder: {
    type: String,
    default: ''
  }
}, { _id: false });

const activityDefinitionSchema = new mongoose.Schema({
  activityType: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  fields: {
    type: [fieldSchema],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

activityDefinitionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ActivityDefinition', activityDefinitionSchema);