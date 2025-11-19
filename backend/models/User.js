const pool = require('../config/db');

class User {
    // Find user by email
    static async findByEmail(email) {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    // Find user by ID
    static async findById(id) {
        const [rows] = await pool.query(
            'SELECT id, full_name, email, phone, profile_picture, bio, fitness_level, total_workouts, total_points, current_streak, longest_streak FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    // Create new user
    static async create(userData) {
        const { full_name, email, password, phone } = userData;
        const [result] = await pool.query(
            'INSERT INTO users (full_name, email, password, phone) VALUES (?, ?, ?, ?)',
            [full_name, email, password, phone]
        );
        return result.insertId;
    }

    // Update user profile
    static async updateProfile(userId, updates) {
        const allowedFields = ['full_name', 'phone', 'bio', 'profile_picture', 'fitness_level', 'allow_friend_requests', 'show_workout_to_friends', 'compete_in_leaderboard'];
        
        const fields = [];
        const values = [];
        
        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        });
        
        if (fields.length === 0) return false;
        
        values.push(userId);
        
        const [result] = await pool.query(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        
        return result.affectedRows > 0;
    }

    // Get user stats
    static async getStats(userId) {
        const [stats] = await pool.query(
            `SELECT 
                total_workouts,
                total_points,
                current_streak,
                longest_streak,
                (SELECT COUNT(*) FROM friendships WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted') as friends_count
             FROM users WHERE id = ?`,
            [userId, userId, userId]
        );
        return stats[0];
    }

    // Update workout stats
    static async incrementWorkouts(userId, points = 10) {
        await pool.query(
            `UPDATE users 
             SET total_workouts = total_workouts + 1,
                 total_points = total_points + ?
             WHERE id = ?`,
            [points, userId]
        );
    }
}

module.exports = User;