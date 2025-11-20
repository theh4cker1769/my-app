import { useState } from 'react';
import { workoutAPI } from '../api/apiServices';
import '../styles/QuickLogWorkout.css';

const QuickLogWorkout = ({ isOpen, onClose, onSuccess }) => {
    const [selectedType, setSelectedType] = useState(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const workoutTypes = [
        { type: 'Chest', emoji: '💪', color: '#FF6B6B' },
        { type: 'Back', emoji: '🦾', color: '#4ECDC4' },
        { type: 'Shoulders', emoji: '🏋️', color: '#FFE66D' },
        { type: 'Legs', emoji: '🦵', color: '#95E1D3' },
        { type: 'Arms', emoji: '💪', color: '#F38181' },
        { type: 'Core', emoji: '🔥', color: '#AA96DA' },
        { type: 'Cardio', emoji: '🏃', color: '#FCBAD3' },
        { type: 'Full Body', emoji: '🎯', color: '#A8E6CF' }
    ];

    const handleQuickLog = async () => {
        if (!selectedType) return;

        setLoading(true);
        try {
            const response = await workoutAPI.quickLogWorkout({
                workout_type: selectedType,
                notes: notes.trim() || null
            });

            if (response && response.success) {
                // Show success and close
                onSuccess(response.data);
                handleClose();
            }
        } catch (error) {
            console.error('Quick log error:', error);
            alert('Failed to log workout. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedType(null);
        setNotes('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="quick-log-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>🏋️ Quick Log Workout</h2>
                    <button className="close-btn" onClick={handleClose}>✕</button>
                </div>

                <div className="modal-body">
                    <p className="subtitle">What did you work out today?</p>

                    <div className="workout-types-grid">
                        {workoutTypes.map((workout) => (
                            <button
                                key={workout.type}
                                className={`workout-type-btn ${selectedType === workout.type ? 'selected' : ''}`}
                                style={{
                                    '--workout-color': workout.color,
                                    backgroundColor: selectedType === workout.type ? workout.color : 'transparent',
                                    borderColor: workout.color
                                }}
                                onClick={() => setSelectedType(workout.type)}
                            >
                                <span className="workout-emoji">{workout.emoji}</span>
                                <span className="workout-label">{workout.type}</span>
                            </button>
                        ))}
                    </div>

                    <div className="notes-section">
                        <label>Quick Note (optional)</label>
                        <input
                            type="text"
                            placeholder="e.g., Felt great today! 💪"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            maxLength={100}
                        />
                    </div>

                    <button
                        className="log-btn"
                        onClick={handleQuickLog}
                        disabled={!selectedType || loading}
                    >
                        {loading ? 'Logging...' : `Log ${selectedType || 'Workout'} 🔥`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuickLogWorkout;