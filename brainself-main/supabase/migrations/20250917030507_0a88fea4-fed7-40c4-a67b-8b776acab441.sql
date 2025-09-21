-- Add teacher name and custom student name columns to student_marks table
ALTER TABLE public.student_marks 
ADD COLUMN IF NOT EXISTS teacher_name text,
ADD COLUMN IF NOT EXISTS custom_student_name text;

-- Update RLS policies for student_marks to check school tags
DROP POLICY IF EXISTS "Students can view their own marks" ON public.student_marks;

-- Create new policy that allows students to view marks if they share school tags with the teacher
CREATE POLICY "Students can view marks from teachers with same school tags" 
ON public.student_marks 
FOR SELECT 
USING (
  -- If student_id is set, check if the student matches the current user
  (student_id = (SELECT id FROM profiles WHERE user_id = auth.uid()))
  OR
  -- If custom_student_name is used, check if it matches current user's nickname
  -- and also check if the teacher and student share school tags
  (custom_student_name IS NOT NULL 
   AND custom_student_name = (SELECT nickname FROM profiles WHERE user_id = auth.uid())
   AND EXISTS (
     SELECT 1 FROM user_school_tags ust1
     INNER JOIN user_school_tags ust2 ON ust1.school_tag_id = ust2.school_tag_id
     WHERE ust1.user_id = auth.uid() 
     AND ust2.user_id = (SELECT user_id FROM profiles WHERE id = teacher_id)
   ))
);

-- Update the trigger to include teacher name when adding marks
CREATE OR REPLACE FUNCTION public.handle_student_mention()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Set teacher name automatically
  IF NEW.teacher_name IS NULL THEN
    NEW.teacher_name = (SELECT nickname FROM profiles WHERE id = NEW.teacher_id);
  END IF;

  -- If a custom student name is provided, create a message for users with that nickname
  IF NEW.custom_student_name IS NOT NULL THEN
    INSERT INTO public.messages (user_id, message_type, title, content)
    SELECT 
      profiles.user_id,
      'mention',
      'You were mentioned in test results',
      'Teacher ' || COALESCE(NEW.teacher_name, 'Unknown') || ' has added marks for you: ' || NEW.subject_name || ' - ' || NEW.marks || ' marks'
    FROM profiles
    WHERE profiles.nickname = NEW.custom_student_name;
  END IF;
  
  RETURN NEW;
END;
$$;