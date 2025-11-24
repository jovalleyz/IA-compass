import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle2, Circle, Clock, Target, User, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { UseCase, QuestionnaireResponse } from "@/types/framework";

interface InteractiveRoadmapProps {
  selectedUseCases: UseCase[];
  evaluatedUseCases: QuestionnaireResponse[];
}

interface RoadmapItem {
  id?: string;
  use_case_id: string;
  etapa: string;
  descripcion: string;
  responsable: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: "pendiente" | "en_progreso" | "completado" | "bloqueado";
  progreso: number;
  kpi: string;
}

const ETAPAS = [
  { value: "preparacion", label: "Preparación", color: "bg-blue-500" },
  { value: "piloto", label: "Piloto", color: "bg-yellow-500" },
  { value: "escalamiento", label: "Escalamiento", color: "bg-green-500" },
  { value: "optimizacion", label: "Optimización", color: "bg-purple-500" },
];

export const InteractiveRoadmap = ({ selectedUseCases, evaluatedUseCases }: InteractiveRoadmapProps) => {
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [selectedUseCase, setSelectedUseCase] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRoadmapData();
  }, [selectedUseCases]);

  const loadRoadmapData = async () => {
    if (selectedUseCases.length === 0) return;

    try {
      const useCaseIds = selectedUseCases.map(uc => uc.id).filter(Boolean);
      
      const { data, error } = await supabase
        .from('roadmap')
        .select('*')
        .in('use_case_id', useCaseIds);

      if (error) throw error;

      if (data && data.length > 0) {
        setRoadmapItems(data as RoadmapItem[]);
      } else {
        // Initialize roadmap items for new use cases
        const initialItems: RoadmapItem[] = selectedUseCases.map(uc => ({
          use_case_id: uc.id || '',
          etapa: "preparacion",
          descripcion: `Implementación de ${uc.title}`,
          responsable: "",
          fecha_inicio: new Date().toISOString().split('T')[0],
          fecha_fin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          estado: "pendiente" as const,
          progreso: 0,
          kpi: ""
        }));
        setRoadmapItems(initialItems);
      }
    } catch (error) {
      console.error("Error loading roadmap:", error);
      toast.error("Error al cargar el roadmap");
    }
  };

  const saveRoadmapItem = async (item: RoadmapItem) => {
    setLoading(true);
    try {
      if (item.id) {
        const { error } = await supabase
          .from('roadmap')
          .update({
            etapa: item.etapa,
            descripcion: item.descripcion,
            responsable: item.responsable,
            fecha_inicio: item.fecha_inicio,
            fecha_fin: item.fecha_fin,
            estado: item.estado,
            progreso: item.progreso,
            kpi: item.kpi
          })
          .eq('id', item.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('roadmap')
          .insert([item])
          .select()
          .single();

        if (error) throw error;
        
        setRoadmapItems(prev => 
          prev.map(ri => ri.use_case_id === item.use_case_id ? { ...ri, id: data.id } : ri)
        );
      }

      toast.success("Roadmap actualizado correctamente");
    } catch (error) {
      console.error("Error saving roadmap:", error);
      toast.error("Error al guardar el roadmap");
    } finally {
      setLoading(false);
    }
  };

  const updateRoadmapItem = (useCaseId: string, updates: Partial<RoadmapItem>) => {
    setRoadmapItems(prev => 
      prev.map(item => 
        item.use_case_id === useCaseId 
          ? { ...item, ...updates }
          : item
      )
    );
  };

  const getUseCaseTitle = (useCaseId: string) => {
    return selectedUseCases.find(uc => uc.id === useCaseId)?.title || "Caso de uso";
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "completado": return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "en_progreso": return <Clock className="h-5 w-5 text-yellow-500" />;
      case "bloqueado": return <AlertCircle className="h-5 w-5 text-destructive" />;
      default: return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTimelineProgress = () => {
    if (roadmapItems.length === 0) return 0;
    const totalProgress = roadmapItems.reduce((sum, item) => sum + item.progreso, 0);
    return Math.round(totalProgress / roadmapItems.length);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Roadmap Interactivo de Implementación
          </CardTitle>
          <CardDescription>
            Planifica y da seguimiento a la implementación de cada caso de uso validado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progreso General del Roadmap</span>
              <span className="text-sm font-bold">{getTimelineProgress()}%</span>
            </div>
            <Progress value={getTimelineProgress()} className="h-3" />
          </div>

          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="timeline">Vista Timeline</TabsTrigger>
              <TabsTrigger value="details">Detalles por Caso</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-4 mt-4">
              <div className="relative">
                {ETAPAS.map((etapa, idx) => {
                  const itemsInEtapa = roadmapItems.filter(item => item.etapa === etapa.value);
                  
                  return (
                    <div key={etapa.value} className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`h-3 w-3 rounded-full ${etapa.color}`} />
                        <h3 className="font-semibold text-lg">{etapa.label}</h3>
                        <Badge variant="secondary">{itemsInEtapa.length} casos</Badge>
                      </div>
                      
                      <div className="ml-6 border-l-2 border-border pl-6 space-y-3">
                        {itemsInEtapa.map((item) => (
                          <Card key={item.use_case_id} className="bg-muted/30">
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {getStatusIcon(item.estado)}
                                    <h4 className="font-medium">{getUseCaseTitle(item.use_case_id)}</h4>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      <span>{item.responsable || "Sin asignar"}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>{item.fecha_inicio} - {item.fecha_fin}</span>
                                    </div>
                                  </div>
                                  <Progress value={item.progreso} className="h-2 mt-2" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {itemsInEtapa.length === 0 && (
                          <p className="text-sm text-muted-foreground italic">No hay casos en esta etapa</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="mb-4">
                <Label>Seleccionar Caso de Uso</Label>
                <Select value={selectedUseCase} onValueChange={setSelectedUseCase}>
                  <SelectTrigger>
                    <SelectValue placeholder="Elige un caso de uso" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedUseCases.map((uc) => (
                      <SelectItem key={uc.id} value={uc.id || ''}>
                        {uc.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedUseCase && roadmapItems.find(item => item.use_case_id === selectedUseCase) && (
                <Card>
                  <CardHeader>
                    <CardTitle>{getUseCaseTitle(selectedUseCase)}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const item = roadmapItems.find(ri => ri.use_case_id === selectedUseCase)!;
                      
                      return (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Etapa</Label>
                              <Select 
                                value={item.etapa} 
                                onValueChange={(value) => updateRoadmapItem(selectedUseCase, { etapa: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ETAPAS.map(etapa => (
                                    <SelectItem key={etapa.value} value={etapa.value}>
                                      {etapa.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Estado</Label>
                              <Select 
                                value={item.estado} 
                                onValueChange={(value: any) => updateRoadmapItem(selectedUseCase, { estado: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pendiente">Pendiente</SelectItem>
                                  <SelectItem value="en_progreso">En Progreso</SelectItem>
                                  <SelectItem value="completado">Completado</SelectItem>
                                  <SelectItem value="bloqueado">Bloqueado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label>Descripción</Label>
                            <Textarea 
                              value={item.descripcion}
                              onChange={(e) => updateRoadmapItem(selectedUseCase, { descripcion: e.target.value })}
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label>Responsable</Label>
                            <Input 
                              value={item.responsable}
                              onChange={(e) => updateRoadmapItem(selectedUseCase, { responsable: e.target.value })}
                              placeholder="Nombre del responsable"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Fecha Inicio</Label>
                              <Input 
                                type="date"
                                value={item.fecha_inicio}
                                onChange={(e) => updateRoadmapItem(selectedUseCase, { fecha_inicio: e.target.value })}
                              />
                            </div>

                            <div>
                              <Label>Fecha Fin</Label>
                              <Input 
                                type="date"
                                value={item.fecha_fin}
                                onChange={(e) => updateRoadmapItem(selectedUseCase, { fecha_fin: e.target.value })}
                              />
                            </div>
                          </div>

                          <div>
                            <Label>KPI / Métrica de Éxito</Label>
                            <Input 
                              value={item.kpi}
                              onChange={(e) => updateRoadmapItem(selectedUseCase, { kpi: e.target.value })}
                              placeholder="Ej: Reducción de 30% en tiempo de proceso"
                            />
                          </div>

                          <div>
                            <Label>Progreso (%)</Label>
                            <div className="flex items-center gap-4">
                              <Input 
                                type="number"
                                min="0"
                                max="100"
                                value={item.progreso}
                                onChange={(e) => updateRoadmapItem(selectedUseCase, { progreso: parseInt(e.target.value) || 0 })}
                                className="w-24"
                              />
                              <Progress value={item.progreso} className="flex-1" />
                            </div>
                          </div>

                          <Button 
                            onClick={() => saveRoadmapItem(item)} 
                            disabled={loading}
                            className="w-full"
                          >
                            {loading ? "Guardando..." : "Guardar Cambios"}
                          </Button>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
