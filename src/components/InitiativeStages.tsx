import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ChevronDown, ChevronRight, User, Trash2, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Stage {
  id: string;
  etapa: string;
  orden: number;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  avance: number;
  responsable: string | null;
}

interface Activity {
  id: string;
  nombre: string;
  responsable: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  status: 'no_iniciado' | 'en_progreso' | 'completado' | 'bloqueado';
  notas: string | null;
}

interface Collaborator {
  id: string;
  nombre: string;
  foto_perfil_url: string | null;
}

const DEFAULT_STAGES = [
  { etapa: "Diagnóstico", orden: 1 },
  { etapa: "Diseño", orden: 2 },
  { etapa: "Piloto", orden: 3 },
  { etapa: "Escalamiento", orden: 4 },
  { etapa: "Operativo", orden: 5 },
];

// Componente de actividad sorteable
const SortableActivity = ({ activity, stageId, collaborators, updateActivity, deleteActivity }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-4">
      <div className="space-y-3">
        {/* Fila 1: Handle, Nombre y Fechas, Eliminar */}
        <div className="flex items-start gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mt-2"
          >
            <GripVertical className="h-5 w-5" />
          </div>
          <div className="grid gap-3 md:grid-cols-3 flex-1">
            <Input
              value={activity.nombre || ''}
              onChange={(e) => updateActivity(activity.id, stageId, { nombre: e.target.value })}
              placeholder="Nombre de la actividad"
              className="bg-background"
            />
            
            <Input
              type="date"
              value={activity.fecha_inicio || ''}
              onChange={(e) => updateActivity(activity.id, stageId, { fecha_inicio: e.target.value })}
              className="text-sm bg-background"
            />
            
            <Input
              type="date"
              value={activity.fecha_fin || ''}
              onChange={(e) => updateActivity(activity.id, stageId, { fecha_fin: e.target.value })}
              className="text-sm bg-background"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteActivity(activity.id, stageId)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
            title="Eliminar actividad"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Fila 2: Responsable y Estado */}
        <div className="grid gap-3 md:grid-cols-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="justify-between"
              >
                {activity.responsable ? (
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {collaborators.find((c: any) => c.nombre === activity.responsable)?.nombre || activity.responsable}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Seleccionar responsable</span>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 bg-background border-border z-50">
              <Command className="bg-background">
                <CommandInput placeholder="Buscar colaborador..." />
                <CommandEmpty>No se encontró colaborador.</CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-auto">
                  {collaborators.map((collaborator: any) => (
                    <CommandItem
                      key={collaborator.id}
                      onSelect={() => {
                        updateActivity(activity.id, stageId, { responsable: collaborator.nombre });
                      }}
                      className="cursor-pointer hover:bg-accent"
                    >
                      <User className="mr-2 h-4 w-4" />
                      {collaborator.nombre}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          
          <Select
            value={activity.status}
            onValueChange={(value: 'no_iniciado' | 'en_progreso' | 'completado' | 'bloqueado') => 
              updateActivity(activity.id, stageId, { status: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="no_iniciado">No iniciado</SelectItem>
              <SelectItem value="en_progreso">En progreso</SelectItem>
              <SelectItem value="completado">Completado</SelectItem>
              <SelectItem value="bloqueado">Bloqueado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Fila 3: Notas */}
        <Textarea
          value={activity.notas || ''}
          onChange={(e) => updateActivity(activity.id, stageId, { notas: e.target.value })}
          placeholder="Notas"
          rows={2}
          className="bg-background resize-none"
        />
      </div>
    </Card>
  );
};

export const InitiativeStages = ({ initiativeId }: { initiativeId: string }) => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [activities, setActivities] = useState<Record<string, Activity[]>>({});
  const [openStages, setOpenStages] = useState<Record<string, boolean>>({});
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Referencias para debouncing de actualizaciones
  const updateTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Configurar sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadStages();
    loadCollaborators();
  }, [initiativeId]);

  const loadCollaborators = async () => {
    try {
      // Obtener el dueño de la iniciativa
      const { data: initiative } = await supabase
        .from('initiatives')
        .select('user_id')
        .eq('id', initiativeId)
        .single();

      const userIds: string[] = [];
      if (initiative?.user_id) {
        userIds.push(initiative.user_id);
      }

      // Obtener colaboradores aceptados
      const { data: collabData } = await supabase
        .from('initiative_collaborators')
        .select('user_id')
        .eq('initiative_id', initiativeId)
        .eq('estado', 'aceptado');

      if (collabData) {
        userIds.push(...collabData.map(c => c.user_id));
      }

      // Cargar perfiles públicos o colaboradores existentes
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, nombre, foto_perfil_url')
          .in('id', userIds);

        // Eliminar duplicados
        const uniqueProfiles = (profiles || []).filter(
          (profile, index, self) => index === self.findIndex((p) => p.id === profile.id)
        );

        setCollaborators(uniqueProfiles as Collaborator[]);
      }
    } catch (error) {
      console.error('Error loading collaborators:', error);
    }
  };

  const loadStages = async () => {
    try {
      const { data: stagesData, error: stagesError } = await supabase
        .from('initiative_stages')
        .select('*')
        .eq('initiative_id', initiativeId)
        .order('orden');

      if (stagesError) throw stagesError;

      // Si no hay etapas, crear las etapas por defecto
      if (!stagesData || stagesData.length === 0) {
        await createDefaultStages();
        return;
      }

      setStages(stagesData);

      // Inicializar todas las etapas como abiertas para mejor visibilidad
      const initialOpenState: Record<string, boolean> = {};
      stagesData.forEach(stage => {
        initialOpenState[stage.id] = true;
      });
      setOpenStages(initialOpenState);

      // Cargar actividades para cada etapa
      const activitiesData: Record<string, Activity[]> = {};
      for (const stage of stagesData) {
        const { data, error } = await supabase
          .from('initiative_activities')
          .select('*')
          .eq('stage_id', stage.id)
          .order('created_at');

        if (!error && data) {
          activitiesData[stage.id] = data;
        }
      }

      setActivities(activitiesData);
    } catch (error) {
      console.error('Error loading stages:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las etapas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultStages = async () => {
    try {
      const stagesToInsert = DEFAULT_STAGES.map(stage => ({
        initiative_id: initiativeId,
        ...stage,
      }));

      const { error } = await supabase
        .from('initiative_stages')
        .insert(stagesToInsert);

      if (error) throw error;

      await loadStages();
    } catch (error) {
      console.error('Error creating default stages:', error);
    }
  };

  const addActivity = async (stageId: string) => {
    try {
      const { data, error } = await supabase
        .from('initiative_activities')
        .insert({
          stage_id: stageId,
          nombre: 'Nueva actividad',
          status: 'no_iniciado',
        })
        .select()
        .single();

      if (error) throw error;

      setActivities(prev => ({
        ...prev,
        [stageId]: [...(prev[stageId] || []), data],
      }));

      toast({
        title: "Actividad agregada",
        description: "La nueva actividad se ha creado correctamente",
      });
    } catch (error) {
      console.error('Error adding activity:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar la actividad",
        variant: "destructive",
      });
    }
  };

  // Actualización inmediata del estado local (UI)
  const updateActivityLocal = useCallback((activityId: string, stageId: string, updates: Partial<Activity>) => {
    setActivities(prev => ({
      ...prev,
      [stageId]: prev[stageId].map(a =>
        a.id === activityId ? { ...a, ...updates } : a
      ),
    }));
  }, []);

  // Actualización diferida a la base de datos (debounced)
  const updateActivityDatabase = useCallback(async (activityId: string, updates: Partial<Activity>) => {
    try {
      const { error } = await supabase
        .from('initiative_activities')
        .update(updates)
        .eq('id', activityId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating activity:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la actividad",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Manejar drag end de actividades
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Encontrar la etapa de origen y destino
    let sourceStageId: string | null = null;
    let targetStageId: string | null = null;

    for (const [stageId, stageActivities] of Object.entries(activities)) {
      if (stageActivities.find(a => a.id === active.id)) {
        sourceStageId = stageId;
      }
      if (stageActivities.find(a => a.id === over.id)) {
        targetStageId = stageId;
      }
    }

    if (!sourceStageId) return;

    // Si se mueve dentro de la misma etapa
    if (sourceStageId === targetStageId) {
      const oldIndex = activities[sourceStageId].findIndex(a => a.id === active.id);
      const newIndex = activities[sourceStageId].findIndex(a => a.id === over.id);

      const newActivities = arrayMove(activities[sourceStageId], oldIndex, newIndex);

      setActivities(prev => ({
        ...prev,
        [sourceStageId]: newActivities,
      }));
    } else if (targetStageId) {
      // Mover entre etapas
      const activityToMove = activities[sourceStageId].find(a => a.id === active.id);
      if (!activityToMove) return;

      try {
        // Actualizar la actividad en la base de datos con el nuevo stage_id
        const { error } = await supabase
          .from('initiative_activities')
          .update({ stage_id: targetStageId })
          .eq('id', active.id as string);

        if (error) throw error;

        // Actualizar el estado local
        setActivities(prev => ({
          ...prev,
          [sourceStageId]: prev[sourceStageId].filter(a => a.id !== active.id),
          [targetStageId]: [...prev[targetStageId], { ...activityToMove, stage_id: targetStageId }],
        }));

        toast({
          title: "Actividad movida",
          description: "La actividad se ha movido a otra etapa correctamente",
        });
      } catch (error) {
        console.error('Error moving activity:', error);
        toast({
          title: "Error",
          description: "No se pudo mover la actividad",
          variant: "destructive",
        });
      }
    }
  }, [activities, toast]);

  // Función principal de actualización con debouncing
  const updateActivity = useCallback((activityId: string, stageId: string, updates: Partial<Activity>) => {
    // Actualizar UI inmediatamente
    updateActivityLocal(activityId, stageId, updates);

    // Cancelar timer previo si existe
    if (updateTimers.current[activityId]) {
      clearTimeout(updateTimers.current[activityId]);
    }

    // Programar actualización a BD después de 800ms de inactividad
    updateTimers.current[activityId] = setTimeout(() => {
      updateActivityDatabase(activityId, updates);
      delete updateTimers.current[activityId];
    }, 800);
  }, [updateActivityLocal, updateActivityDatabase]);

  // Función para eliminar actividad
  const deleteActivity = useCallback(async (activityId: string, stageId: string) => {
    try {
      const { error } = await supabase
        .from('initiative_activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;

      setActivities(prev => ({
        ...prev,
        [stageId]: prev[stageId].filter(a => a.id !== activityId),
      }));

      toast({
        title: "Actividad eliminada",
        description: "La actividad se ha eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la actividad",
        variant: "destructive",
      });
    }
  }, [toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completado': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'en_progreso': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'bloqueado': return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Cargando etapas...</div>;
  }

  if (!stages || stages.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No hay etapas configuradas para esta iniciativa.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Etapas del Proyecto</h2>
      
      {stages.map((stage) => (
        <Collapsible
          key={stage.id}
          open={openStages[stage.id]}
          onOpenChange={(open) => setOpenStages(prev => ({ ...prev, [stage.id]: open }))}
        >
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-left flex-1">
                    {openStages[stage.id] ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <div className="flex-1">
                      <CardTitle>{stage.etapa}</CardTitle>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-muted-foreground">
                          {stage.responsable || 'Sin responsable'}
                        </span>
                        <Progress value={stage.avance} className="w-32" />
                        <span className="text-sm text-muted-foreground">
                          {stage.avance}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {/* Actividades con drag & drop */}
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={activities[stage.id]?.map(a => a.id) || []}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {activities[stage.id]?.map((activity) => (
                          <SortableActivity
                            key={activity.id}
                            activity={activity}
                            stageId={stage.id}
                            collaborators={collaborators}
                            updateActivity={updateActivity}
                            deleteActivity={deleteActivity}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  <Button
                    variant="outline"
                    onClick={() => addActivity(stage.id)}
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar actividad
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
};
