import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Eye, Trash2, Plus, Edit2, Check, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

interface Initiative {
  id: string;
  nombre: string;
  prioridad: 'alta' | 'media' | 'baja';
  unidad_negocio: string | null;
  puntaje_total: number | null;
  recomendacion: 'implementar_ahora' | 'postergar' | 'analizar_mas';
  status_general: string | null;
  porcentaje_avance: number | null;
  fecha_cierre_comprometida: string | null;
}

interface InitiativesTableProps {
  initiatives: Initiative[];
  onSelectInitiative: (id: string) => void;
  onRefresh: () => void;
}

export const InitiativesTable = ({
  initiatives,
  onSelectInitiative,
  onRefresh,
}: InitiativesTableProps) => {
  const { toast } = useToast();
  const [editingBusinessUnit, setEditingBusinessUnit] = useState<string | null>(null);
  const [businessUnits, setBusinessUnits] = useState<string[]>([]);
  const [tempBusinessUnit, setTempBusinessUnit] = useState('');
  const [openPopover, setOpenPopover] = useState(false);

  useEffect(() => {
    loadBusinessUnits();
  }, []);

  const loadBusinessUnits = async () => {
    const { data, error } = await supabase
      .from('business_units')
      .select('nombre')
      .order('nombre');

    if (!error && data) {
      setBusinessUnits(data.map(bu => bu.nombre));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-500/10 text-red-700 dark:text-red-400';
      case 'media': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'baja': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRecommendationLabel = (recommendation: string) => {
    switch (recommendation) {
      case 'implementar_ahora': return 'Implementar ahora';
      case 'postergar': return 'Postergar';
      case 'analizar_mas': return 'Analizar más';
      default: return recommendation;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'implementar_ahora': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'postergar': return 'bg-red-500/10 text-red-700 dark:text-red-400';
      case 'analizar_mas': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('initiatives')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Iniciativa eliminada",
        description: "La iniciativa se ha eliminado correctamente",
      });

      onRefresh();
    } catch (error) {
      console.error('Error deleting initiative:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la iniciativa",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBusinessUnit = async (initiativeId: string) => {
    if (!tempBusinessUnit.trim()) return;

    try {
      const { error } = await supabase
        .from('initiatives')
        .update({ unidad_negocio: tempBusinessUnit.trim() })
        .eq('id', initiativeId);

      if (error) throw error;

      setEditingBusinessUnit(null);
      setTempBusinessUnit('');
      toast({
        title: "Unidad de negocio actualizada",
        description: "Los cambios se han guardado correctamente",
      });
      onRefresh();
    } catch (error) {
      console.error('Error updating business unit:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la unidad de negocio",
        variant: "destructive",
      });
    }
  };

  if (initiatives.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-lg font-medium mb-2">
          No tienes iniciativas todavía
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Crea una nueva iniciativa usando el Framework IA Empresarial para identificar 
          y priorizar casos de uso de inteligencia artificial en tu organización
        </p>
        <Button onClick={() => window.location.href = '/app?new-initiative=true'} className="gap-2">
          <Plus className="h-4 w-4" />
          Comenzar con el Framework
        </Button>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Nombre</TableHead>
              <TableHead className="min-w-[100px]">Prioridad</TableHead>
              <TableHead className="min-w-[100px] hidden xl:table-cell">Status</TableHead>
              <TableHead className="min-w-[120px] hidden xl:table-cell">% Avance</TableHead>
              <TableHead className="min-w-[120px] hidden lg:table-cell">Fecha Cierre</TableHead>
              <TableHead className="min-w-[120px] hidden sm:table-cell">Unidad de Negocio</TableHead>
              <TableHead className="text-right min-w-[80px] hidden md:table-cell">Puntaje</TableHead>
              <TableHead className="min-w-[140px] hidden lg:table-cell">Recomendación</TableHead>
              <TableHead className="text-right min-w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {initiatives.map((initiative) => (
            <TableRow key={initiative.id} className="group">
              <TableCell className="font-medium">
                <div className="flex flex-col gap-1">
                  <span>{initiative.nombre}</span>
                  <span className="text-xs text-muted-foreground sm:hidden">
                    {initiative.unidad_negocio || 'Sin unidad'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getPriorityColor(initiative.prioridad)}>
                  <span className="hidden sm:inline">{initiative.prioridad.charAt(0).toUpperCase() + initiative.prioridad.slice(1)}</span>
                  <span className="sm:hidden">{initiative.prioridad.charAt(0).toUpperCase()}</span>
                </Badge>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <Badge variant={initiative.status_general === 'activa' ? 'default' : 'secondary'}>
                  {initiative.status_general || 'activa'}
                </Badge>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <div className="flex items-center gap-2">
                  <Progress value={initiative.porcentaje_avance || 0} className="w-16" />
                  <span className="text-sm text-muted-foreground">
                    {initiative.porcentaje_avance || 0}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {initiative.fecha_cierre_comprometida 
                  ? new Date(initiative.fecha_cierre_comprometida).toLocaleDateString('es-ES')
                  : '-'}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {editingBusinessUnit === initiative.id ? (
                  <div className="flex items-center gap-2">
                    <Popover open={openPopover} onOpenChange={setOpenPopover}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 justify-between min-w-[150px]"
                        >
                          {tempBusinessUnit || "Seleccionar..."}
                          <Edit2 className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0 bg-background border-border z-50">
                        <Command className="bg-background">
                          <CommandInput 
                            placeholder="Buscar o crear..." 
                            value={tempBusinessUnit}
                            onValueChange={setTempBusinessUnit}
                          />
                          {businessUnits.filter(unit => 
                            unit.toLowerCase().includes(tempBusinessUnit.toLowerCase())
                          ).length === 0 && tempBusinessUnit ? (
                            <CommandEmpty>
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-xs"
                                onClick={() => setOpenPopover(false)}
                              >
                                <Plus className="mr-2 h-3 w-3" />
                                Crear "{tempBusinessUnit}"
                              </Button>
                            </CommandEmpty>
                          ) : (
                            <CommandEmpty>No encontrado.</CommandEmpty>
                          )}
                          <CommandGroup className="max-h-[150px] overflow-auto">
                            {businessUnits
                              .filter(unit => 
                                unit.toLowerCase().includes(tempBusinessUnit.toLowerCase())
                              )
                              .map((unit) => (
                                <CommandItem
                                  key={unit}
                                  onSelect={() => {
                                    setTempBusinessUnit(unit);
                                    setOpenPopover(false);
                                  }}
                                  className="cursor-pointer hover:bg-accent text-xs"
                                >
                                  {unit}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateBusinessUnit(initiative.id)}
                      disabled={!tempBusinessUnit.trim()}
                      className="h-8 w-8 p-0"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingBusinessUnit(null);
                        setTempBusinessUnit('');
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{initiative.unidad_negocio || '-'}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingBusinessUnit(initiative.id);
                        setTempBusinessUnit(initiative.unidad_negocio || '');
                      }}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right hidden md:table-cell">
                {initiative.puntaje_total ? initiative.puntaje_total.toFixed(1) : '-'}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <Badge className={getRecommendationColor(initiative.recomendacion)}>
                  {getRecommendationLabel(initiative.recomendacion)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSelectInitiative(initiative.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-background">
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar iniciativa?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminarán todas las etapas,
                          actividades y colaboradores asociados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(initiative.id)}>
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </Card>
  );
};
