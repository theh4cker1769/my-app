const User = require('../models/User');
const pool = require('../config/db');

// Get user stats
exports.getUserStats = async (req, res) => {
    try {
        const user_id = req.user.id;
        const stats = await User.getStats(user_id);

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Get weekly summary
exports.getWeeklySummary = async (req, res) => {
    try {
        const user_id = req.user.id;

        const [summary] = await pool.query(
            `SELECT 
                DATE(workout_date) as date,
                COUNT(*) as workout_count,
                SUM(duration) as total_duration,
                SUM(calories_burned) as total_calories
             FROM workouts
             WHERE user_id = ? 
             AND workout_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
             GROUP BY DATE(workout_date)
             ORDER BY date ASC`,
            [user_id]
        );

        res.json({
            success: true,
            data: summary
        });

    } catch (error) {
        console.error('Get weekly summary error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const user_id = req.user.id;
        const updates = req.body;

        const success = await User.updateProfile(user_id, updates);

        if (!success) {
            return res.status(400).json({ 
                success: false, 
                message: 'No valid fields to update' 
            });
        }

        // Get updated user
        const updatedUser = await User.findById(user_id);

        res.json({
            success: true,
            data: updatedUser,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Get user profile by ID
exports.getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};