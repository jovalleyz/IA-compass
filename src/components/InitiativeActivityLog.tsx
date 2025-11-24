import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, UserPlus, MessageCircle, Edit, Trash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Activity {
  id: string;
  nombre: string;
  created_at: string;
  stage_id: string;
  status: string | null;
}

interface InitiativeActivityLogProps {
  initiativeId: string;
}

export const InitiativeActivityLog: React.FC<InitiativeActivityLogProps> = ({
  initiativeId,
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadActivities();

    // Suscribirse a nuevas actividades en tiempo real
    const channel = supabase
      .channel('initiative-activities-log')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'initiative_activities',
          filter: `initiative_id=eq.${initiativeId}`,
        },
        () => {
          loadActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initiativeId]);

  const loadActivities = async () => {
    // Por ahora mostramos las actividades de las etapas de la iniciativa
    const { data: stages } = await supabase
      .from('initiative_stages')
      .select('id')
      .eq('initiative_id', initiativeId);

    if (!stages || stages.length === 0) {
      setActivities([]);
      return;
    }

    const stageIds = stages.map(s => s.id);

    const { data, error } = await supabase
      .from('initiative_activities')
      .select('*')
      .in('stage_id', stageIds)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading activities:', error);
      return;
    }

    setActivities(data || []);
  };

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'completado':
        return <History className="w-4 h-4" />;
      case 'en_progreso':
        return <Edit className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'completado':
        return 'bg-green-500/10 text-green-500';
      case 'en_progreso':
        return 'bg-blue-500/10 text-blue-500';
      case 'bloqueado':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Historial de Cambios</h3>
      </div>

      <ScrollArea className="h-[400px]">
        {activities.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay actividad registrada
          </p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Badge
                  variant="outline"
                  className={`${getActivityColor(activity.status || 'no_iniciado')} mt-1`}
                >
                  {getActivityIcon(activity.status || 'no_iniciado')}
                </Badge>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {activity.nombre}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};
