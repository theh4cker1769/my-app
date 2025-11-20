const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
    createWorkout,
    getMyWorkouts,
    getWorkoutDetails,
    deleteWorkout,
    getTodayWorkout,
    getFriendsFeed,
    addReaction,
    addComment,
    quickLogWorkout
} = require('../controllers/workoutController');

router.use(protect); // All routes require authentication

router.post('/', createWorkout);
router.post('/quick-log', quickLogWorkout);
router.get('/my-workouts', getMyWorkouts);
router.get('/today', getTodayWorkout);
router.get('/friends-feed', getFriendsFeed);
router.get('/:workout_id', getWorkoutDetails);
router.delete('/:workout_id', deleteWorkout);
router.post('/:workout_id/reaction', addReaction);
router.post('/:workout_id/comment', addComment);

module.exports = router;