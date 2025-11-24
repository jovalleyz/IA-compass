import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PublicUser {
  id: string;
  nombre: string;
  email: string;
  empresa: string | null;
  cargo: string | null;
  pais: string | null;
  foto_perfil_url: string | null;
}

export const useUserSearch = (searchTerm: string) => {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const query = supabase
          .from('profiles')
          .select('id, nombre, email, empresa, cargo, pais, foto_perfil_url')
          .eq('is_public', true)
          .neq('id', user?.id || '');

        // Search by nombre, empresa, cargo, or pais
        const { data, error } = await query.or(
          `nombre.ilike.%${searchTerm}%,` +
          `empresa.ilike.%${searchTerm}%,` +
          `cargo.ilike.%${searchTerm}%,` +
          `pais.ilike.%${searchTerm}%`
        ).limit(10);

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error searching users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  return { users, loading };
};
