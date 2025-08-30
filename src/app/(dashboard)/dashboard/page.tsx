"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Building2,
  Star,
  Eye,
  Shield,
  Settings,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// Forzar renderizado dinámico para evitar problemas con Supabase
export const dynamic = 'force-dynamic';

interface DashboardData {
  reservasActivas: number;
  consultoriosFavoritos: number;
  gastosMes: number;
  proximaReserva: {
    consultorio: string;
    fecha: string;
    hora: string;
    duracion: string;
  } | null;
  historialReservas: Array<{
    id: string;
    consultorio: string;
    fecha: string;
    precio: number;
    estado: string;
  }>;
}

interface OwnerDashboardData {
  consultoriosActivos: number;
  reservasPendientes: number;
  ingresosMes: number;
  proximaReserva: {
    consultorio: string;
    profesional: string;
    fecha: string;
    hora: string;
    duracion: string;
  } | null;
  consultorios: Array<{
    id: string;
    nombre: string;
    ubicacion: string;
    precio: number;
    ocupacion: number;
    reservasMes: number;
  }>;
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    reservasActivas: 0,
    consultoriosFavoritos: 0,
    gastosMes: 0,
    proximaReserva: null,
    historialReservas: []
  });
  const [ownerDashboardData, setOwnerDashboardData] = useState<OwnerDashboardData>({
    consultoriosActivos: 0,
    reservasPendientes: 0,
    ingresosMes: 0,
    proximaReserva: null,
    consultorios: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      if (user?.role === "professional") {
        await fetchProfessionalData();
      } else if (user?.role === "owner") {
        await fetchOwnerData();
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessionalData = async () => {
    if (!user) return;
    
    // Obtener reservas activas del usuario
    const { data: reservasActivas, error: reservasError } = await supabase
      .from('reservas')
      .select(`
        *,
        consultorios (
          nombre,
          ubicacion,
          precio_hora
        )
      `)
      .eq('profesional_id', user.id)
      .eq('estado', 'confirmada')
      .gte('fecha', new Date().toISOString().split('T')[0]);

    // Obtener favoritos del usuario
    const { data: favoritos, error: favoritosError } = await supabase
      .from('favoritos')
      .select('*')
      .eq('usuario_id', user.id);

    // Obtener gastos del mes
    const { data: gastosMes, error: gastosError } = await supabase
      .from('reservas')
      .select('precio_total')
      .eq('profesional_id', user.id)
      .gte('fecha', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);

    // Obtener próxima reserva
    const { data: proximaReserva, error: proximaError } = await supabase
      .from('reservas')
      .select(`
        *,
        consultorios (
          nombre
        )
      `)
      .eq('profesional_id', user.id)
      .eq('estado', 'confirmada')
      .gte('fecha', new Date().toISOString().split('T')[0])
      .order('fecha', { ascending: true })
      .order('hora_inicio', { ascending: true })
      .limit(1)
      .single();

    // Obtener historial de reservas
    const { data: historial, error: historialError } = await supabase
      .from('reservas')
      .select(`
        *,
        consultorios (
          nombre
        )
      `)
      .eq('profesional_id', user.id)
      .lt('fecha', new Date().toISOString().split('T')[0])
      .order('fecha', { ascending: false })
      .limit(5);

    if (reservasError) console.error('Error fetching reservas:', reservasError);
    if (favoritosError) console.error('Error fetching favoritos:', favoritosError);
    if (gastosError) console.error('Error fetching gastos:', gastosError);
    if (proximaError && proximaError.code !== 'PGRST116') console.error('Error fetching proxima reserva:', proximaError);
    if (historialError) console.error('Error fetching historial:', historialError);

    setDashboardData({
      reservasActivas: reservasActivas?.length || 0,
      consultoriosFavoritos: favoritos?.length || 0,
      gastosMes: gastosMes?.reduce((sum, item) => sum + (item.precio_total || 0), 0) || 0,
      proximaReserva: proximaReserva ? {
        consultorio: proximaReserva.consultorios?.nombre || 'Consultorio',
        fecha: new Date(proximaReserva.fecha).toLocaleDateString('es-ES'),
        hora: proximaReserva.hora_inicio,
        duracion: `${proximaReserva.duracion_horas} horas`
      } : null,
      historialReservas: historial?.map(item => ({
        id: item.id,
        consultorio: item.consultorios?.nombre || 'Consultorio',
        fecha: new Date(item.fecha).toLocaleDateString('es-ES'),
        precio: item.precio_total || 0,
        estado: item.estado
      })) || []
    });
  };

  const fetchOwnerData = async () => {
    if (!user) return;
    
    // Obtener consultorios activos del propietario
    const { data: consultorios, error: consultoriosError } = await supabase
      .from('consultorios')
      .select('*')
      .eq('propietario_id', user.id)
      .eq('activo', true);

    // Obtener reservas pendientes
    const { data: reservasPendientes, error: reservasError } = await supabase
      .from('reservas')
      .select(`
        *,
        consultorios (
          nombre
        ),
        profiles (
          nombre,
          apellidos
        )
      `)
      .eq('consultorios.propietario_id', user.id)
      .eq('estado', 'pendiente');

    // Obtener ingresos del mes
    const { data: ingresosMes, error: ingresosError } = await supabase
      .from('reservas')
      .select('precio_total')
      .eq('consultorios.propietario_id', user.id)
      .eq('estado', 'confirmada')
      .gte('fecha', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);

    // Obtener próxima reserva
    const { data: proximaReserva, error: proximaError } = await supabase
      .from('reservas')
      .select(`
        *,
        consultorios (
          nombre
        ),
        profiles (
          nombre,
          apellidos
        )
      `)
      .eq('consultorios.propietario_id', user.id)
      .eq('estado', 'confirmada')
      .gte('fecha', new Date().toISOString().split('T')[0])
      .order('fecha', { ascending: true })
      .order('hora_inicio', { ascending: true })
      .limit(1)
      .single();

    if (consultoriosError) console.error('Error fetching consultorios:', consultoriosError);
    if (reservasError) console.error('Error fetching reservas pendientes:', reservasError);
    if (ingresosError) console.error('Error fetching ingresos:', ingresosError);
    if (proximaError && proximaError.code !== 'PGRST116') console.error('Error fetching proxima reserva:', proximaError);

    // Calcular estadísticas de consultorios
    const consultoriosConStats = await Promise.all(
      (consultorios || []).map(async (consultorio) => {
        const { data: reservasMes } = await supabase
          .from('reservas')
          .select('*')
          .eq('consultorio_id', consultorio.id)
          .gte('fecha', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);

        const totalReservas = reservasMes?.length || 0;
        const ocupacion = totalReservas > 0 ? Math.min(100, (totalReservas / 30) * 100) : 0; // Estimación simple

        return {
          id: consultorio.id,
          nombre: consultorio.nombre,
          ubicacion: consultorio.ubicacion,
          precio: consultorio.precio_hora,
          ocupacion: Math.round(ocupacion),
          reservasMes: totalReservas
        };
      })
    );

    setOwnerDashboardData({
      consultoriosActivos: consultorios?.length || 0,
      reservasPendientes: reservasPendientes?.length || 0,
      ingresosMes: ingresosMes?.reduce((sum, item) => sum + (item.precio_total || 0), 0) || 0,
      proximaReserva: proximaReserva ? {
        consultorio: proximaReserva.consultorios?.nombre || 'Consultorio',
        profesional: `${proximaReserva.profiles?.nombre || ''} ${proximaReserva.profiles?.apellidos || ''}`.trim(),
        fecha: new Date(proximaReserva.fecha).toLocaleDateString('es-ES'),
        hora: proximaReserva.hora_inicio,
        duracion: `${proximaReserva.duracion_horas} horas`
      } : null,
      consultorios: consultoriosConStats
    });
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header del Dashboard */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Bienvenido, {user?.nombre}
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.role === "professional" ? "Panel de Profesional" : "Panel de Propietario"}
            </p>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {user?.role === "professional" ? (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Reservas Activas</p>
                      <p className="text-2xl font-bold text-foreground">{dashboardData.reservasActivas}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Favoritos</p>
                      <p className="text-2xl font-bold text-foreground">{dashboardData.consultoriosFavoritos}</p>
                    </div>
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Gastos del Mes</p>
                      <p className="text-2xl font-bold text-foreground">${dashboardData.gastosMes.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Próxima Reserva</p>
                      <p className="text-lg font-bold text-foreground">
                        {dashboardData.proximaReserva ? dashboardData.proximaReserva.fecha : 'Sin reservas'}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Consultorios Activos</p>
                      <p className="text-2xl font-bold text-foreground">{ownerDashboardData.consultoriosActivos}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Reservas Pendientes</p>
                      <p className="text-2xl font-bold text-foreground">{ownerDashboardData.reservasPendientes}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ingresos del Mes</p>
                      <p className="text-2xl font-bold text-foreground">${ownerDashboardData.ingresosMes.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Próxima Reserva</p>
                      <p className="text-lg font-bold text-foreground">
                        {ownerDashboardData.proximaReserva ? ownerDashboardData.proximaReserva.fecha : 'Sin reservas'}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Contenido específico por tipo de usuario */}
        <div className="grid lg:grid-cols-2 gap-8">
          {user?.role === "professional" ? (
            <>
              {/* Próxima reserva */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Próxima Reserva
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData.proximaReserva ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{dashboardData.proximaReserva.consultorio}</h3>
                          <p className="text-sm text-muted-foreground">
                            {dashboardData.proximaReserva.fecha} a las {dashboardData.proximaReserva.hora}
                          </p>
                        </div>
                        <Badge variant="secondary">{dashboardData.proximaReserva.duracion}</Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          Ver detalles
                        </Button>
                        <Button size="sm" variant="outline">
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No tienes reservas próximas</p>
                      <Button className="mt-4" asChild>
                        <Link href="/consultorios">Buscar consultorios</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Historial de reservas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Historial de Reservas</span>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/reservas">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver todas
                      </Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData.historialReservas.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.historialReservas.map((reserva) => (
                        <div key={reserva.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <h4 className="font-medium text-foreground">{reserva.consultorio}</h4>
                            <p className="text-sm text-muted-foreground">{reserva.fecha}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">${reserva.precio.toLocaleString()}</p>
                            <Badge variant="outline" className="text-xs">{reserva.estado}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No hay reservas en el historial</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Próxima reserva */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Próxima Reserva
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ownerDashboardData.proximaReserva ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{ownerDashboardData.proximaReserva.consultorio}</h3>
                          <p className="text-sm text-muted-foreground">
                            {ownerDashboardData.proximaReserva.profesional} - {ownerDashboardData.proximaReserva.fecha} a las {ownerDashboardData.proximaReserva.hora}
                          </p>
                        </div>
                        <Badge variant="secondary">{ownerDashboardData.proximaReserva.duracion}</Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          Ver detalles
                        </Button>
                        <Button size="sm" variant="outline">
                          Contactar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No tienes reservas próximas</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Mis consultorios */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Mis Consultorios</span>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/mis-consultorios">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver todos
                      </Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ownerDashboardData.consultorios.length > 0 ? (
                    <div className="space-y-4">
                      {ownerDashboardData.consultorios.map((consultorio) => (
                        <div key={consultorio.id} className="p-4 border border-border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-foreground">{consultorio.nombre}</h4>
                            <Badge variant="secondary">{consultorio.ocupacion}% ocupado</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{consultorio.ubicacion}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>${consultorio.precio}/hora</span>
                              <span>{consultorio.reservasMes} reservas este mes</span>
                            </div>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/mis-consultorios/${consultorio.id}`}>
                                Gestionar
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No tienes consultorios registrados</p>
                      <Button className="mt-4" asChild>
                        <Link href="/consultorios/crear">Crear consultorio</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {user?.role === "professional" ? (
                  <>
                    <Button variant="outline" className="h-auto p-4 flex-col" asChild>
                      <Link href="/consultorios">
                        <Eye className="h-6 w-6 mb-2" />
                        <span>Buscar consultorios</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col" asChild>
                      <Link href="/favoritos">
                        <Star className="h-6 w-6 mb-2" />
                        <span>Mis favoritos</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col" asChild>
                      <Link href="/reservas">
                        <Calendar className="h-6 w-6 mb-2" />
                        <span>Mis reservas</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col" asChild>
                      <Link href="/perfil">
                        <Users className="h-6 w-6 mb-2" />
                        <span>Mi perfil</span>
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="h-auto p-4 flex-col" asChild>
                      <Link href="/mis-consultorios">
                        <Building2 className="h-6 w-6 mb-2" />
                        <span>Mis consultorios</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col" asChild>
                      <Link href="/consultorios/crear">
                        <Eye className="h-6 w-6 mb-2" />
                        <span>Crear consultorio</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col" asChild>
                      <Link href="/reservas">
                        <Calendar className="h-6 w-6 mb-2" />
                        <span>Gestionar reservas</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col" asChild>
                      <Link href="/ingresos">
                        <DollarSign className="h-6 w-6 mb-2" />
                        <span>Ver ingresos</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col" asChild>
                      <Link href="/perfil">
                        <Users className="h-6 w-6 mb-2" />
                        <span>Mi perfil</span>
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sección de Administración para usuarios admin */}
        {user?.role === "admin" && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Panel de Administración
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex-col" asChild>
                    <Link href="/admin/consultorios">
                      <Building2 className="h-6 w-6 mb-2" />
                      <span>Gestionar Consultorios</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Aprobar y administrar espacios
                      </span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex-col" asChild>
                    <Link href="/admin/security">
                      <Shield className="h-6 w-6 mb-2" />
                      <span>Seguridad</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Monitoreo y alertas
                      </span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex-col" asChild>
                    <Link href="/admin/users">
                      <Users className="h-6 w-6 mb-2" />
                      <span>Gestionar Usuarios</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Administrar cuentas
                      </span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
