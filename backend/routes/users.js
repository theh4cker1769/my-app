const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
    getUserStats,
    getWeeklySummary,
    updateProfile,
    getUserProfile
} = require('../controllers/userController');

// All routes require authentication
router.use(protect);

router.get('/stats', getUserStats);
router.get('/weekly-summary', getWeeklySummary);
router.put('/profile', updateProfile);
router.get('/profile/:id', getUserProfile);

module.exports = router;