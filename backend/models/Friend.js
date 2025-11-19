const pool = require('../config/db');

class Friend {
    // Send friend request
    static async sendRequest(userId, friendId) {
        const [result] = await pool.query(
            `INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, 'pending')`,
            [userId, friendId]
        );
        return result.insertId;
    }

    // Check if friendship exists
    static async checkFriendship(userId, friendId) {
        const [rows] = await pool.query(
            `SELECT * FROM friendships 
             WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`,
            [userId, friendId, friendId, userId]
        );
        return rows[0];
    }

    // Get friend requests
    static async getRequests(userId) {
        const [requests] = await pool.query(
            `SELECT f.id, f.user_id, f.created_at, u.full_name, u.email, u.profile_picture, u.fitness_level
             FROM friendships f
             JOIN users u ON f.user_id = u.id
             WHERE f.friend_id = ? AND f.status = 'pending'
             ORDER BY f.created_at DESC`,
            [userId]
        );
        return requests;
    }

    // Accept friend request
    static async acceptRequest(friendshipId) {
        const [result] = await pool.query(
            'UPDATE friendships SET status = "accepted" WHERE id = ?',
            [friendshipId]
        );
        return result.affectedRows > 0;
    }

    // Reject/Delete friend request
    static async rejectRequest(friendshipId) {
        const [result] = await pool.query(
            'DELETE FROM friendships WHERE id = ?',
            [friendshipId]
        );
        return result.affectedRows > 0;
    }

    // Get all friends
    static async getFriends(userId) {
        const [friends] = await pool.query(
            `SELECT 
                CASE 
                    WHEN f.user_id = ? THEN f.friend_id
                    ELSE f.user_id
                END as friend_id,
                u.full_name, u.email, u.profile_picture, u.fitness_level,
                u.total_workouts, u.total_points, u.current_streak,
                f.created_at as friends_since
             FROM friendships f
             JOIN users u ON (
                 CASE 
                     WHEN f.user_id = ? THEN f.friend_id = u.id
                     ELSE f.user_id = u.id
                 END
             )
             WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted'
             ORDER BY u.full_name ASC`,
            [userId, userId, userId, userId]
        );
        return friends;
    }

    // Remove friend
    static async removeFriend(userId, friendId) {
        const [result] = await pool.query(
            `DELETE FROM friendships 
             WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
             AND status = 'accepted'`,
            [userId, friendId, friendId, userId]
        );
        return result.affectedRows > 0;
    }

    // Search users
    static async searchUsers(userId, query) {
        const [users] = await pool.query(
            `SELECT u.id, u.full_name, u.email, u.profile_picture, u.fitness_level,
                    u.total_workouts, u.current_streak,
                    CASE 
                        WHEN EXISTS(
                            SELECT 1 FROM friendships 
                            WHERE ((user_id = ? AND friend_id = u.id) OR (user_id = u.id AND friend_id = ?))
                            AND status = 'accepted'
                        ) THEN 'friends'
                        WHEN EXISTS(
                            SELECT 1 FROM friendships 
                            WHERE user_id = ? AND friend_id = u.id AND status = 'pending'
                        ) THEN 'request_sent'
                        WHEN EXISTS(
                            SELECT 1 FROM friendships 
                            WHERE user_id = u.id AND friend_id = ? AND status = 'pending'
                        ) THEN 'request_received'
                        ELSE 'none'
                    END as friendship_status
             FROM users u
             WHERE u.id != ? 
             AND u.is_active = true
             AND (u.full_name LIKE ? OR u.email LIKE ?)
             LIMIT 20`,
            [userId, userId, userId, userId, userId, `%${query}%`, `%${query}%`]
        );
        return users;
    }
}

module.exports = Friend;