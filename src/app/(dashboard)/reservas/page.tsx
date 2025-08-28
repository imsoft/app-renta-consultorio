"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  Phone, 
  Mail, 
  Eye, 
  MessageSquare,
  Filter,
  Search
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// Forzar renderizado dinámico para evitar problemas con Supabase
export const dynamic = 'force-dynamic';

interface Reserva {
  id: string;
  fecha: string;
  hora_inicio: string;
  duracion_horas: number;
  precio_total: number;
  estado: string;
  notas: string;
  consultorios: {
    nombre: string;
    ubicacion: string;
  };
  profiles: {
    nombre: string;
    apellidos: string;
    telefono: string;
    email: string;
  };
}

export default function ReservasPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [consultorioFilter, setConsultorioFilter] = useState("todos");

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchReservas();
    }
  }, [isAuthenticated, user]);

  const fetchReservas = async () => {
    if (!user) return;

    try {
      setLoading(true);

      let query = supabase
        .from('reservas')
        .select(`
          *,
          consultorios (
            nombre,
            ubicacion
          ),
          profiles (
            nombre,
            apellidos,
            telefono,
            email
          )
        `);

      // Filtrar por tipo de usuario
      if (user.role === "professional") {
        query = query.eq('profesional_id', user.id);
      } else if (user.role === "owner") {
        query = query.eq('consultorios.propietario_id', user.id);
      }

      // Aplicar filtros
      if (statusFilter !== "todos") {
        query = query.eq('estado', statusFilter);
      }

      if (consultorioFilter !== "todos") {
        query = query.eq('consultorio_id', consultorioFilter);
      }

      const { data, error } = await query.order('fecha', { ascending: false });

      if (error) {
        console.error('Error fetching reservas:', error);
        return;
      }

      // Filtrar por término de búsqueda
      let filteredData = data || [];
      if (searchTerm) {
        filteredData = filteredData.filter(reserva => 
          reserva.consultorios?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${reserva.profiles?.nombre} ${reserva.profiles?.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setReservas(filteredData);
    } catch (error) {
      console.error('Error fetching reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return 'default';
      case 'pendiente':
        return 'secondary';
      case 'cancelada':
        return 'destructive';
      case 'completada':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'confirmada':
        return 'Confirmada';
      case 'pendiente':
        return 'Pendiente';
      case 'cancelada':
        return 'Cancelada';
      case 'completada':
        return 'Completada';
      default:
        return estado;
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando reservas...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const totalReservas = reservas.length;
  const reservasConfirmadas = reservas.filter(r => r.estado === 'confirmada').length;
  const reservasPendientes = reservas.filter(r => r.estado === 'pendiente').length;
  const ingresosTotales = reservas.reduce((sum, r) => sum + (r.precio_total || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mis Reservas</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona tus reservas de consultorios
            </p>
          </div>
          <Button asChild className="mt-4 sm:mt-0">
            <a href="/dashboard">
              <Calendar className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </a>
          </Button>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar por consultorio o profesional..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="confirmada">Confirmadas</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="cancelada">Canceladas</SelectItem>
                  <SelectItem value="completada">Completadas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={consultorioFilter} onValueChange={setConsultorioFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Todos los consultorios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los consultorios</SelectItem>
                  {/* Aquí se podrían agregar los consultorios específicos */}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setStatusFilter("todos");
                setConsultorioFilter("todos");
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reservas</p>
                  <p className="text-2xl font-bold text-foreground">{totalReservas}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confirmadas</p>
                  <p className="text-2xl font-bold text-foreground">{reservasConfirmadas}</p>
                </div>
                <div className="h-8 w-8 text-green-600 flex items-center justify-center">
                  <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold text-foreground">{reservasPendientes}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-foreground">${ingresosTotales.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Reservas */}
        <div className="space-y-6">
          {reservas.length > 0 ? (
            reservas.map((reserva) => (
              <Card key={reserva.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {reserva.consultorios?.nombre}
                          </h3>
                          <p className="text-muted-foreground">
                            {user?.role === "professional" 
                              ? `${reserva.profiles?.nombre} ${reserva.profiles?.apellidos}`
                              : `${reserva.profiles?.nombre} ${reserva.profiles?.apellidos}`
                            }
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(reserva.estado)}>
                          {getStatusText(reserva.estado)}
                        </Badge>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(reserva.fecha).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {reserva.hora_inicio} ({reserva.duracion_horas} hora{reserva.duracion_horas > 1 ? 's' : ''})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            ${reserva.precio_total?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {user?.role === "professional" ? "Propietario" : "Profesional"}
                          </span>
                        </div>
                      </div>

                      {reserva.notas && (
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground">
                            <strong>Notas:</strong> {reserva.notas}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="lg:ml-6 space-y-3">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contactar
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {reserva.profiles?.telefono && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{reserva.profiles.telefono}</span>
                          </div>
                        )}
                        {reserva.profiles?.email && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{reserva.profiles.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-semibold text-foreground">No hay reservas</h3>
                  <p className="text-muted-foreground">
                    {user?.role === "professional" 
                      ? "No tienes reservas programadas. Busca consultorios disponibles."
                      : "No hay reservas en tus consultorios."
                    }
                  </p>
                                     {user?.role === "professional" && (
                     <Button asChild>
                       <Link href="/consultorios">Buscar consultorios</Link>
                     </Button>
                   )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
