import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      checkUserProfile();
    }
  }, [user, loading]);

  const checkUserProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('framework_completed')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      // Si el usuario ya completó el framework, redirigir a iniciativas
      // A menos que explícitamente quiera crear una nueva iniciativa
      const searchParams = new URLSearchParams(location.search);
      const newInitiative = searchParams.get('new-initiative');

      if (profile?.framework_completed && !newInitiative) {
        navigate('/initiatives', { replace: true });
      } else {
        navigate('/app', { replace: true });
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      // En caso de error, redirigir al framework por defecto
      navigate('/app', { replace: true });
    } finally {
      setCheckingProfile(false);
    }
  };

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
