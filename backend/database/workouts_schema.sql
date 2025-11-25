-- Workouts Table
-- This table stores all workout activities logged by users
CREATE TABLE IF NOT EXISTS workouts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    workout_name VARCHAR(100),
    workout_type ENUM('Strength', 'Cardio', 'Yoga', 'Sports', 'Other') NOT NULL,
    duration INT NOT NULL COMMENT 'Duration in minutes',
    calories_burned INT DEFAULT 0,
    notes TEXT,
    workout_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_workout_date (workout_date),
    INDEX idx_workout_type (workout_type)
);
