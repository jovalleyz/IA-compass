import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminStatus = (userId: string | undefined) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('[useAdminStatus] Checking admin status for userId:', userId);
      
      if (!userId) {
        console.log('[useAdminStatus] No userId provided, setting isAdmin to false');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        console.log('[useAdminStatus] Querying user_roles table...');
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();

        console.log('[useAdminStatus] Query result:', { data, error });
        
        if (error) throw error;
        
        const adminStatus = !!data;
        console.log('[useAdminStatus] Setting isAdmin to:', adminStatus);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('[useAdminStatus] Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [userId]);

  return { isAdmin, loading };
};
