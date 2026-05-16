const Anthropic = require('@anthropic-ai/sdk');
const Activity = require('../models/Activity');
const Task = require('../models/Task');
const User = require('../models/User');
const { getFieldValue } = require('../utils/activityHelpers');

const getAnthropic = () => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    return new Anthropic({ apiKey: key });
  } catch (e) {
    console.error('Failed to initialize Anthropic SDK:', e);
    return null;
  }
};

const buildFallbackSummary = (activities) => {
  const latestActivity = activities[0];
  const totalBeneficiaries = activities.reduce((sum, activity) => {
    const count = Number(getFieldValue(activity, 'beneficiaryCount')) || 0;
    return sum + count;
  }, 0);
  const issues = activities
    .map((activity) => getFieldValue(activity, 'issueNoted'))
    .filter(Boolean)
    .slice(0, 3);

  if (!latestActivity) {
    return 'No recent activities to summarize.';
  }

  const latestIssue = getFieldValue(latestActivity, 'issueNoted') || 'no major issue reported';

  return `Recent work focused on ${latestActivity.activityType.toLowerCase()} activities, reaching about ${totalBeneficiaries} beneficiaries across the latest entries. The latest update noted ${latestIssue}. ${issues.length > 0 ? `Common issues included ${issues.join(', ')}.` : 'No repeated issues were flagged in the recent entries.'}`;
};

const buildFallbackInsights = ({ activities, tasks, workers, regionStats }) => {
  const totalActivities = activities.length;
  const topRegion = Object.entries(regionStats).sort((a, b) => b[1].count - a[1].count)[0];
  const pendingTasks = tasks.filter((task) => task.status === 'Pending').length;
  const recentIssues = activities
    .map((activity) => getFieldValue(activity, 'issueNoted'))
    .filter(Boolean)
    .slice(0, 4);

  return [
    { text: `Total activities recorded: ${totalActivities}. Keep the highest-volume workflows consistent so reporting stays stable.` },
    { text: topRegion ? `${topRegion[0]} is currently the busiest region with ${topRegion[1].count} activities logged.` : 'No regional activity has been logged yet.' },
    { text: recentIssues.length > 0 ? `Recurring issues include ${recentIssues.join(', ')}. These should be reviewed by the program team.` : 'No recurring issues were flagged in the latest activity rows.' },
    { text: `Pending tasks: ${pendingTasks}. Active workers: ${workers.length}. Use the current load to balance assignments.` }
  ];
};

const generateSummary = async (req, res) => {
  try {
    const { workerId, region } = req.body;
    const userId = workerId || req.user.userId;
    
    // Get recent activities for this worker/region
    const activities = await Activity.find({ 
      workerId: userId 
    }).sort({ date: -1 }).limit(10);
    
    if (activities.length === 0) {
      return res.json({ summary: 'No recent activities to summarize.' });
    }

    const anthropic = getAnthropic();
    if (!anthropic) {
      return res.json({ summary: buildFallbackSummary(activities) });
    }

    // Prepare data for AI
    const activityData = activities.map(a => ({
      type: a.activityType,
      beneficiaries: getFieldValue(a, 'beneficiaryCount'),
      issue: getFieldValue(a, 'issueNoted'),
      engagement: getFieldValue(a, 'engagement'),
      date: a.date
    }));

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-sonnet-20241022',
        max_tokens: 300,
        temperature: 0.7,
        system: "You are FieldSync AI, an assistant for NGO field workers. Generate brief, actionable summaries of their recent activities.",
        messages: [{
          role: 'user',
          content: `Based on these recent field activities, generate a concise 2-3 sentence summary highlighting key achievements, issues raised, and recommendations:\n\n${JSON.stringify(activityData, null, 2)}`
        }]
      });

      res.json({ summary: message.content[0].text });
    } catch (err) {
      console.error('Anthropic call failed, returning fallback summary:', err.message || err);
      return res.json({ summary: buildFallbackSummary(activities) });
    }
  } catch (error) {
    console.error('AI Error:', error);
    try {
      const { workerId } = req.body;
      const userId = workerId || req.user.userId;
      const activities = await Activity.find({ workerId: userId }).sort({ date: -1 }).limit(10);
      return res.json({ summary: buildFallbackSummary(activities) });
    } catch (fallbackError) {
      res.status(500).json({ message: 'AI service unavailable' });
    }
  }
};

const generateInsights = async (req, res) => {
  try {
    // Get all recent activities
    const activities = await Activity.find()
      .sort({ date: -1 })
      .limit(50);
    
    const tasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(30);
    
    const workers = await User.find({ role: 'worker', isActive: true });
    
    // Calculate regional stats
    const regionStats = {};
    activities.forEach(activity => {
      if (!regionStats[activity.region]) {
        regionStats[activity.region] = { count: 0, engagement: { High: 0, Medium: 0, Low: 0 } };
      }
      regionStats[activity.region].count++;
      const engagement = getFieldValue(activity, 'engagement') || 'Medium';
      regionStats[activity.region].engagement[engagement]++;
    });

    const anthropic = getAnthropic();
    if (!anthropic) {
      return res.json({
        insights: buildFallbackInsights({ activities, tasks, workers, regionStats })
      });
    }

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-sonnet-20241022',
        max_tokens: 500,
        temperature: 0.7,
        system: "You are FieldSync AI Analytics. Generate 4 key insights for NGO administrators based on activity data.",
        messages: [{
          role: 'user',
          content: `Generate 4 actionable insights for NGO administrators based on this data:
        - Total activities: ${activities.length}
        - Active workers: ${workers.length}
        - Regions with stats: ${JSON.stringify(regionStats)}
        - Recent issues flagged: ${activities.filter(a => getFieldValue(a, 'issueNoted')).slice(0, 5).map(a => getFieldValue(a, 'issueNoted'))}
        - Pending tasks: ${tasks.filter(t => t.status === 'Pending').length}`
        }]
      });

      // Parse the insights into structured format
      const insightsText = message.content[0].text;
      const insights = insightsText.split('\n').filter(line => line.trim()).map(text => ({ text }));
      res.json({ insights });
    } catch (err) {
      console.error('Anthropic call failed, returning fallback insights:', err.message || err);
      return res.json({
        insights: buildFallbackInsights({ activities, tasks, workers, regionStats })
      });
    }
  } catch (error) {
    console.error('AI Error:', error);
    try {
      const activities = await Activity.find().sort({ date: -1 }).limit(50);
      const tasks = await Task.find().sort({ createdAt: -1 }).limit(30);
      const workers = await User.find({ role: 'worker', isActive: true });
      const regionStats = {};
      activities.forEach((activity) => {
        if (!regionStats[activity.region]) {
          regionStats[activity.region] = { count: 0, engagement: { High: 0, Medium: 0, Low: 0 } };
        }
        regionStats[activity.region].count++;
        const engagement = getFieldValue(activity, 'engagement') || 'Medium';
        regionStats[activity.region].engagement[engagement]++;
      });

      return res.json({
        insights: buildFallbackInsights({ activities, tasks, workers, regionStats })
      });
    } catch (fallbackError) {
      res.status(500).json({ message: 'AI service unavailable' });
    }
  }
};

module.exports = { generateSummary, generateInsights };