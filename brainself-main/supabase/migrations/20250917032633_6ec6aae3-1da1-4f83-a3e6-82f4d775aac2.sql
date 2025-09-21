-- Promote Xx_Earthy_xX to admin
UPDATE public.profiles 
SET role = 'admin'::app_role
WHERE nickname = 'Xx_Earthy_xX';