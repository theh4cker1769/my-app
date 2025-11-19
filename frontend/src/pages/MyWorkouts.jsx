import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { workoutAPI } from '../api/apiServices';
import Layout from '../layout/Layout';
import Header from '../layout/Header';
import '../styles/myworkouts.css';

const MyWorkouts = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWorkout, setSelectedWorkout] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            fetchWorkouts();
        }
    }, [user, navigate]);

    const fetchWorkouts = async () => {
        setLoading(true);
        try {
            const response = await workoutAPI.getMyWorkouts(50, 0);
            if (response.success) {
                const data = response.data?.data || response.data;
                setWorkouts(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching workouts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (workoutId) => {
        try {
            const response = await workoutAPI.getWorkoutDetails(workoutId);
            if (response.success) {
                const data = response.data?.data || response.data;
                setSelectedWorkout(data);
            }
        } catch (error) {
            console.error('Error fetching workout details:', error);
        }
    };

    const handleDelete = async (workoutId) => {
        if (!window.confirm('Are you sure you want to delete this workout?')) {
            return;
        }

        try {
            const response = await workoutAPI.deleteWorkout(workoutId);
            if (response.success) {
                fetchWorkouts();
                setSelectedWorkout(null);
            }
        } catch (error) {
            console.error('Error deleting workout:', error);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="loading-container">
                    <div className="spinner"></div>
                    <h2>Loading workouts...</h2>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Header 
                title="My Workouts 🏋️"
                subtitle="Track your fitness journey"
                actionButton={
                    <button className="btn-add-workout">
                        ➕ Log Workout
                    </button>
                }
            />

            {workouts.length === 0 ? (
                <div className="empty-workouts">
                    <div className="empty-icon">🏃‍♂️</div>
                    <h2>No workouts yet</h2>
                    <p>Start your fitness journey by logging your first workout!</p>
                    <button className="btn-primary">Log Your First Workout</button>
                </div>
            ) : (
                <div className="workouts-container">
                    <div className="workouts-list">
                        <div className="workouts-header">
                            <h3>All Workouts ({workouts.length})</h3>
                        </div>
                        {workouts.map((workout) => (
                            <div 
                                key={workout.id} 
                                className={`workout-card ${selectedWorkout?.id === workout.id ? 'active' : ''}`}
                                onClick={() => handleViewDetails(workout.id)}
                            >
                                <div className="workout-card-header">
                                    <h4>{workout.workout_name}</h4>
                                    <span className="workout-date">
                                        {new Date(workout.workout_date).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <p className="workout-description">{workout.description || 'No description'}</p>
                                <div className="workout-stats">
                                    {workout.duration && (
                                        <span className="stat">
                                            <span className="stat-icon">⏱️</span>
                                            {workout.duration} min
                                        </span>
                                    )}
                                    {workout.calories_burned && (
                                        <span className="stat">
                                            <span className="stat-icon">🔥</span>
                                            {workout.calories_burned} cal
                                        </span>
                                    )}
                                    <span className="stat">
                                        <span className="stat-icon">💬</span>
                                        {workout.comment_count || 0}
                                    </span>
                                    <span className="stat">
                                        <span className="stat-icon">❤️</span>
                                        {workout.reaction_count || 0}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedWorkout && (
                        <div className="workout-details">
                            <div className="details-header">
                                <h3>{selectedWorkout.workout_name}</h3>
                                <button 
                                    className="btn-delete"
                                    onClick={() => handleDelete(selectedWorkout.id)}
                                >
                                    🗑️ Delete
                                </button>
                            </div>

                            <div className="details-info">
                                <div className="info-item">
                                    <span className="info-label">Date:</span>
                                    <span className="info-value">
                                        {new Date(selectedWorkout.workout_date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                {selectedWorkout.workout_time && (
                                    <div className="info-item">
                                        <span className="info-label">Time:</span>
                                        <span className="info-value">{selectedWorkout.workout_time}</span>
                                    </div>
                                )}
                                {selectedWorkout.duration && (
                                    <div className="info-item">
                                        <span className="info-label">Duration:</span>
                                        <span className="info-value">{selectedWorkout.duration} minutes</span>
                                    </div>
                                )}
                                {selectedWorkout.calories_burned && (
                                    <div className="info-item">
                                        <span className="info-label">Calories:</span>
                                        <span className="info-value">{selectedWorkout.calories_burned} kcal</span>
                                    </div>
                                )}
                            </div>

                            {selectedWorkout.description && (
                                <div className="details-section">
                                    <h4>Description</h4>
                                    <p>{selectedWorkout.description}</p>
                                </div>
                            )}

                            {selectedWorkout.exercises && selectedWorkout.exercises.length > 0 && (
                                <div className="details-section">
                                    <h4>Exercises ({selectedWorkout.exercises.length})</h4>
                                    <div className="exercises-list">
                                        {selectedWorkout.exercises.map((exercise, index) => (
                                            <div key={index} className="exercise-item">
                                                <div className="exercise-name">{exercise.exercise_name}</div>
                                                <div className="exercise-details">
                                                    {exercise.sets && <span>{exercise.sets} sets</span>}
                                                    {exercise.reps && <span>× {exercise.reps} reps</span>}
                                                    {exercise.weight && <span>@ {exercise.weight}kg</span>}
                                                    {exercise.rest_time && <span>({exercise.rest_time}s rest)</span>}
                                                </div>
                                                {exercise.notes && (
                                                    <div className="exercise-notes">{exercise.notes}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedWorkout.notes && (
                                <div className="details-section">
                                    <h4>Notes</h4>
                                    <p>{selectedWorkout.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </Layout>
    );
};

export default MyWorkouts;