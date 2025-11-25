-- Users Table
-- This table stores all user information including profile data, stats, and privacy settings
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    profile_picture VARCHAR(255),
    bio TEXT,
    fitness_level ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') DEFAULT 'Beginner',
    
    -- Stats
    total_workouts INT DEFAULT 0,
    total_points INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    
    -- Privacy Settings
    allow_friend_requests BOOLEAN DEFAULT TRUE,
    show_workout_to_friends BOOLEAN DEFAULT TRUE,
    compete_in_leaderboard BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_total_points (total_points),
    INDEX idx_created_at (created_at)
);
