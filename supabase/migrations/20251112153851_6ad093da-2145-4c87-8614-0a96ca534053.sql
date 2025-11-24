-- Add bio and is_public columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Update the loadCollaborators query to filter by public profiles
COMMENT ON COLUMN public.profiles.bio IS 'User profile description/biography';
COMMENT ON COLUMN public.profiles.is_public IS 'Whether the user profile is public and can be added as collaborator by others';