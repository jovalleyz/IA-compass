import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, LayoutDashboard, BarChart3, User, LogOut, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { InitiativesTable } from "@/components/InitiativesTable";
import { InitiativeDetail } from "@/components/InitiativeDetail";
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Initiative {
  id: string;
  nombre: string;
  prioridad: 'alta' | 'media' | 'baja';
  unidad_negocio: string | null;
  puntaje_total: number | null;
  recomendacion: 'implementar_ahora' | 'postergar' | 'analizar_mas';
  descripcion: string | null;
  created_at: string;
  status_general: string | null;
  porcentaje_avance: number | null;
  fecha_cierre_comprometida: string | null;
}

const Initiatives = () => {
  const { t } = useLanguage();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [selectedInitiative, setSelectedInitiative] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminStatus(user?.id);

  const handleSignOut = async () => {
    await signOut();
    // Force full page reload to clear all state
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  useEffect(() => {
    loadInitiatives();
  }, []);

  const loadInitiatives = async () => {
    try {
      const { data, error } = await supabase
        .from('initiatives')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInitiatives(data || []);
    } catch (error) {
      console.error('Error loading initiatives:', error);
      toast({
        title: "Error",
        description: "Error al cargar iniciativas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewInitiative = () => {
    // Redirigir al framework para crear una nueva iniciativa
    navigate('/app?new-initiative=true');
  };

  if (selectedInitiative) {
    return (
      <InitiativeDetail
        initiativeId={selectedInitiative}
        onBack={() => {
          setSelectedInitiative(null);
          loadInitiatives();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Mis Iniciativas</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Gestiona y da seguimiento a tus proyectos de IA
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <ThemeToggle />
            <LanguageSelector />
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex-1 sm:flex-none">
              <LayoutDashboard className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Panel</span>
            </Button>
            <Button variant="outline" onClick={() => navigate('/analytics')} className="flex-1 sm:flex-none">
              <BarChart3 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Analíticas</span>
            </Button>
            {isAdmin && (
              <Button variant="outline" onClick={() => navigate('/admin')} className="flex-1 sm:flex-none border-primary/50 hover:bg-primary/10">
                <Shield className="h-4 w-4 sm:mr-2 text-primary" />
                <span className="hidden sm:inline text-primary">Admin</span>
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/app')}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Framework
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button onClick={handleCreateNewInitiative} className="gap-2 flex-1 sm:flex-none">
              <Plus className="h-4 w-4" />
              <span className="sm:inline">Nueva Iniciativa</span>
            </Button>
          </div>
        </div>

        {/* Tabla de iniciativas */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Cargando iniciativas...</p>
          </div>
        ) : (
          <InitiativesTable
            initiatives={initiatives}
            onSelectInitiative={setSelectedInitiative}
            onRefresh={loadInitiatives}
          />
        )}
      </div>
    </div>
  );
};

export default Initiatives;
