-- Create messages table for user notifications
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message_type TEXT NOT NULL, -- 'mention', 'tag_change', 'new_tag'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  read_status BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own messages"
ON public.messages
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
ON public.messages
FOR UPDATE
USING (auth.uid() = user_id);

-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  school_tag_id UUID,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Create group_members table
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  added_by UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Create policies for groups
CREATE POLICY "Teachers and admins can create groups"
ON public.groups
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
  )
);

CREATE POLICY "Teachers and admins can view groups"
ON public.groups
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
  )
);

CREATE POLICY "Group creators can update their groups"
ON public.groups
FOR UPDATE
USING (created_by = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create policies for group_members
CREATE POLICY "Teachers and admins can add members to groups"
ON public.group_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
  )
);

CREATE POLICY "Teachers and admins can view group members"
ON public.group_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
  )
);

CREATE POLICY "Group members can view their memberships"
ON public.group_members
FOR SELECT
USING (auth.uid() = user_id);

-- Create trigger for messages updated_at
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for groups updated_at
CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to create message when user is mentioned in marks
CREATE OR REPLACE FUNCTION public.handle_student_mention()
RETURNS TRIGGER AS $$
BEGIN
  -- If a custom student name is provided, create a message for users with that nickname
  IF NEW.custom_student_name IS NOT NULL THEN
    INSERT INTO public.messages (user_id, message_type, title, content)
    SELECT 
      profiles.user_id,
      'mention',
      'You were mentioned in test results',
      'A teacher has added marks for you: ' || NEW.subject_name || ' - ' || NEW.marks || ' marks'
    FROM profiles
    WHERE profiles.nickname = NEW.custom_student_name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for student mentions
CREATE TRIGGER on_student_marks_mention
AFTER INSERT ON public.student_marks
FOR EACH ROW
EXECUTE FUNCTION public.handle_student_mention();

-- Create function to handle school tag changes
CREATE OR REPLACE FUNCTION public.handle_school_tag_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Create message for tag assignment
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.messages (user_id, message_type, title, content)
    SELECT 
      NEW.user_id,
      'new_tag',
      'New school tag assigned',
      'You have been assigned to a new school tag: ' || st.display_name
    FROM school_tags st
    WHERE st.id = NEW.school_tag_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for school tag changes
CREATE TRIGGER on_school_tag_assignment
AFTER INSERT ON public.user_school_tags
FOR EACH ROW
EXECUTE FUNCTION public.handle_school_tag_change();