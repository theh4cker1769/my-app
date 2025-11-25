const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
    getUserStats,
    getWeeklySummary,
    updateProfile,
    getUserProfile,
    getMonthlyActivity
} = require('../controllers/userController');

// All routes require authentication
router.use(protect);

router.get('/stats', getUserStats);
router.get('/weekly-summary', getWeeklySummary);
router.get('/monthly-activity', getMonthlyActivity);
router.put('/profile', updateProfile);
router.get('/profile/:id', getUserProfile);

module.exports = router;