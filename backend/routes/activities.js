const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/activityController');
const { authMiddleware, adminOnly, workerOnly } = require('../middleware/auth');

router.get('/definitions', authMiddleware, getActivityDefinitions);
router.post('/definitions', authMiddleware, adminOnly, createActivityDefinition);
router.put('/definitions/:id', authMiddleware, adminOnly, updateActivityDefinition);
router.delete('/definitions/:id', authMiddleware, adminOnly, deleteActivityDefinition);
router.get('/my', authMiddleware, workerOnly, getMyActivities);
router.get('/', authMiddleware, adminOnly, getActivities);
router.get('/stats', authMiddleware, adminOnly, getActivityStats);
router.get('/worker/:workerId', authMiddleware, adminOnly, getWorkerActivities);
router.post('/', authMiddleware, workerOnly, addActivity);
router.post('/bulk', authMiddleware, workerOnly, bulkAddActivities);

module.exports = router;