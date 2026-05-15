const express = require('express');
const router = express.Router();
const { 
  assignTask, 
  getWorkerTasks, 
  updateTaskStatus,
  getAllTasks 
} = require('../controllers/taskController');
const { authMiddleware, adminOnly, workerOnly } = require('../middleware/auth');

router.post('/assign', authMiddleware, adminOnly, assignTask);
router.get('/my-tasks', authMiddleware, workerOnly, getWorkerTasks);
router.put('/:taskId/status', authMiddleware, workerOnly, updateTaskStatus);
router.get('/all', authMiddleware, adminOnly, getAllTasks);

module.exports = router;