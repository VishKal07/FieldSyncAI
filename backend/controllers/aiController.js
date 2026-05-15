const Anthropic = require('@anthropic-ai/sdk');
const Activity = require('../models/Activity');
const Task = require('../models/Task');
const User = require('../models/User');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

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
    
    // Prepare data for AI
    const activityData = activities.map(a => ({
      type: a.activityType,
      beneficiaries: a.beneficiaryCount,
      issue: a.issueNoted,
      engagement: a.engagement,
      date: a.date
    }));
    
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
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ message: 'AI service unavailable' });
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
      regionStats[activity.region].engagement[activity.engagement]++;
    });
    
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
        - Recent issues flagged: ${activities.filter(a => a.issueNoted).slice(0, 5).map(a => a.issueNoted)}
        - Pending tasks: ${tasks.filter(t => t.status === 'Pending').length}`
      }]
    });
    
    // Parse the insights into structured format
    const insightsText = message.content[0].text;
    const insights = insightsText.split('\n').filter(line => line.trim()).map(text => ({ text }));
    
    res.json({ insights });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ message: 'AI service unavailable' });
  }
};

module.exports = { generateSummary, generateInsights };