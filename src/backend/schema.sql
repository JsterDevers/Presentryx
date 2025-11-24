-- ==========================================
-- 1. SETUP DATABASE & DISABLE SAFE MODE
-- ==========================================
SET SQL_SAFE_UPDATES = 0; 
CREATE DATABASE IF NOT EXISTS webapp;
USE webapp;

-- ==========================================
-- 2. CREATE USER/STUDENT TABLES (Safe)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, 
    student_id VARCHAR(50) UNIQUE DEFAULT NULL,
    photo_data LONGTEXT, 
    agreed_to_terms TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    logout_time DATETIME DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- 3. FIX CLASSES TABLE (Safe Fix)
-- ==========================================
CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(100) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    faculty_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE SET NULL
);

-- SAFE FIX: Renames 'name' to 'class_name' if it exists.
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='webapp' AND table_name='classes' AND column_name='name');
SET @sql := IF (@exist > 0, 'ALTER TABLE classes CHANGE COLUMN name class_name VARCHAR(100) NOT NULL', 'SELECT "Column name already fixed"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ==========================================
-- 4. FIX SCHEDULES (UPDATED: Default is now 'Presentryx')
-- ==========================================
CREATE TABLE IF NOT EXISTS schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(50) DEFAULT 'Presentryx', -- Changed from 'Presentryx Room'
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- Ensure default room is set correctly on existing tables
ALTER TABLE schedules MODIFY room VARCHAR(50) DEFAULT 'Presentryx';

-- UPDATE 1: Fix empty or null rooms
UPDATE schedules SET room = 'Presentryx' WHERE room IS NULL OR room = '';

-- UPDATE 2: Fix existing rows that still say "Presentryx Room"
UPDATE schedules SET room = 'Presentryx' WHERE room = 'Presentryx Room';

-- ==========================================
-- 5. ENSURE ENROLLMENTS EXIST
-- ==========================================
CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- ==========================================
-- 6. CREATE THE "ALL-IN-ONE" VIEW
-- ==========================================
CREATE OR REPLACE VIEW view_class_schedules AS
    SELECT 
        s.id AS schedule_id,
        c.class_name,
        c.course_code,
        IFNULL(CONCAT(u.firstname, ' ', u.lastname), 'Unassigned') AS faculty_name, 
        s.day_of_week,
        DATE_FORMAT(s.start_time, '%h:%i %p') AS start_time, 
        DATE_FORMAT(s.end_time, '%h:%i %p') AS end_time_,
        s.room
    FROM
        schedules s
            JOIN
        classes c ON s.class_id = c.id
            LEFT JOIN
        users u ON c.faculty_id = u.id
    ORDER BY FIELD(s.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), s.start_time;

-- ==========================================
-- 7. CREATE MASTER USER VIEW
-- ==========================================
CREATE OR REPLACE VIEW view_master_data AS
    SELECT 
        u.id AS user_id,
        u.student_id,
        CONCAT(u.firstname, ' ', u.lastname) AS full_name,
        u.email,
        u.password_hash,
        u.role,
        u.photo_data,
        u.agreed_to_terms,
        u.created_at,
        DATE_FORMAT(u.created_at, '%W, %M %d, %Y') AS signup_date,
        DATE_FORMAT(u.created_at, '%h:%i %p') AS signup_time,
        l.log_id,
        DATE_FORMAT(l.login_time, '%M %d, %Y') AS login_date,
        DATE_FORMAT(l.login_time, '%h:%i %p') AS login_clock,
        IFNULL(DATE_FORMAT(l.logout_time, '%h:%i %p'), IF(l.log_id IS NULL, 'NO HISTORY', 'STILL ONLINE')) AS logout_clock,
        IFNULL(TIME_FORMAT(TIMEDIFF(l.logout_time, l.login_time), '%H:%i'), IF(l.log_id IS NULL, '-', 'Active')) AS session_duration
    FROM
        users u
            LEFT JOIN
        activity_logs l ON u.id = l.user_id
    ORDER BY u.id ASC , l.login_time DESC;

-- ==========================================
-- 8. RE-ENABLE SAFE MODE & VERIFY
-- ==========================================
SET SQL_SAFE_UPDATES = 1; -- Turn safety back on

-- Check results
SELECT * FROM activity_logs;
SELECT * FROM view_class_schedules;
SELECT * FROM users;
