const pool = require('../config/db');

class Workout {
    // Create workout
    static async create(workoutData) {
        const { user_id, workout_name, description, duration, calories_burned, workout_date, workout_time, notes, is_public } = workoutData;
        
        const [result] = await pool.query(
            `INSERT INTO workouts (user_id, workout_name, description, duration, calories_burned, workout_date, workout_time, notes, is_public)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, workout_name, description, duration, calories_burned, workout_date, workout_time, notes, is_public]
        );
        
        return result.insertId;
    }

    // Get user workouts
    static async getUserWorkouts(userId, limit = 10, offset = 0) {
        const [workouts] = await pool.query(
            `SELECT w.*, 
                    (SELECT COUNT(*) FROM workout_reactions WHERE workout_id = w.id) as reaction_count,
                    (SELECT COUNT(*) FROM workout_comments WHERE workout_id = w.id) as comment_count
             FROM workouts w
             WHERE w.user_id = ?
             ORDER BY w.workout_date DESC, w.created_at DESC
             LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );
        return workouts;
    }

    // Get workout by ID with exercises
    static async getById(workoutId) {
        const [workouts] = await pool.query(
            `SELECT w.*, u.full_name, u.profile_picture,
                    (SELECT COUNT(*) FROM workout_reactions WHERE workout_id = w.id) as reaction_count,
                    (SELECT COUNT(*) FROM workout_comments WHERE workout_id = w.id) as comment_count
             FROM workouts w
             JOIN users u ON w.user_id = u.id
             WHERE w.id = ?`,
            [workoutId]
        );

        if (workouts.length === 0) return null;

        const workout = workouts[0];

        // Get exercises
        const [exercises] = await pool.query(
            'SELECT * FROM exercises WHERE workout_id = ? ORDER BY id',
            [workoutId]
        );

        workout.exercises = exercises;
        return workout;
    }

    // Delete workout
    static async delete(workoutId, userId) {
        const [result] = await pool.query(
            'DELETE FROM workouts WHERE id = ? AND user_id = ?',
            [workoutId, userId]
        );
        return result.affectedRows > 0;
    }

    // Get today's workout
    static async getTodayWorkout(userId) {
        const [workouts] = await pool.query(
            `SELECT * FROM workouts 
             WHERE user_id = ? AND workout_date = CURDATE()
             ORDER BY workout_time DESC`,
            [userId]
        );
        return workouts;
    }

    // Get friends feed
    static async getFriendsFeed(userId, limit = 20) {
        const [workouts] = await pool.query(
            `SELECT w.*, u.full_name, u.profile_picture,
                    (SELECT COUNT(*) FROM workout_reactions WHERE workout_id = w.id) as reaction_count,
                    (SELECT COUNT(*) FROM workout_comments WHERE workout_id = w.id) as comment_count
             FROM workouts w
             JOIN users u ON w.user_id = u.id
             WHERE w.is_public = true 
             AND w.user_id IN (
                 SELECT CASE 
                     WHEN user_id = ? THEN friend_id
                     ELSE user_id
                 END
                 FROM friendships
                 WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'
             )
             ORDER BY w.created_at DESC
             LIMIT ?`,
            [userId, userId, userId, limit]
        );
        return workouts;
    }
}

module.exports = Workout;