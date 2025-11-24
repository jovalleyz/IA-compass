import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useSessionTracking = (user: User | null) => {
  const sessionIdRef = useRef<string | null>(null);
  const loginTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    if (!user) {
      // User logged out - update session duration
      if (sessionIdRef.current && loginTimeRef.current) {
        const logoutTime = new Date();
        const durationSeconds = Math.floor((logoutTime.getTime() - loginTimeRef.current.getTime()) / 1000);
        
        (supabase as any)
          .rpc('update_session_logout', {
            p_session_id: sessionIdRef.current,
            p_logout_timestamp: logoutTime.toISOString(),
            p_duration_seconds: durationSeconds,
          })
          .then(() => {
            sessionIdRef.current = null;
            loginTimeRef.current = null;
          });
      }
      return;
    }

    // User logged in - create new session record
    const createSession = async () => {
      try {
        // Get geolocation data
        let geoData: any = {};
        try {
          const geoResponse = await fetch('https://ipapi.co/json/');
          geoData = await geoResponse.json();
        } catch (geoError) {
          console.warn('Could not fetch geo data:', geoError);
        }

        const { data, error } = await (supabase as any).rpc('create_user_session', {
          p_user_id: user.id,
          p_ip_address: geoData.ip || 'unknown',
          p_country: geoData.country_name || 'unknown',
          p_region: geoData.region || null,
          p_city: geoData.city || null,
          p_user_agent: navigator.userAgent,
        });

        if (!error && data) {
          sessionIdRef.current = data as string;
          loginTimeRef.current = new Date();
        } else if (error) {
          console.error('Error creating session:', error);
        }
      } catch (error) {
        console.error('Error in createSession:', error);
      }
    };

    createSession();

    // Update session duration periodically
    const interval = setInterval(() => {
      if (sessionIdRef.current && loginTimeRef.current) {
        const now = new Date();
        const durationSeconds = Math.floor((now.getTime() - loginTimeRef.current.getTime()) / 1000);
        (supabase as any).rpc('update_session_duration', {
          p_session_id: sessionIdRef.current,
          p_duration_seconds: durationSeconds,
        });
      }
    }, 60000); // Update every minute

    return () => {
      clearInterval(interval);
    };
  }, [user]);
};
