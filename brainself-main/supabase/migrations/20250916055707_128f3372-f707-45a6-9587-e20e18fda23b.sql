-- Add example marks for testing
INSERT INTO student_marks (student_id, subject_name, marks, grade_level, term, year, teacher_id, registration_number) VALUES
-- Get a random student profile ID for examples
((SELECT id FROM profiles WHERE role = 'student' LIMIT 1), 'Mathematics', 85, 'grade_10', 'term_1', 2024, (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1), 'REG001'),
((SELECT id FROM profiles WHERE role = 'student' LIMIT 1), 'Science', 92, 'grade_10', 'term_1', 2024, (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1), 'REG001'),
((SELECT id FROM profiles WHERE role = 'student' LIMIT 1), 'English', 78, 'grade_10', 'term_1', 2024, (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1), 'REG001'),
((SELECT id FROM profiles WHERE role = 'student' LIMIT 1), 'History', 88, 'grade_10', 'term_2', 2024, (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1), 'REG001'),
((SELECT id FROM profiles WHERE role = 'student' LIMIT 1), 'Physics', 95, 'grade_10', 'term_2', 2024, (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1), 'REG001');

-- Add some marks with custom names (no student_id)
INSERT INTO student_marks (subject_name, marks, grade_level, term, year, teacher_id, registration_number) VALUES
('Biology', 82, 'grade_11', 'term_1', 2024, (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1), 'John Doe'),
('Chemistry', 76, 'grade_11', 'term_1', 2024, (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1), 'Jane Smith'),
('Geography', 90, 'grade_9', 'term_2', 2024, (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1), 'Alex Johnson');