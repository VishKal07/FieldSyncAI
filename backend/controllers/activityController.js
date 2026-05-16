const Activity = require('../models/Activity');
const ActivityDefinition = require('../models/ActivityDefinition');
const User = require('../models/User');
const { getFieldValue, buildLegacyActivityFields } = require('../utils/activityHelpers');

const DEFAULT_ACTIVITY_DEFINITIONS = [
  {
    activityType: 'Campaign',
    description: 'Community outreach and awareness campaign',
    fields: [
      { key: 'beneficiaryCount', label: 'Beneficiary Count', type: 'number', required: true, placeholder: '0' },
      { key: 'issueNoted', label: 'Issue Noted', type: 'text', required: false, placeholder: 'e.g. Water shortage' },
      { key: 'engagement', label: 'Engagement', type: 'select', required: false, options: ['High', 'Medium', 'Low'] },
      { key: 'notes', label: 'Notes', type: 'textarea', required: false, placeholder: 'Any extra notes' }
    ]
  },
  {
    activityType: 'Survey',
    description: 'Survey and data collection activity',
    fields: [
      { key: 'beneficiaryCount', label: 'Beneficiary Count', type: 'number', required: true, placeholder: '0' },
      { key: 'issueNoted', label: 'Issue Noted', type: 'text', required: false, placeholder: 'e.g. Missing documents' },
      { key: 'engagement', label: 'Engagement', type: 'select', required: false, options: ['High', 'Medium', 'Low'] },
      { key: 'notes', label: 'Notes', type: 'textarea', required: false, placeholder: 'Notes about the survey' }
    ]
  },
  {
    activityType: 'Training',
    description: 'Training or capacity-building session',
    fields: [
      { key: 'beneficiaryCount', label: 'Beneficiary Count', type: 'number', required: true, placeholder: '0' },
      { key: 'issueNoted', label: 'Issue Noted', type: 'text', required: false, placeholder: 'e.g. Short session' },
      { key: 'engagement', label: 'Engagement', type: 'select', required: false, options: ['High', 'Medium', 'Low'] },
      { key: 'notes', label: 'Notes', type: 'textarea', required: false, placeholder: 'Training observations' }
    ]
  },
  {
    activityType: 'Visit',
    description: 'Field visit or household visit',
    fields: [
      { key: 'beneficiaryCount', label: 'Beneficiary Count', type: 'number', required: true, placeholder: '0' },
      { key: 'issueNoted', label: 'Issue Noted', type: 'text', required: false, placeholder: 'e.g. Low turnout' },
      { key: 'engagement', label: 'Engagement', type: 'select', required: false, options: ['High', 'Medium', 'Low'] },
      { key: 'notes', label: 'Notes', type: 'textarea', required: false, placeholder: 'Visit notes' }
    ]
  },
  {
    activityType: 'Meeting',
    description: 'Meeting or coordination activity',
    fields: [
      { key: 'attendees', label: 'Attendees', type: 'number', required: false, placeholder: '0' },
      { key: 'discussionPoints', label: 'Discussion Points', type: 'textarea', required: false, placeholder: 'Topics discussed' },
      { key: 'outcome', label: 'Outcome', type: 'text', required: false, placeholder: 'Meeting outcome' },
      { key: 'notes', label: 'Notes', type: 'textarea', required: false, placeholder: 'Additional notes' }
    ]
  },
  {
    activityType: 'Other',
    description: 'Custom activity type',
    fields: [
      { key: 'details', label: 'Details', type: 'textarea', required: false, placeholder: 'Describe the activity' },
      { key: 'notes', label: 'Notes', type: 'textarea', required: false, placeholder: 'Additional notes' }
    ]
  }
];

const mergeDefinitions = (defaults, customDefinitions) => {
  const merged = [...defaults];
  customDefinitions.forEach((definition) => {
    const index = merged.findIndex((item) => item.activityType === definition.activityType);
    const payload = definition.toObject ? definition.toObject() : definition;
    if (index >= 0) {
      merged[index] = payload;
    } else {
      merged.push(payload);
    }
  });
  return merged;
};

const normalizeFieldValues = (definition, body) => {
  const fieldValues = {};
  const source = body.fieldValues || {};

  definition.fields.forEach((field) => {
    const rawValue = source[field.key] !== undefined ? source[field.key] : body[field.key];
    if (rawValue !== undefined) {
      fieldValues[field.key] = rawValue;
    }
  });

  Object.entries(source).forEach(([key, value]) => {
    if (fieldValues[key] === undefined) {
      fieldValues[key] = value;
    }
  });

  return fieldValues;
};

