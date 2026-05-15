const Activity = require('../models/Activity');
const User = require('../models/User');

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
    const { activityType, beneficiaryCount, issueNoted, engagement, notes } = req.body;
    const worker = await User.findById(req.user.userId);
    
    const activity = new Activity({
      workerId: req.user.userId,
      workerName: worker.name,
      region: worker.region,
      activityType,
      beneficiaryCount,
      issueNoted,
      engagement,
      notes
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

module.exports = { getActivities, addActivity, getWorkerActivities, getActivityStats };