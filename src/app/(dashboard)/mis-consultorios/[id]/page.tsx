"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  DollarSign, 
  Users, 
  Star, 
  Eye, 
  Settings,
  Building2,
  MapPin,
  Clock,
  Phone,
  Mail,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

interface Consultorio {
  id: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  colonia: string;
  ciudad: string;
  estado: string;
  precio: number;
  especialidades: string[];
  horarios: string;
  telefono: string;
  email: string;
  estado_consultorio: string;
  reservas_mes: number;
  ingresos_mes: number;
  calificacion_promedio: number;
  total_reservas: number;
  created_at: string;
}

interface Reserva {
  id: string;
  fecha: string;
  hora: string;
  duracion: number;
  profesional: {
    nombre: string;
    email: string;
    telefono: string;
  };
  estado: string;
  total: number;
  created_at: string;
}

export default function GestionarConsultorioPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [consultorio, setConsultorio] = useState<Consultorio | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const consultorioId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Todos los usuarios pueden gestionar sus consultorios

    fetchConsultorio();
    fetchReservas();
  }, [consultorioId, isAuthenticated, user]);

  const fetchConsultorio = async () => {
    try {
      const { data, error } = await supabase
        .from('consultorios')
        .select('*')
        .eq('id', consultorioId)
        .eq('propietario_id', user?.id)
        .single();

      if (error) throw error;
      setConsultorio(data);
    } catch (error) {
      console.error('Error fetching consultorio:', error);
      setError('No se pudo cargar el consultorio');
    }
  };

  const fetchReservas = async () => {
    try {
      const { data, error } = await supabase
        .from('reservas')
        .select(`
          id,
          fecha,
          hora,
          duracion,
          estado,
          total,
          created_at,
          profesionales:profiles!reservas_profesional_id_fkey(
            nombre,
            email,
            telefono
          )
        `)
        .eq('consultorio_id', consultorioId)
        .order('fecha', { ascending: false });

      if (error) throw error;
      
      // Transformar los datos para que coincidan con la interfaz
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedData = (data || []).map((reserva: any) => ({
        id: reserva.id,
        fecha: reserva.fecha,
        hora: reserva.hora,
        duracion: reserva.duracion,
        estado: reserva.estado,
        total: reserva.total,
        created_at: reserva.created_at,
        profesional: {
          nombre: reserva.profesionales?.nombre || 'Profesional no disponible',
          email: reserva.profesionales?.email || '',
          telefono: reserva.profesionales?.telefono || ''
        }
      }));
      
      setReservas(transformedData);
    } catch (error) {
      console.error('Error fetching reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'confirmada': return 'default';
      case 'pendiente': return 'secondary';
      case 'cancelada': return 'destructive';
      case 'completada': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando consultorio...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !consultorio) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Error</h1>
            <p className="text-muted-foreground mb-6">
              {error || 'No se encontró el consultorio'}
            </p>
            <Button asChild>
              <Link href="/mis-consultorios">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a mis consultorios
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/mis-consultorios"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a mis consultorios
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {consultorio.nombre}
            </h1>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{consultorio.direccion}, {consultorio.colonia}</span>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1" />
                <span>{consultorio.calificacion_promedio.toFixed(1)} ({consultorio.total_reservas} reseñas)</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button asChild variant="outline">
              <Link href={`/consultorios/${consultorio.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                Ver público
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/consultorios/${consultorio.id}/editar`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reservas este mes</p>
                  <p className="text-2xl font-bold text-foreground">{consultorio.reservas_mes}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ingresos del mes</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(consultorio.ingresos_mes)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <Badge variant={consultorio.estado_consultorio === 'activo' ? 'default' : 'secondary'}>
                    {consultorio.estado_consultorio}
                  </Badge>
                </div>
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Precio por hora</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(consultorio.precio)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="reservas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reservas">Reservas</TabsTrigger>
            <TabsTrigger value="detalles">Detalles</TabsTrigger>
            <TabsTrigger value="configuracion">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="reservas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reservas Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                {reservas.length > 0 ? (
                  <div className="space-y-4">
                    {reservas.map((reserva) => (
                      <div key={reserva.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                                                             <h4 className="font-medium text-foreground">
                                 {reserva.profesional?.nombre || 'Profesional no disponible'}
                               </h4>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(reserva.fecha)} a las {formatTime(reserva.hora)} ({reserva.duracion}h)
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            {formatCurrency(reserva.total)}
                          </p>
                          <Badge variant={getEstadoBadgeVariant(reserva.estado)}>
                            {reserva.estado}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay reservas registradas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detalles" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                    <p className="text-foreground">{consultorio.descripcion}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Especialidades</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {consultorio.especialidades.map((especialidad, index) => (
                        <Badge key={index} variant="outline">
                          {especialidad}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Horarios</label>
                    <p className="text-foreground">{consultorio.horarios}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{consultorio.telefono}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{consultorio.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">
                      {consultorio.direccion}, {consultorio.colonia}, {consultorio.ciudad}, {consultorio.estado}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="configuracion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Consultorio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Estado del consultorio</h4>
                    <p className="text-sm text-muted-foreground">
                      Controla si el consultorio está disponible para reservas
                    </p>
                  </div>
                  <Badge variant={consultorio.estado_consultorio === 'activo' ? 'default' : 'secondary'}>
                    {consultorio.estado_consultorio}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Precio por hora</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(consultorio.precio)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Cambiar precio
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Horarios disponibles</h4>
                    <p className="text-sm text-muted-foreground">
                      {consultorio.horarios}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Editar horarios
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="destructive" size="sm">
                    Desactivar consultorio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
