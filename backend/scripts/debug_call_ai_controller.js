const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const aiController = require('../controllers/aiController');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to Mongo');

    const req = { body: {} , user: { userId: null } };
    const res = {
      json: (obj) => { console.log('RES JSON:', JSON.stringify(obj, null, 2)); },
      status: function(code) { return { json: (obj) => { console.log('RES STATUS', code, JSON.stringify(obj, null, 2)); } }; }
    };

    console.log('Calling generateInsights...');
    await aiController.generateInsights(req, res);

    console.log('Calling generateSummary...');
    await aiController.generateSummary(req, res);

    await mongoose.disconnect();
    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error('Error during direct aiController call:', err);
    process.exit(1);
  }
})();