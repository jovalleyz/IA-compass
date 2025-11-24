import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Users, Clock, Globe, TrendingUp, AlertTriangle } from 'lucide-react';
import { format, subDays, subMonths, subYears, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface SessionStat {
  date: string;
  total_sessions: number;
  unique_users: number;
  avg_duration: string;
}

interface ActiveUser {
  user_id: string;
  nombre: string;
  email: string;
  total_sessions: number;
  total_time: string;
  avg_session_duration: string;
}

interface CountryStat {
  country: string;
  total_sessions: number;
  unique_users: number;
}

interface UserStats {
  user_id: string;
  nombre: string;
  email: string;
  total_initiatives: number;
  total_evaluations: number;
  total_use_cases: number;
}

interface InactiveInitiative {
  initiative_id: string;
  nombre: string;
  user_name: string;
  user_email: string;
  days_since_update: number;
  last_update: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--warning))', 'hsl(var(--success))'];

export const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month' | 'custom'>('week');
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [sessionStats, setSessionStats] = useState<SessionStat[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [countryStats, setCountryStats] = useState<CountryStat[]>([]);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [inactiveInitiatives, setInactiveInitiatives] = useState<InactiveInitiative[]>([]);
  const [inactiveDays, setInactiveDays] = useState<number>(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [startDate, endDate, inactiveDays]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSessionStats(),
        loadActiveUsers(),
        loadCountryStats(),
        loadUserStats(),
        loadInactiveInitiatives(),
      ]);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Error al cargar analíticas');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionStats = async () => {
    const { data, error } = await supabase.rpc('get_session_stats' as any, {
      start_date: startOfDay(startDate).toISOString(),
      end_date: endOfDay(endDate).toISOString(),
    }) as any;

    if (error) {
      console.error('Error loading session stats:', error);
      return;
    }

    const formattedData = (data || []).map((item: any) => ({
      date: item.date,
      total_sessions: Number(item.total_sessions),
      unique_users: Number(item.unique_users),
      avg_duration: item.avg_duration || '00:00:00',
    }));

    setSessionStats(formattedData);
  };

  const loadActiveUsers = async () => {
    const { data, error } = await supabase.rpc('get_most_active_users' as any, {
      start_date: startOfDay(startDate).toISOString(),
      end_date: endOfDay(endDate).toISOString(),
      limit_count: 10,
    }) as any;

    if (error) {
      console.error('Error loading active users:', error);
      return;
    }

    const formattedData = (data || []).map((item: any) => ({
      user_id: item.user_id,
      nombre: item.nombre,
      email: item.email,
      total_sessions: Number(item.total_sessions),
      total_time: item.total_time || '00:00:00',
      avg_session_duration: item.avg_session_duration || '00:00:00',
    }));

    setActiveUsers(formattedData);
  };

  const loadCountryStats = async () => {
    const { data, error } = await supabase.rpc('get_sessions_by_country' as any, {
      start_date: startOfDay(startDate).toISOString(),
      end_date: endOfDay(endDate).toISOString(),
    }) as any;

    if (error) {
      console.error('Error loading country stats:', error);
      return;
    }

    setCountryStats(data || []);
  };

  const loadUserStats = async () => {
    const { data, error } = await supabase.rpc('get_user_initiatives_stats' as any) as any;

    if (error) {
      console.error('Error loading user stats:', error);
      return;
    }

    setUserStats(data || []);
  };

  const loadInactiveInitiatives = async () => {
    const { data, error } = await supabase.rpc('get_inactive_initiatives' as any, {
      days_inactive: inactiveDays,
    }) as any;

    if (error) {
      console.error('Error loading inactive initiatives:', error);
      return;
    }

    setInactiveInitiatives(data || []);
  };

  const handleDateRangeChange = (range: 'day' | 'week' | 'month' | 'custom') => {
    setDateRange(range);
    const now = new Date();
    
    switch (range) {
      case 'day':
        setStartDate(startOfDay(now));
        setEndDate(endOfDay(now));
        break;
      case 'week':
        setStartDate(subDays(now, 7));
        setEndDate(now);
        break;
      case 'month':
        setStartDate(subMonths(now, 1));
        setEndDate(now);
        break;
    }
  };

  const formatDuration = (duration: string) => {
    if (!duration) return '-';
    const match = duration.match(/(\d+):(\d+):(\d+)/);
    if (!match) return duration;
    const [, hours, minutes] = match;
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando analíticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Rango de Fechas</CardTitle>
          <CardDescription>Selecciona el período para visualizar las estadísticas</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Hoy</SelectItem>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mes</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          {dateRange === 'custom' && (
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP', { locale: es }) : 'Fecha inicio'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={(date) => date && setStartDate(date)} locale={es} />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP', { locale: es }) : 'Fecha fin'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={(date) => date && setEndDate(date)} locale={es} />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Stats Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Conexiones por Día
          </CardTitle>
          <CardDescription>Total de sesiones y usuarios únicos</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sessionStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total_sessions" stroke="hsl(var(--primary))" name="Total Sesiones" />
              <Line type="monotone" dataKey="unique_users" stroke="hsl(var(--secondary))" name="Usuarios Únicos" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Most Active Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuarios Más Activos
          </CardTitle>
          <CardDescription>Top 10 usuarios con más conexiones y tiempo de sesión</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Sesiones</TableHead>
                <TableHead className="text-right">Tiempo Total</TableHead>
                <TableHead className="text-right">Promedio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeUsers.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">{user.nombre}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-right">{user.total_sessions}</TableCell>
                  <TableCell className="text-right">{formatDuration(user.total_time)}</TableCell>
                  <TableCell className="text-right">{formatDuration(user.avg_session_duration)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Conexiones por País
            </CardTitle>
            <CardDescription>Distribución geográfica de sesiones</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={countryStats.map(stat => ({
                    name: stat.country,
                    value: stat.total_sessions,
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {countryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Activity Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Actividad por Usuario
            </CardTitle>
            <CardDescription>Top usuarios por iniciativas, evaluaciones y casos de uso</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userStats.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_initiatives" fill="hsl(var(--primary))" name="Iniciativas" />
                <Bar dataKey="total_evaluations" fill="hsl(var(--secondary))" name="Evaluaciones" />
                <Bar dataKey="total_use_cases" fill="hsl(var(--accent))" name="Casos de Uso" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Inactive Initiatives */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Iniciativas Sin Seguimiento
              </CardTitle>
              <CardDescription>Iniciativas que no han sido actualizadas</CardDescription>
            </div>
            <Select value={inactiveDays.toString()} onValueChange={(v) => setInactiveDays(parseInt(v))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">1 Semana</SelectItem>
                <SelectItem value="30">1 Mes</SelectItem>
                <SelectItem value="90">3 Meses</SelectItem>
                <SelectItem value="365">1 Año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Iniciativa</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Días Inactivo</TableHead>
                <TableHead className="text-right">Última Actualización</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inactiveInitiatives.map((init) => (
                <TableRow key={init.initiative_id}>
                  <TableCell className="font-medium">{init.nombre}</TableCell>
                  <TableCell>{init.user_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{init.user_email}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={init.days_since_update > 90 ? 'destructive' : 'secondary'}>
                      {init.days_since_update} días
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {format(new Date(init.last_update), 'PPP', { locale: es })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
