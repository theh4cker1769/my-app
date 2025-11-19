const Workout = require('../models/Workout');
const User = require('../models/User');
const pool = require('../config/db');

// Create workout
exports.createWorkout = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { workout_name, description, duration, calories_burned, workout_date, workout_time, notes, is_public, exercises } = req.body;

        // Validation
        if (!workout_name) {
            return res.status(400).json({ 
                success: false, 
                message: 'Workout name is required' 
            });
        }

        // Create workout
        const workoutId = await Workout.create({
            user_id,
            workout_name,
            description,
            duration: duration || null,
            calories_burned: calories_burned || null,
            workout_date: workout_date || new Date().toISOString().split('T')[0],
            workout_time: workout_time || null,
            notes,
            is_public: is_public !== false
        });

        // Add exercises if provided
        if (exercises && Array.isArray(exercises) && exercises.length > 0) {
            for (const exercise of exercises) {
                if (exercise.exercise_name) {
                    await pool.query(
                        `INSERT INTO exercises (workout_id, exercise_name, sets, reps, weight, rest_time, notes)
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            workoutId,
                            exercise.exercise_name,
                            exercise.sets || null,
                            exercise.reps || null,
                            exercise.weight || null,
                            exercise.rest_time || null,
                            exercise.notes || null
                        ]
                    );
                }
            }
        }

        // Update user stats
        await User.incrementWorkouts(user_id, 10);

        res.status(201).json({
            success: true,
            data: { id: workoutId },
            message: 'Workout logged successfully'
        });

    } catch (error) {
        console.error('Create workout error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Get my workouts
exports.getMyWorkouts = async (req, res) => {
    try {
        const user_id = req.user.id;
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;

        const workouts = await Workout.getUserWorkouts(user_id, limit, offset);

        res.json({
            success: true,
            data: workouts
        });

    } catch (error) {
        console.error('Get my workouts error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Get workout details
exports.getWorkoutDetails = async (req, res) => {
    try {
        const { workout_id } = req.params;
        const workout = await Workout.getById(workout_id);

        if (!workout) {
            return res.status(404).json({ 
                success: false, 
                message: 'Workout not found' 
            });
        }

        res.json({
            success: true,
            data: workout
        });

    } catch (error) {
        console.error('Get workout details error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Delete workout
exports.deleteWorkout = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { workout_id } = req.params;

        const success = await Workout.delete(workout_id, user_id);

        if (!success) {
            return res.status(404).json({ 
                success: false, 
                message: 'Workout not found or unauthorized' 
            });
        }

        res.json({
            success: true,
            message: 'Workout deleted successfully'
        });

    } catch (error) {
        console.error('Delete workout error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Get today's workout
exports.getTodayWorkout = async (req, res) => {
    try {
        const user_id = req.user.id;
        const workouts = await Workout.getTodayWorkout(user_id);

        res.json({
            success: true,
            data: workouts
        });

    } catch (error) {
        console.error('Get today workout error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Get friends feed
exports.getFriendsFeed = async (req, res) => {
    try {
        const user_id = req.user.id;
        const limit = parseInt(req.query.limit) || 20;

        const workouts = await Workout.getFriendsFeed(user_id, limit);

        res.json({
            success: true,
            data: workouts
        });

    } catch (error) {
        console.error('Get friends feed error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Add reaction
exports.addReaction = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { workout_id } = req.params;
        const { reaction_type } = req.body;

        const validReactions = ['like', 'fire', 'strong', 'clap'];
        if (!validReactions.includes(reaction_type)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid reaction type' 
            });
        }

        // Check if already reacted
        const [existing] = await pool.query(
            'SELECT id FROM workout_reactions WHERE workout_id = ? AND user_id = ?',
            [workout_id, user_id]
        );

        if (existing.length > 0) {
            // Update reaction
            await pool.query(
                'UPDATE workout_reactions SET reaction_type = ? WHERE workout_id = ? AND user_id = ?',
                [reaction_type, workout_id, user_id]
            );
        } else {
            // Add new reaction
            await pool.query(
                'INSERT INTO workout_reactions (workout_id, user_id, reaction_type) VALUES (?, ?, ?)',
                [workout_id, user_id, reaction_type]
            );
        }

        res.json({
            success: true,
            message: 'Reaction added successfully'
        });

    } catch (error) {
        console.error('Add reaction error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Add comment
exports.addComment = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { workout_id } = req.params;
        const { comment } = req.body;

        if (!comment || comment.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: 'Comment cannot be empty' 
            });
        }

        await pool.query(
            'INSERT INTO workout_comments (workout_id, user_id, comment) VALUES (?, ?, ?)',
            [workout_id, user_id, comment]
        );

        res.status(201).json({
            success: true,
            message: 'Comment added successfully'
        });

    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};