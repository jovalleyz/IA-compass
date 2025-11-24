-- Fix delete_user_and_data function to have proper WHERE clauses on ALL deletes
CREATE OR REPLACE FUNCTION delete_user_and_data(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow admins to delete any account OR users to delete their own account
  IF NOT (has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = target_user_id) THEN
    RAISE EXCEPTION 'You can only delete your own account or must be an admin';
  END IF;

  -- Delete in order to respect foreign key constraints
  -- Delete user roles
  DELETE FROM user_roles WHERE user_id = target_user_id;
  
  -- Delete session analytics
  DELETE FROM session_analytics WHERE user_id = target_user_id;
  
  -- Delete notifications
  DELETE FROM notifications WHERE user_id = target_user_id;
  
  -- Delete chat history
  DELETE FROM chat_history WHERE user_id = target_user_id;
  
  -- Delete initiative activities (through stages and initiatives)
  DELETE FROM initiative_activities 
  WHERE stage_id IN (
    SELECT id FROM initiative_stages 
    WHERE initiative_id IN (
      SELECT id FROM initiatives WHERE user_id = target_user_id
    )
  );
  
  -- Delete initiative comments
  DELETE FROM initiative_comments WHERE user_id = target_user_id;
  
  -- Delete initiative collaborators where user is collaborator or inviter
  DELETE FROM initiative_collaborators 
  WHERE user_id = target_user_id OR invited_by = target_user_id;
  
  -- Delete initiative stages
  DELETE FROM initiative_stages 
  WHERE initiative_id IN (
    SELECT id FROM initiatives WHERE user_id = target_user_id
  );
  
  -- Delete initiatives
  DELETE FROM initiatives WHERE user_id = target_user_id;
  
  -- Delete roadmap entries
  DELETE FROM roadmap 
  WHERE use_case_id IN (
    SELECT id FROM use_cases WHERE user_id = target_user_id
  );
  
  -- Delete use cases
  DELETE FROM use_cases WHERE user_id = target_user_id;
  
  -- Delete evaluations
  DELETE FROM evaluations WHERE user_id = target_user_id;
  
  -- Delete chat messages where user is sender
  DELETE FROM chat_messages WHERE sender_id = target_user_id;
  
  -- Delete conversations where user is participant
  DELETE FROM conversations 
  WHERE participant1_id = target_user_id OR participant2_id = target_user_id;
  
  -- Delete support messages where user is sender
  DELETE FROM support_messages WHERE sender_id = target_user_id;
  
  -- Update support conversations (don't delete, just unlink user)
  UPDATE support_conversations 
  SET user_id = NULL 
  WHERE user_id = target_user_id;
  
  -- Finally delete the profile
  DELETE FROM profiles WHERE id = target_user_id;
  
  -- Delete from auth.users
  DELETE FROM auth.users WHERE id = target_user_id;
  
END;
$$;