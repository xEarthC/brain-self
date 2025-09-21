-- Create group_chats table for group messaging
CREATE TABLE public.group_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on group_chats
ALTER TABLE public.group_chats ENABLE ROW LEVEL SECURITY;

-- Create policies for group chats
CREATE POLICY "Group members can view group chats" 
ON public.group_chats 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = group_chats.group_id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Group members can insert group chats" 
ON public.group_chats 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = group_chats.group_id 
    AND group_members.user_id = auth.uid()
  ) AND user_id = auth.uid()
);

-- Add trigger for updating timestamps
CREATE TRIGGER update_group_chats_updated_at
BEFORE UPDATE ON public.group_chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update student_marks table to include teacher_id reference for edit permissions
ALTER TABLE public.student_marks ADD CONSTRAINT fk_teacher_profile 
FOREIGN KEY (teacher_id) REFERENCES public.profiles(id);

-- Create function to notify students when added to groups
CREATE OR REPLACE FUNCTION public.handle_group_member_added()
RETURNS TRIGGER AS $$
BEGIN
  -- Get group name
  INSERT INTO public.messages (user_id, message_type, title, content)
  SELECT 
    NEW.user_id,
    'group_invite',
    'Added to Group',
    'You have been added to the group: ' || groups.name
  FROM groups
  WHERE groups.id = NEW.group_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for group member notifications
CREATE TRIGGER trigger_group_member_added
AFTER INSERT ON public.group_members
FOR EACH ROW
EXECUTE FUNCTION public.handle_group_member_added();