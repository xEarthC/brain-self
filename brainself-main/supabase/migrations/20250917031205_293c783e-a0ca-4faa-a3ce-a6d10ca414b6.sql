-- Update the handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    nickname, 
    email,
    contact_number,
    contact_email,
    school_tag_id
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', 'User'),
    NEW.email,
    NEW.raw_user_meta_data->>'contact_number',
    NEW.raw_user_meta_data->>'contact_email',
    CASE 
      WHEN NEW.raw_user_meta_data->>'school_tag_id' IS NOT NULL 
        AND NEW.raw_user_meta_data->>'school_tag_id' != '' 
      THEN (NEW.raw_user_meta_data->>'school_tag_id')::uuid
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$;