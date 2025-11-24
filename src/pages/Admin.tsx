import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Users, ShieldCheck, TrendingUp, FileText, Settings, Trash2, Edit, UserPlus, BarChart3 } from 'lucide-react';
import { AdminAnalytics } from '@/components/AdminAnalytics';
import { CreateUserDialog } from '@/components/CreateUserDialog';
import { AdminSupportPanel } from '@/components/support/AdminSupportPanel';
import { LeadsPanel } from '@/components/LeadsPanel';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserWithRoles {
  id: string;
  email: string;
  nombre: string;
  empresa: string | null;
  pais: string | null;
  telefono: string | null;
  cargo: string | null;
  rol: string | null;
  created_at: string;
  roles: string[];
}

interface SystemStats {
  total_users: number;
  total_initiatives: number;
  total_evaluations: number;
  total_use_cases: number;
  active_collaborations: number;
}

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserWithRoles>>({});
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [pendingSupportCount, setPendingSupportCount] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('users');

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  // Handle URL tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['users', 'roles', 'leads', 'support', 'analytics'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAdmin) {
      loadPendingSupportCount();
      
      // Subscribe to support conversations changes to update badge count
      const channel = supabase
        .channel('support-conversations-admin')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'support_conversations',
          },
          () => {
            loadPendingSupportCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error('No tienes permisos de administrador');
        navigate('/');
        return;
      }

      setIsAdmin(true);
      loadData();
    } catch (error) {
      console.error('Error checking admin status:', error);
      toast.error('Error al verificar permisos');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    await Promise.all([loadUsers(), loadStats()]);
  };

  const loadPendingSupportCount = async () => {
    try {
      const { count, error } = await supabase
        .from('support_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (error) throw error;
      setPendingSupportCount(count || 0);
    } catch (error) {
      console.error('Error loading pending support count:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_all_users_with_roles');
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_system_stats');
      if (error) throw error;
      if (data && data.length > 0) {
        setStats(data[0]);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Error al cargar estadísticas');
    }
  };

  const handleEditUser = (user: UserWithRoles) => {
    setSelectedUser(user);
    setEditedProfile({
      nombre: user.nombre,
      empresa: user.empresa,
      pais: user.pais,
      telefono: user.telefono,
      cargo: user.cargo,
      rol: user.rol,
    });
    setEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(editedProfile)
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast.success('Usuario actualizado exitosamente');
      setEditDialogOpen(false);
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error al actualizar usuario');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No hay sesión activa');
      }

      // Call edge function to delete user
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-delete-user`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: selectedUser.id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar usuario');
      }

      toast.success('Usuario eliminado exitosamente');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
      loadStats();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Error al eliminar usuario. Por favor intenta de nuevo.');
    }
  };

  const handleAssignRole = async (userId: string, role: 'admin' | 'moderator' | 'user') => {
    try {
      const { error } = await supabase.rpc('assign_role_to_user', {
        target_user_id: userId,
        target_role: role,
      });

      if (error) throw error;

      toast.success('Rol asignado exitosamente');
      loadUsers();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Error al asignar rol');
    }
  };

  const handleRemoveRole = async (userId: string, role: 'admin' | 'moderator' | 'user') => {
    try {
      const { error } = await supabase.rpc('remove_role_from_user', {
        target_user_id: userId,
        target_role: role,
      });

      if (error) throw error;

      toast.success('Rol removido exitosamente');
      loadUsers();
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Error al remover rol');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Panel de Administración</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gestiona usuarios, roles y configuración del sistema
          </p>
        </div>
        <Button onClick={() => navigate('/initiatives')} variant="outline" className="w-full md:w-auto">
          Volver al Dashboard
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 md:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Iniciativas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_initiatives}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Evaluaciones</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_evaluations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Casos de Uso</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_use_cases}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Colaboraciones</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_collaborations}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="support" className="relative">
            Soporte
            {pendingSupportCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">
                {pendingSupportCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>
                    Administra todos los usuarios del sistema
                  </CardDescription>
                </div>
                <Button onClick={() => setCreateUserDialogOpen(true)} className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Crear Usuario
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Nombre</TableHead>
                      <TableHead className="min-w-[200px]">Email</TableHead>
                      <TableHead className="min-w-[150px] hidden md:table-cell">Empresa</TableHead>
                      <TableHead className="min-w-[120px] hidden lg:table-cell">País</TableHead>
                      <TableHead className="min-w-[150px]">Roles</TableHead>
                      <TableHead className="text-right min-w-[120px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.nombre}</TableCell>
                        <TableCell className="text-sm">{user.email}</TableCell>
                        <TableCell className="hidden md:table-cell">{user.empresa || '-'}</TableCell>
                        <TableCell className="hidden lg:table-cell">{user.pais || '-'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <Badge key={role} variant="secondary">
                                  {role}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline">Sin rol</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedUser(user);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asignación de Roles</CardTitle>
              <CardDescription>
                Asigna o remueve roles de los usuarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Usuario</TableHead>
                      <TableHead className="min-w-[200px] hidden md:table-cell">Email</TableHead>
                      <TableHead className="min-w-[150px]">Roles Actuales</TableHead>
                      <TableHead className="min-w-[250px]">Asignar Rol</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.nombre}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{user.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role) => (
                              <Badge
                                key={role}
                                variant="secondary"
                                className="cursor-pointer"
                                onClick={() => handleRemoveRole(user.id, role as 'admin' | 'moderator' | 'user')}
                              >
                                {role} ✕
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            <Select
                              value={selectedRole}
                              onValueChange={(value) => {
                                setSelectedRole(value);
                                handleAssignRole(user.id, value as 'admin' | 'moderator' | 'user');
                              }}
                            >
                              <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Seleccionar rol" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="moderator">Moderador</SelectItem>
                                <SelectItem value="user">Usuario</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AdminAnalytics />
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <LeadsPanel />
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <AdminSupportPanel />
        </TabsContent>
      </Tabs>

      {/* Create User Dialog */}
      <CreateUserDialog 
        open={createUserDialogOpen} 
        onOpenChange={setCreateUserDialogOpen}
        onUserCreated={loadUsers}
      />

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Actualiza la información del usuario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={editedProfile.nombre || ''}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, nombre: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <Input
                id="empresa"
                value={editedProfile.empresa || ''}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, empresa: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                value={editedProfile.cargo || ''}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, cargo: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={editedProfile.telefono || ''}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, telefono: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUser}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el
              usuario y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
