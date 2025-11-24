import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Check, Clock, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Collaborator {
  id: string;
  user_id: string;
  estado: string;
  profiles: {
    nombre: string;
    email: string;
  };
}

interface Profile {
  id: string;
  nombre: string;
  email: string;
}

export const InitiativeCollaborators = ({
  initiativeId,
  onClose,
}: {
  initiativeId: string;
  onClose: () => void;
}) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCollaborators();
    loadProfiles();
  }, [initiativeId]);

  const loadCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from('initiative_collaborators')
        .select(`
          *,
          profiles!initiative_collaborators_user_id_fkey (nombre, email)
        `)
        .eq('initiative_id', initiativeId);

      if (error) throw error;

      setCollaborators(data as any || []);
    } catch (error) {
      console.error('Error loading collaborators:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nombre, email');

      if (error) throw error;

      setProfiles(data || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const inviteCollaborator = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('initiative_collaborators')
        .insert({
          initiative_id: initiativeId,
          user_id: userId,
          invited_by: user.id,
          estado: 'pendiente',
        });

      if (error) throw error;

      toast({
        title: "Invitación enviada",
        description: "El colaborador recibirá una notificación",
      });

      loadCollaborators();
      setSearchOpen(false);
    } catch (error: any) {
      console.error('Error inviting collaborator:', error);
      
      if (error.code === '23505') {
        toast({
          title: "Error",
          description: "Este usuario ya es un colaborador",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo enviar la invitación",
          variant: "destructive",
        });
      }
    }
  };

  const removeCollaborator = async (collaboratorId: string) => {
    try {
      const { error } = await supabase
        .from('initiative_collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) throw error;

      toast({
        title: "Colaborador eliminado",
        description: "El colaborador ha sido removido de la iniciativa",
      });

      loadCollaborators();
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el colaborador",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aceptado':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'rechazado':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aceptado': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'rechazado': return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default: return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    }
  };

  // Filtrar perfiles que ya son colaboradores
  const availableProfiles = profiles.filter(
    profile => !collaborators.some(c => c.user_id === profile.id)
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-background">
        <DialogHeader>
          <DialogTitle>Gestionar Colaboradores</DialogTitle>
          <DialogDescription>
            Invita a otros usuarios a colaborar en esta iniciativa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Botón para agregar colaborador */}
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button className="w-full gap-2">
                <UserPlus className="h-4 w-4" />
                Agregar colaborador
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-background z-50" align="start">
              <Command>
                <CommandInput placeholder="Buscar usuario..." />
                <CommandList>
                  <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
                  <CommandGroup>
                    {availableProfiles.map((profile) => (
                      <CommandItem
                        key={profile.id}
                        value={profile.email}
                        onSelect={() => inviteCollaborator(profile.id)}
                      >
                        <div>
                          <p className="font-medium">{profile.nombre}</p>
                          <p className="text-sm text-muted-foreground">{profile.email}</p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Lista de colaboradores */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              Colaboradores ({collaborators.length})
            </h4>
            
            {loading ? (
              <p className="text-muted-foreground text-sm">Cargando...</p>
            ) : collaborators.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No hay colaboradores todavía
              </p>
            ) : (
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(collaborator.estado)}
                      <div>
                        <p className="font-medium">{collaborator.profiles.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          {collaborator.profiles.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(collaborator.estado)}>
                        {collaborator.estado}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCollaborator(collaborator.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
