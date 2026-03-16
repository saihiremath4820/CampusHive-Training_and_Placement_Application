const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');

router.get('/roadmap/all', verifyToken, authorize(['student']), roadmapController.getRoadmaps);
router.post('/roadmap/generate', verifyToken, authorize(['student']), roadmapController.generateRoadmap);

module.exports = router;
