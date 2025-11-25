-- Complete Database Setup Script
-- Run this file to set up all tables for the Gym Tracker application

-- ====================================
-- USERS TABLE
-- ====================================
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

-- ====================================
-- WORKOUTS TABLE
-- ====================================
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

-- ====================================
-- FRIENDSHIPS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS friendships (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Ensure unique friendship pairs
    UNIQUE KEY unique_friendship (user_id, friend_id),
    
    INDEX idx_user_id (user_id),
    INDEX idx_friend_id (friend_id),
    INDEX idx_status (status)
);

-- ====================================
-- GROUPS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS groups_table (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_created_by (created_by)
);

-- ====================================
-- GROUP MEMBERS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS group_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('admin', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups_table(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_group_member (group_id, user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_user_id (user_id)
);

-- ====================================
-- SAMPLE DATA (Optional)
-- ====================================
-- Uncomment to insert sample data

-- Sample User (password: password123)
-- INSERT INTO users (full_name, email, password, phone, bio, fitness_level) VALUES
-- ('John Doe', 'john@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz123456789', '1234567890', 'Fitness enthusiast on a journey to better health!', 'Intermediate');

-- Sample Workouts
-- INSERT INTO workouts (user_id, workout_name, workout_type, duration, calories_burned, workout_date) VALUES
-- (1, 'Morning Run', 'Cardio', 30, 250, NOW()),
-- (1, 'Bench Press', 'Strength', 45, 180, NOW()),
-- (1, 'Yoga Session', 'Yoga', 60, 150, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ====================================
-- USEFUL QUERIES
-- ====================================

-- Get user stats
-- SELECT 
--     total_workouts,
--     total_points,
--     current_streak,
--     longest_streak,
--     (SELECT COUNT(*) FROM friendships WHERE (user_id = 1 OR friend_id = 1) AND status = 'accepted') as friends_count
-- FROM users WHERE id = 1;

-- Get recent workouts
-- SELECT * FROM workouts WHERE user_id = 1 ORDER BY workout_date DESC LIMIT 5;

-- Get monthly activity for heatmap
-- SELECT 
--     DATE(workout_date) as date,
--     COUNT(*) as workout_count
-- FROM workouts
-- WHERE user_id = 1
--   AND workout_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
-- GROUP BY DATE(workout_date)
-- ORDER BY date ASC;
