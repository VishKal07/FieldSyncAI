const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const ActivityDefinition = require('../models/ActivityDefinition');
const jwt = require('jsonwebtoken');
// use global fetch (Node 18+)

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI not set in backend/.env');
      process.exit(1);
    }
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    const activities = await Activity.find({}).sort({ date: -1 }).limit(50).lean();
    console.log('🔎 Recent activities count:', activities.length);
    console.log('--- Sample activities ---');
    console.log(JSON.stringify(activities.slice(0,5), null, 2));

    const defs = await ActivityDefinition.find({}).lean();
    console.log('🧩 Activity definitions count:', defs.length);
    console.log('--- Sample definitions ---');
    console.log(JSON.stringify(defs.slice(0,5), null, 2));

    const base = 'http://localhost:5000/api/ai';
    // Try authenticating with a demo worker to get a valid token
    let authHeader = null;
    try {
      const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'arjun@fieldsync.com', password: 'worker123' })
      });
      const loginData = await loginRes.json();
      if (loginData.token) {
        authHeader = `Bearer ${loginData.token}`;
        console.log('Authenticated as demo worker; using returned token');
      } else {
        console.log('Demo login did not return token; falling back to unsigned requests');
      }
    } catch (e) {
      console.log('Demo login failed:', e.message || e);
    }
    try {
      const resIns = await fetch(`${base}/insights`, {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, authHeader ? { Authorization: authHeader } : {}),
        body: JSON.stringify({}),
      });
      const insData = await resIns.json();
      console.log('\n/api/ai/insights response:');
      console.log(JSON.stringify(insData, null, 2));
    } catch (e) {
      console.error('\n/api/ai/insights error:');
      console.error(e.message || e);
    }

    try {
      const resSum = await fetch(`${base}/summary`, {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, authHeader ? { Authorization: authHeader } : {}),
        body: JSON.stringify({}),
      });
      const sumData = await resSum.json();
      console.log('\n/api/ai/summary response:');
      console.log(JSON.stringify(sumData, null, 2));
    } catch (e) {
      console.error('\n/api/ai/summary error:');
      console.error(e.message || e);
    }

    await mongoose.disconnect();
    console.log('\n✅ Done');
    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
})();