const pool = require('../config/db');

class Profile {
    // Get complete profile with stats
    static async getProfile(userId) {
        const [profiles] = await pool.query(
            `SELECT 
                u.id,
                u.full_name,
                u.email,
                u.phone,
                u.profile_picture,
                u.bio,
                u.fitness_level,
                u.total_workouts,
                u.total_points,
                u.current_streak,
                u.longest_streak,
                u.allow_friend_requests,
                u.show_workout_to_friends,
                u.compete_in_leaderboard,
                u.created_at,
                (SELECT COUNT(*) FROM friendships WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted') as friends_count
             FROM users u
             WHERE u.id = ?`,
            [userId, userId, userId]
        );
        return profiles[0];
    }

    // Update profile information
    static async updateProfile(userId, updates) {
        const allowedFields = [
            'full_name',
            'phone',
            'bio',
            'profile_picture',
            'fitness_level',
            'allow_friend_requests',
            'show_workout_to_friends',
            'compete_in_leaderboard'
        ];

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

    // Get profile stats summary
    static async getStats(userId) {
        const [stats] = await pool.query(
            `SELECT 
                total_workouts,
                total_points,
                current_streak,
                longest_streak,
                (SELECT COUNT(*) FROM friendships WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted') as friends_count
             FROM users 
             WHERE id = ?`,
            [userId, userId, userId]
        );
        return stats[0];
    }
}

module.exports = Profile;
