import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { UseCase } from "@/types/framework";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useCases } from "@/data/useCases";

interface AddCustomUseCaseDialogProps {
  onAdd: (useCase: UseCase) => void;
}

const AddCustomUseCaseDialog = ({ onAdd }: AddCustomUseCaseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [availableIndustries, setAvailableIndustries] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [selectedAiTypes, setSelectedAiTypes] = useState<string[]>([]);
  const [complexity, setComplexity] = useState<"low" | "medium" | "high">("medium");
  const [impact, setImpact] = useState<"low" | "medium" | "high">("medium");

  useEffect(() => {
    loadIndustries();
  }, []);

  const loadIndustries = () => {
    // Get unique industries from the use cases catalog
    const uniqueIndustries = Array.from(
      new Set(useCases.map(uc => uc.industry).filter(Boolean))
    ).sort();
    
    setAvailableIndustries(uniqueIndustries);
  };

  const handleAddIndustry = (industry: string) => {
    if (industry && !selectedIndustries.includes(industry)) {
      setSelectedIndustries([...selectedIndustries, industry]);
    }
  };

  const handleRemoveIndustry = (industry: string) => {
    setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
  };

  const handleAddAiType = (type: string) => {
    if (type && !selectedAiTypes.includes(type)) {
      setSelectedAiTypes([...selectedAiTypes, type]);
    }
  };

  const handleRemoveAiType = (type: string) => {
    setSelectedAiTypes(selectedAiTypes.filter(t => t !== type));
  };

  const handleSubmit = () => {
    if (!title || selectedIndustries.length === 0) {
      toast.error("Por favor complete el título y seleccione al menos una industria");
      return;
    }

    const newUseCase: UseCase = {
      id: `custom-${Date.now()}`,
      title,
      category: selectedIndustries[0],
      industry: selectedIndustries.join(", "),
      description,
      aiType: selectedAiTypes.length > 0 ? selectedAiTypes.join(", ") : "Generativa",
      complexity,
      impact,
      benefits: [],
      dataRequirements: ""
    };

    onAdd(newUseCase);
    toast.success("Caso de uso personalizado agregado");
    
    // Reset form
    setTitle("");
    setSelectedIndustries([]);
    setDescription("");
    setSelectedAiTypes([]);
    setComplexity("medium");
    setImpact("medium");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar Caso de Uso Propio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Caso de Uso Personalizado</DialogTitle>
          <DialogDescription>
            Complete la información del caso de uso que desea evaluar
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del Caso de Uso *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Chatbot de atención al cliente"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industria(s) *</Label>
            <Select onValueChange={handleAddIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar industria(s)" />
              </SelectTrigger>
              <SelectContent>
                {availableIndustries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedIndustries.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedIndustries.map((industry) => (
                  <Badge key={industry} variant="secondary" className="flex items-center gap-1">
                    {industry}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleRemoveIndustry(industry)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Seleccione una o más industrias donde aplique este caso de uso
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describa el caso de uso, problema que resuelve y beneficios esperados"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aiType">Tipo(s) de Tecnología IA</Label>
            <Select onValueChange={handleAddAiType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione tipo(s) de IA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                <SelectItem value="Generativa">Generativa</SelectItem>
                <SelectItem value="NLP">Procesamiento de Lenguaje Natural</SelectItem>
                <SelectItem value="Computer Vision">Visión por Computadora</SelectItem>
                <SelectItem value="Predictiva">Predictiva</SelectItem>
                <SelectItem value="Agéntica">Agéntica</SelectItem>
                <SelectItem value="Otra">Otra</SelectItem>
              </SelectContent>
            </Select>
            {selectedAiTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedAiTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="flex items-center gap-1">
                    {type}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleRemoveAiType(type)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Seleccione uno o más tipos de tecnología IA que apliquen
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="complexity">Complejidad Estimada *</Label>
              <Select value={complexity} onValueChange={(v) => setComplexity(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="impact">Impacto Esperado *</Label>
              <Select value={impact} onValueChange={(v) => setImpact(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Bajo</SelectItem>
                  <SelectItem value="medium">Medio</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!title.trim() || selectedIndustries.length === 0}
          >
            Agregar Caso de Uso
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCustomUseCaseDialog;
