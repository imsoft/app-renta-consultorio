"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Forzar renderizado dinámico para evitar problemas con Supabase
export const dynamic = 'force-dynamic';

import { useState } from "react";
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
import { formatDate, formatCurrency, formatNumber } from "@/lib/utils";

// Array vacío para cuando no hay consultorios
interface ConsultorioBasico {
  id: number;
  nombre: string;
  ubicacion: string;
  precio: number;
  calificacion: number;
  reseñas: number;
  estado: string;
  reservasMes: number;
  ingresosMes: number;
  ultimaReserva: string | null;
  proximaReserva: string | null;
  especialidades: string[];
  ocupacion: number;
  verificado: boolean;
}

const misConsultorios: ConsultorioBasico[] = [];

export default function MisConsultoriosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [sortBy, setSortBy] = useState("nombre");
  const { user, isAuthenticated } = useAuthStore();

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

  // Filtrar y ordenar consultorios
  const filteredConsultorios = misConsultorios
    .filter(consultorio => {
      const matchesSearch = consultorio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           consultorio.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "todos" || consultorio.estado === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "nombre":
          return a.nombre.localeCompare(b.nombre);
        case "precio":
          return b.precio - a.precio;
        case "calificacion":
          return b.calificacion - a.calificacion;
        case "reservas":
          return b.reservasMes - a.reservasMes;
        case "ingresos":
          return b.ingresosMes - a.ingresosMes;
        default:
          return 0;
      }
    });

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
                  <p className="text-2xl font-bold text-foreground">{formatNumber(misConsultorios.length)}</p>
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
                    {formatNumber(misConsultorios.filter(c => c.estado === "activo").length)}
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
                  <p className="text-sm font-medium text-muted-foreground">Reservas este mes</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatNumber(misConsultorios.reduce((sum, c) => sum + c.reservasMes, 0))}
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
                  <p className="text-sm font-medium text-muted-foreground">Ingresos del mes</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(misConsultorios.reduce((sum, c) => sum + c.ingresosMes, 0))}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
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
                    <TableHead>Ocupación</TableHead>
                    <TableHead>Reservas mes</TableHead>
                    <TableHead>Ingresos mes</TableHead>
                    <TableHead>Próxima reserva</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsultorios.map((consultorio) => (
                    <TableRow key={consultorio.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{consultorio.nombre}</div>
                          <div className="text-sm text-muted-foreground">
                            {consultorio.especialidades.slice(0, 2).join(", ")}
                            {consultorio.especialidades.length > 2 && "..."}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          {consultorio.ubicacion}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(consultorio.precio)}/hora</div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(consultorio.estado)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                          <span className="font-medium">{consultorio.calificacion}</span>
                          <span className="text-sm text-muted-foreground ml-1">
                            ({formatNumber(consultorio.reseñas)})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium ${getOcupacionColor(consultorio.ocupacion)}`}>
                          {consultorio.ocupacion}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatNumber(consultorio.reservasMes)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(consultorio.ingresosMes)}</div>
                      </TableCell>
                      <TableCell>
                        {consultorio.proximaReserva ? (
                          <div className="text-sm text-muted-foreground">
                            {formatDate(consultorio.proximaReserva)}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Sin reservas</span>
                        )}
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
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredConsultorios.length === 0 && (
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No se encontraron consultorios
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "todos" 
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "Aún no tienes consultorios registrados"
                  }
                </p>
                {!searchTerm && statusFilter === "todos" && (
                  <Button asChild>
                    <Link href="/consultorios/crear">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear tu primer consultorio
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

    </div>
  );
}
