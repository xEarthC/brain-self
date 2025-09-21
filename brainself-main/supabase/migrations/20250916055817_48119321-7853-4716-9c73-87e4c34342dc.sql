-- First, let's check if we have any profiles and add some if needed
DO $$
BEGIN
  -- Check if we have any teacher profiles, if not create a dummy one
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'teacher') THEN
    -- Insert a dummy teacher profile (using a UUID that won't conflict)
    INSERT INTO profiles (id, user_id, nickname, email, role) 
    VALUES (
      gen_random_uuid(),
      gen_random_uuid(), 
      'Demo Teacher',
      'teacher@demo.com',
      'teacher'
    );
  END IF;
  
  -- Check if we have any student profiles, if not create a dummy one
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'student') THEN
    -- Insert a dummy student profile
    INSERT INTO profiles (id, user_id, nickname, email, role, registration_number) 
    VALUES (
      gen_random_uuid(),
      gen_random_uuid(), 
      'Demo Student',
      'student@demo.com',
      'student',
      'STU001'
    );
  END IF;
END $$;

-- Now add example marks for testing
INSERT INTO student_marks (student_id, subject_name, marks, grade_level, term, year, teacher_id) VALUES
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