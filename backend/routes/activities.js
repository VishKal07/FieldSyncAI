const express = require('express');
const router = express.Router();
const { 
  getActivities, 
  addActivity, 
  getWorkerActivities,
  getActivityStats 
} = require('../controllers/activityController');
const { authMiddleware, adminOnly, workerOnly } = require('../middleware/auth');

router.get('/', authMiddleware, adminOnly, getActivities);
router.get('/stats', authMiddleware, adminOnly, getActivityStats);
router.get('/worker/:workerId', authMiddleware, adminOnly, getWorkerActivities);
router.post('/', authMiddleware, workerOnly, addActivity);

module.exports = router;