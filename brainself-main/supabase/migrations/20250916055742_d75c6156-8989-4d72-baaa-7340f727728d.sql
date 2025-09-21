-- First, let's modify the student_marks table to allow student_id to be nullable 
-- and add a separate column for custom student names
ALTER TABLE student_marks ALTER COLUMN student_id DROP NOT NULL;

-- Add a column for custom student names (when no student_id is provided)
ALTER TABLE student_marks ADD COLUMN custom_student_name text;

-- Now add example marks for testing
INSERT INTO student_marks (student_id, subject_name, marks, grade_level, term, year, teacher_id) VALUES
-- Get a random student profile ID for examples
((SELECT id FROM profiles WHERE role = 'student' LIMIT 1), 'Mathematics', 85, 'grade_10', 'term_1', 2024, (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1)),
((SELECT id FROM profiles WHERE role = 'student' LIMIT 1), 'Science', 92, 'grade_10', 'term_1', 2024, (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1)),
((SELECT id FROM profiles WHERE role = 'student' LIMIT 1), 'English', 78, 'grade_10', 'term_1', 2024, (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1)),
((SELECT id FROM profiles WHERE role = 'student' LIMIT 1), 'History', 88, 'grade_10', 'term_2', 2024, (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1)),
((SELECT id FROM profiles WHERE role = 'student' LIMIT 1), 'Physics', 95, 'grade_10', 'term_2', 2024, (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1));

-- Add some marks with custom names (no student_id)
INSERT INTO student_marks (custom_student_name, subject_name, marks, grade_level, term, year, teacher_id) VALUES
('John Doe', 'Biology', 82, 'grade_11', 'term_1', 2024, (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1)),
('Jane Smith', 'Chemistry', 76, 'grade_11', 'term_1', 2024, (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1)),
('Alex Johnson', 'Geography', 90, 'grade_9', 'term_2', 2024, (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1));