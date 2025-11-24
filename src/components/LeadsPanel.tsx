import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Download, CheckCircle2, Mail, Phone, Edit2, Save, X, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Lead {
  id: string;
  contact_name: string;
  contact_email: string;
  phone: string | null;
  registered: boolean;
  created_at: string;
  updated_at: string;
  conversation_id: string | null;
  user_id: string | null;
  is_actually_registered?: boolean; // Verificado contra la tabla profiles
}

export const LeadsPanel = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPhone, setEditingPhone] = useState<string | null>(null);
  const [tempPhone, setTempPhone] = useState('');

  useEffect(() => {
    loadLeads();
    subscribeToLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Verificar cuáles emails están realmente registrados en profiles
      if (data && data.length > 0) {
        const emails = data.map(lead => lead.contact_email);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('email')
          .in('email', emails);
        
        const registeredEmails = new Set(profiles?.map(p => p.email) || []);
        
        const leadsWithStatus = data.map(lead => ({
          ...lead,
          is_actually_registered: registeredEmails.has(lead.contact_email)
        }));
        
        setLeads(leadsWithStatus);
      } else {
        setLeads(data || []);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
      toast.error('Error al cargar leads');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToLeads = () => {
    // Suscribirse a cambios en leads
    const leadsChannel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
        },
        () => loadLeads()
      )
      .subscribe();

    // Suscribirse a nuevos registros en profiles para actualizar el estado
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
        },
        () => loadLeads()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(profilesChannel);
    };
  };

  const toggleRegistered = async (leadId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ registered: !currentStatus })
        .eq('id', leadId);

      if (error) throw error;
      toast.success(currentStatus ? 'Lead marcado como no registrado' : 'Lead marcado como registrado');
      loadLeads(); // Recargar para actualizar el estado de verificación
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Error al actualizar lead');
    }
  };

  const updatePhone = async (leadId: string, phone: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ phone: phone.trim() || null })
        .eq('id', leadId);

      if (error) throw error;
      setEditingPhone(null);
      setTempPhone('');
      toast.success('Teléfono actualizado');
    } catch (error) {
      console.error('Error updating phone:', error);
      toast.error('Error al actualizar teléfono');
    }
  };

  const exportToExcel = () => {
    try {
      const exportData = leads.map(lead => ({
        Nombre: lead.contact_name,
        Email: lead.contact_email,
        Teléfono: lead.phone || 'N/A',
        Registrado: lead.registered ? 'Sí' : 'No',
        'Fecha de Contacto': new Date(lead.created_at).toLocaleDateString('es-ES'),
        'Última Actualización': new Date(lead.updated_at).toLocaleDateString('es-ES'),
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Leads');

      // Ajustar ancho de columnas
      const maxWidth = exportData.reduce((w, r) => Math.max(w, r.Nombre.length), 10);
      ws['!cols'] = [
        { wch: maxWidth },
        { wch: 30 },
        { wch: 15 },
        { wch: 12 },
        { wch: 20 },
        { wch: 20 },
      ];

      XLSX.writeFile(wb, `leads_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Archivo exportado exitosamente');
    } catch (error) {
      console.error('Error exporting leads:', error);
      toast.error('Error al exportar leads');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Leads de Contacto</CardTitle>
            <CardDescription>
              {leads.length} leads totales • {leads.filter(l => l.registered).length} registrados
            </CardDescription>
          </div>
          <Button onClick={exportToExcel} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Fecha de Contacto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Registrado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Cargando leads...
                  </TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No hay leads registrados
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.contact_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`mailto:${lead.contact_email}`}
                          className="text-primary hover:underline"
                        >
                          {lead.contact_email}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      {editingPhone === lead.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="tel"
                            value={tempPhone}
                            onChange={(e) => setTempPhone(e.target.value)}
                            className="h-8 w-36"
                            placeholder="Teléfono"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => updatePhone(lead.id, tempPhone)}
                          >
                            <Save className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingPhone(null);
                              setTempPhone('');
                            }}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            {lead.phone ? (
                              <>
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <a 
                                  href={`tel:${lead.phone}`}
                                  className="text-primary hover:underline"
                                >
                                  {lead.phone}
                                </a>
                              </>
                            ) : (
                              <span className="text-muted-foreground text-sm">Sin teléfono</span>
                            )}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingPhone(lead.id);
                              setTempPhone(lead.phone || '');
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {new Date(lead.created_at).toLocaleDateString('es-ES')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(lead.created_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.registered ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Registrado
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex justify-end">
                              {lead.is_actually_registered ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-amber-500" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-background border">
                            <p>
                              {lead.is_actually_registered 
                                ? 'Usuario registrado en la plataforma' 
                                : 'Usuario no registrado aún'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
