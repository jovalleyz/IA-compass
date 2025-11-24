import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Camera, Save, Loader2, Bell, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { countries } from "@/data/countries";

interface ProfileData {
  nombre: string;
  email: string;
  telefono: string;
  rol: string;
  empresa: string;
  pais: string;
  unidad_negocio: string;
  cargo: string;
  foto_perfil_url: string | null;
  sexo: string | null;
  bio: string | null;
  is_public: boolean;
  notify_on_user_connection: boolean;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<ProfileData>({
    nombre: "",
    email: "",
    telefono: "",
    rol: "",
    empresa: "",
    pais: "",
    unidad_negocio: "",
    cargo: "",
    foto_perfil_url: null,
    sexo: null,
    bio: null,
    is_public: false,
    notify_on_user_connection: true,
  });
  const [empresaVisible, setEmpresaVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          ...data,
          sexo: (data as any).sexo || null,
          bio: (data as any).bio || null,
          is_public: (data as any).is_public || false,
          notify_on_user_connection: (data as any).notify_on_user_connection ?? true,
        });
        setEmpresaVisible((data as any).empresa_visible || false);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nombre: profile.nombre,
          telefono: profile.telefono,
          rol: profile.rol,
          empresa: profile.empresa,
          pais: profile.pais,
          unidad_negocio: profile.unidad_negocio,
          cargo: profile.cargo,
          sexo: profile.sexo,
          bio: profile.bio,
          is_public: profile.is_public,
          empresa_visible: empresaVisible,
          notify_on_user_connection: profile.notify_on_user_connection,
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Perfil actualizado correctamente",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      toast({
        title: "Formato no válido",
        description: "Solo se permiten archivos JPG y PNG",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "El tamaño máximo permitido es 2MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      if (profile.foto_perfil_url) {
        const oldPath = profile.foto_perfil_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('profile-pictures')
            .remove([`${user?.id}/${oldPath}`]);
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ foto_perfil_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, foto_perfil_url: publicUrl }));

      toast({
        title: "Foto actualizada",
        description: "Tu foto de perfil se ha actualizado correctamente",
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la foto",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    setDeleting(true);
    try {
      const { error } = await supabase.rpc('delete_user_and_data', {
        target_user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta ha sido eliminada exitosamente",
      });

      // Sign out and redirect
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la cuenta. Por favor contacta a soporte.",
        variant: "destructive",
      });
      setDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Perfil de Usuario</CardTitle>
            <CardDescription>
              Actualiza tu información personal y profesional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Foto de perfil */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile.foto_perfil_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {getInitials(profile.nombre || 'U')}
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    Cambiar foto
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                JPG o PNG. Máximo 2MB. Recomendado: 400x400px
              </p>
            </div>

            {/* Información personal */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo *</Label>
                <Input
                  id="nombre"
                  value={profile.nombre}
                  onChange={(e) => setProfile(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Juan Pérez"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={profile.telefono || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, telefono: e.target.value }))}
                  placeholder="+52 55 1234 5678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={profile.cargo || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, cargo: e.target.value }))}
                  placeholder="Director de Innovación"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Input
                  id="empresa"
                  value={profile.empresa || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, empresa: e.target.value }))}
                  placeholder="Nombre de tu empresa"
                />
                <div className="flex items-center gap-2 mt-2">
                  <Switch
                    id="empresa-visible"
                    checked={empresaVisible}
                    onCheckedChange={setEmpresaVisible}
                  />
                  <Label htmlFor="empresa-visible" className="text-sm text-muted-foreground cursor-pointer">
                    Hacer empresa visible para otros usuarios
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidad_negocio">Unidad de Negocio</Label>
                <Input
                  id="unidad_negocio"
                  value={profile.unidad_negocio || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, unidad_negocio: e.target.value }))}
                  placeholder="Tecnología"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol">Rol</Label>
                <Input
                  id="rol"
                  value={profile.rol || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, rol: e.target.value }))}
                  placeholder="Ejecutivo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pais">País</Label>
                <Select
                  value={profile.pais || ''}
                  onValueChange={(value) => setProfile(prev => ({ ...prev, pais: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un país" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50 max-h-[300px]">
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sexo">Sexo</Label>
                <Select
                  value={profile.sexo || ''}
                  onValueChange={(value) => setProfile(prev => ({ ...prev, sexo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                    <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bio/Description */}
            <div className="space-y-2">
              <Label htmlFor="bio">Descripción del Perfil</Label>
              <Textarea
                id="bio"
                value={profile.bio || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Cuéntanos un poco sobre ti, tu experiencia y área de expertise..."
                rows={4}
              />
            </div>

            {/* Public Profile Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="is_public" className="text-base">Perfil Público</Label>
                <p className="text-sm text-muted-foreground">
                  Permite que otros usuarios te agreguen como colaborador en sus iniciativas
                </p>
              </div>
              <Switch
                id="is_public"
                checked={profile.is_public}
                onCheckedChange={(checked) => setProfile(prev => ({ ...prev, is_public: checked }))}
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card className="max-w-2xl mx-auto mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Configura tus preferencias de notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificar cuando alguien se conecta</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe una notificación cuando un usuario inicie sesión en la plataforma
                </p>
              </div>
              <Switch
                checked={profile.notify_on_user_connection}
                onCheckedChange={(checked) => 
                  setProfile({ ...profile, notify_on_user_connection: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Delete Account Section */}
        <Card className="max-w-2xl mx-auto mt-6 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Eliminar Cuenta
            </CardTitle>
            <CardDescription>
              Esta acción es permanente y eliminará todos tus datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" disabled={deleting}>
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Eliminando cuenta...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar mi cuenta permanentemente
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p className="font-semibold text-destructive">
                      Esta acción NO se puede deshacer.
                    </p>
                    <p>
                      Se eliminarán permanentemente:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Tu perfil y toda tu información personal</li>
                      <li>Todas tus evaluaciones y diagnósticos</li>
                      <li>Todas tus iniciativas y casos de uso</li>
                      <li>Todos tus comentarios y colaboraciones</li>
                      <li>Todo tu historial de sesiones y analíticas</li>
                      <li>Todos tus mensajes y conversaciones</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sí, eliminar mi cuenta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Si tienes dudas, contacta a soporte antes de eliminar tu cuenta
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