const getActivityDefinitions = async (req, res) => {
  try {
    const customDefinitions = await ActivityDefinition.find({}).sort({ createdAt: 1 });
    const definitions = mergeDefinitions(DEFAULT_ACTIVITY_DEFINITIONS, customDefinitions);
    res.json(definitions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createActivityDefinition = async (req, res) => {
  try {
    const { activityType, description, fields, isActive } = req.body;

    if (!activityType || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ message: 'Activity type and fields are required' });
    }

    const existing = await ActivityDefinition.findOne({ activityType });
    const defaultExists = DEFAULT_ACTIVITY_DEFINITIONS.some((definition) => definition.activityType === activityType);
    if (existing || defaultExists) {
      return res.status(400).json({ message: 'Activity type already exists' });
    }

    const definition = await ActivityDefinition.create({
      activityType,
      description,
      fields,
      isActive: isActive !== false,
      createdBy: req.user.userId
    });

    res.status(201).json(definition);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateActivityDefinition = async (req, res) => {
  try {
    const { activityType, description, fields, isActive } = req.body;

    const definition = await ActivityDefinition.findByIdAndUpdate(
      req.params.id,
      {
        ...(activityType ? { activityType } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(Array.isArray(fields) ? { fields } : {}),
        ...(isActive !== undefined ? { isActive } : {})
      },
      { new: true }
    );

    if (!definition) {
      return res.status(404).json({ message: 'Activity definition not found' });
    }

    res.json(definition);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteActivityDefinition = async (req, res) => {
  try {
    const definition = await ActivityDefinition.findByIdAndDelete(req.params.id);
    if (!definition) {
      return res.status(404).json({ message: 'Activity definition not found' });
    }
    res.json({ message: 'Activity definition deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getActivities = async (req, res) => {
  try {
    const { type, region, startDate, endDate } = req.query;
    const filter = {};
    
    if (type) filter.activityType = type;
    if (region) filter.region = region;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    const activities = await Activity.find(filter)
      .sort({ date: -1 })
      .limit(100);
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addActivity = async (req, res) => {
  try {
    const { activityType, region, date, templateId } = req.body;
    const worker = await User.findById(req.user.userId);
    const definition = templateId
      ? await ActivityDefinition.findById(templateId)
      : await ActivityDefinition.findOne({ activityType });

    if (!definition && !activityType) {
      return res.status(400).json({ message: 'Activity type is required' });
    }

    const safeActivityType = definition?.activityType || activityType;
    const fieldValues = definition ? normalizeFieldValues(definition, req.body) : { ...(req.body.fieldValues || {}) };
    
    const activity = new Activity({
      templateId: definition?._id || templateId || undefined,
      templateFieldsSnapshot: definition?.fields || [],
      workerId: req.user.userId,
      workerName: worker.name,
      region: region || worker.region,
      date: date || undefined,
      activityType: safeActivityType,
      fieldValues,
      ...buildLegacyActivityFields(fieldValues)
    });
    
    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getWorkerActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ workerId: req.params.workerId })
      .sort({ date: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ workerId: req.user.userId })
      .sort({ date: -1 })
      .limit(25);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getActivityStats = async (req, res) => {
  try {
    const totalActivities = await Activity.countDocuments();
    const workers = await User.find({ role: 'worker' });
    const activeWorkers = workers.filter(w => w.isActive).length;
    
    const regions = await Activity.distinct('region');
    const regionStats = await Promise.all(regions.map(async (region) => {
      const count = await Activity.countDocuments({ region });
      return { region, count };
    }));
    
    const activityBreakdown = await Activity.aggregate([
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      totalActivities,
      activeWorkers,
      regionsCovered: regions.length,
      regionStats,
      activityBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const bulkAddActivities = async (req, res) => {
  try {
    const rows = Array.isArray(req.body.rows) ? req.body.rows : [];
    if (rows.length === 0) {
      return res.status(400).json({ message: 'At least one activity row is required' });
    }

    const worker = await User.findById(req.user.userId);
    const createdActivities = [];

    for (const row of rows) {
      const definition = row.templateId
        ? await ActivityDefinition.findById(row.templateId)
        : await ActivityDefinition.findOne({ activityType: row.activityType });

      if (!definition && !row.activityType) {
        continue;
      }

      const safeActivityType = definition?.activityType || row.activityType;
      const fieldValues = definition ? normalizeFieldValues(definition, row) : { ...(row.fieldValues || {}) };
      const activity = await Activity.create({
        templateId: definition?._id || row.templateId || undefined,
        templateFieldsSnapshot: definition?.fields || [],
        workerId: req.user.userId,
        workerName: worker.name,
        region: row.region || worker.region,
        date: row.date || undefined,
        activityType: safeActivityType,
        fieldValues,
        ...buildLegacyActivityFields(fieldValues)
      });
      createdActivities.push(activity);
    }

    res.status(201).json(createdActivities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getActivities,
  addActivity,
  bulkAddActivities,
  getMyActivities,
  getWorkerActivities,
  getActivityStats,
  getActivityDefinitions,
  createActivityDefinition,
  updateActivityDefinition,
  deleteActivityDefinition
};