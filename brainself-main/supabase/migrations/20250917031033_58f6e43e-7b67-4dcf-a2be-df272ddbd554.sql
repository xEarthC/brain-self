-- Add contact fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS contact_number text,
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS school_tag_id uuid REFERENCES public.school_tags(id);

-- Create admin messaging function
CREATE OR REPLACE FUNCTION public.send_message_to_all_admins(
  sender_name text,
  sender_contact text,
  message_title text,
  message_content text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert message for all admin users
  INSERT INTO public.messages (user_id, message_type, title, content)
  SELECT 
    profiles.user_id,
    'admin_contact',
    message_title,
    'From: ' || sender_name || ' (' || sender_contact || ')' || E'\n\n' || message_content
  FROM profiles
  WHERE profiles.role = 'admin';
END;
$$;