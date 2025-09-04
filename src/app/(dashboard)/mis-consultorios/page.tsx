"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Forzar renderizado dinámico para evitar problemas con Supabase
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  MoreHorizontal,
  Calendar,
  DollarSign,
  Star,
  MapPin,
  Building,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/authStore";
import { useSupabaseStore } from "@/stores/supabaseStore";
import { formatDate, formatCurrency, formatNumber } from "@/lib/utils";

// Interfaz para consultorios del usuario
interface ConsultorioUsuario {
  id: string;
  titulo: string;
  direccion: string;
  ciudad: string;
  estado: string;
  precio_por_hora: number;
  calificacion_promedio: number;
  total_calificaciones: number;
  activo: boolean;
  aprobado: boolean;
  total_reservas: number;
  metros_cuadrados?: number;
  especialidades?: string[];
  created_at: string;
}

export default function MisConsultoriosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [sortBy, setSortBy] = useState("titulo");
  const [consultorios, setConsultorios] = useState<ConsultorioUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { getMyConsultorios, deleteConsultorio } = useSupabaseStore();

  // Función para obtener consultorios del usuario
  const fetchConsultorios = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await getMyConsultorios();
      
      if (error) {
        console.error('Error fetching consultorios:', error);
        return;
      }
      
      if (data) {
        setConsultorios(data);
      }
    } catch (error) {
      console.error('Error fetching consultorios:', error);
    } finally {
      setLoading(false);
    }
  }, [user, getMyConsultorios]);

  // Función para eliminar un consultorio
  const handleDeleteConsultorio = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este consultorio? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setDeletingId(id);
      const { error } = await deleteConsultorio(id);
      
      if (error) {
        console.error('Error deleting consultorio:', error);
        alert('Error al eliminar el consultorio. Por favor, intenta de nuevo.');
        return;
      }
      
      // Eliminar el consultorio del estado local
      setConsultorios(prev => prev.filter(c => c.id !== id));
      alert('Consultorio eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting consultorio:', error);
      alert('Error al eliminar el consultorio. Por favor, intenta de nuevo.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtrar y ordenar consultorios (optimizado con useMemo)
  const filteredConsultorios = useMemo(() => {
    return consultorios
      .filter(consultorio => {
        const matchesSearch = consultorio.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             consultorio.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             consultorio.ciudad.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "todos" || 
                             (statusFilter === "activo" && consultorio.activo) ||
                             (statusFilter === "inactivo" && !consultorio.activo);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "titulo":
            return a.titulo.localeCompare(b.titulo);
          case "precio":
            return b.precio_por_hora - a.precio_por_hora;
          case "calificacion":
            return (b.calificacion_promedio || 0) - (a.calificacion_promedio || 0);
          case "reservas":
            return (b.total_reservas || 0) - (a.total_reservas || 0);
          case "fecha":
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          default:
            return 0;
        }
      });
  }, [consultorios, searchTerm, statusFilter, sortBy]);

  // Estadísticas optimizadas con useMemo
  const stats = useMemo(() => ({
    total: consultorios.length,
    activos: consultorios.filter(c => c.activo).length,
    totalReservas: consultorios.reduce((sum, c) => sum + (c.total_reservas || 0), 0),
    calificacionPromedio: consultorios.length > 0 
      ? (consultorios.reduce((sum, c) => sum + (c.calificacion_promedio || 0), 0) / consultorios.length).toFixed(1)
      : '0.0'
  }), [consultorios]);

  // Cargar consultorios cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated && user && !authLoading) {
      fetchConsultorios();
    } else if (!isAuthenticated && !authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, user, authLoading, fetchConsultorios]);

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Verificar si el usuario está autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <Building className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Acceso restringido</h2>
              <p className="text-muted-foreground mb-4">
                Debes iniciar sesión para ver tus consultorios.
              </p>
              <Button asChild>
                <Link href="/login">Iniciar sesión</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "activo":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>;
      case "inactivo":
        return <Badge variant="secondary">Inactivo</Badge>;
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendiente</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getOcupacionColor = (ocupacion: number) => {
    if (ocupacion >= 80) return "text-green-600";
    if (ocupacion >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-background">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Mis Consultorios
            </h1>
            <p className="text-muted-foreground">
              Gestiona todos tus espacios médicos registrados
            </p>
          </div>
          <Button asChild className="mt-4 sm:mt-0">
            <Link href="/consultorios/crear">
              <Plus className="h-4 w-4 mr-2" />
              Crear nuevo consultorio
            </Link>
          </Button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total consultorios</p>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(stats.total)}</p>
                </div>
                <Building className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Consultorios activos</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatNumber(stats.activos)}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total reservas</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatNumber(stats.totalReservas)}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Calificación promedio</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.calificacionPromedio}
                  </p>
                </div>
                <Star className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o ubicación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="inactivo">Inactivos</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nombre">Nombre</SelectItem>
                  <SelectItem value="precio">Precio (mayor a menor)</SelectItem>
                  <SelectItem value="calificacion">Calificación</SelectItem>
                  <SelectItem value="reservas">Reservas del mes</SelectItem>
                  <SelectItem value="ingresos">Ingresos del mes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de consultorios */}
        <Card>
          <CardHeader>
            <CardTitle>Consultorios registrados ({filteredConsultorios.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Consultorio</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Calificación</TableHead>
                    <TableHead>Reservas</TableHead>
                    <TableHead>Especialidades</TableHead>
                    <TableHead>Fecha creación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                          Cargando consultorios...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredConsultorios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="text-center">
                          <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-lg font-semibold text-foreground mb-2">No se encontraron consultorios</p>
                          <p className="text-muted-foreground mb-4">
                            {searchTerm || statusFilter !== "todos" 
                              ? "No hay consultorios que coincidan con los filtros aplicados."
                              : "Aún no tienes consultorios registrados"
                            }
                          </p>
                          <Button asChild>
                            <Link href="/consultorios/crear">
                              <Plus className="h-4 w-4 mr-2" />
                              Crear tu primer consultorio
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredConsultorios.map((consultorio) => (
                      <TableRow key={consultorio.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">{consultorio.titulo}</div>
                            <div className="text-sm text-muted-foreground">
                              {consultorio.especialidades?.slice(0, 2).join(", ") || "Sin especialidades"}
                              {consultorio.especialidades && consultorio.especialidades.length > 2 && "..."}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            {consultorio.direccion}, {consultorio.ciudad}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatCurrency(consultorio.precio_por_hora)}/hora</div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(consultorio.activo ? "activo" : "inactivo")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                            <span className="font-medium">{consultorio.calificacion_promedio?.toFixed(1) || "0.0"}</span>
                            <span className="text-sm text-muted-foreground ml-1">
                              ({formatNumber(consultorio.total_calificaciones || 0)})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatNumber(consultorio.total_reservas || 0)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {consultorio.especialidades?.slice(0, 2).join(", ") || "Sin especialidades"}
                            {consultorio.especialidades && consultorio.especialidades.length > 2 && "..."}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(consultorio.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/consultorios/${consultorio.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver detalles
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/consultorios/${consultorio.id}/editar`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteConsultorio(consultorio.id)}
                                disabled={deletingId === consultorio.id}
                              >
                                {deletingId === consultorio.id ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Eliminando...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>


          </CardContent>
        </Card>
      </main>

    </div>
  );
}
