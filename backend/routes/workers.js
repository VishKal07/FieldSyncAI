const express = require('express');
const router = express.Router();
const { getWorkers, addWorker, updateWorker, deleteWorker } = require('../controllers/workerController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/', authMiddleware, adminOnly, getWorkers);
router.post('/', authMiddleware, adminOnly, addWorker);
router.put('/:id', authMiddleware, adminOnly, updateWorker);
router.delete('/:id', authMiddleware, adminOnly, deleteWorker);

module.exports = router;