"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { formatDate, formatCurrency, formatNumber, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import {
  Heart,
  Search,
  MapPin,
  Star,
  Calendar,
  Clock,
  DollarSign,
  Building,
  Filter,
  MoreHorizontal,
  Eye,
  Trash2,
  Plus,
  XCircle,
} from "lucide-react";

// Datos simulados de consultorios favoritos
const consultoriosFavoritos = [
  {
    id: 1,
    nombre: "Centro Médico Norte",
    ubicacion: "Polanco, CDMX",
    precio: 800,
    calificacion: 4.8,
    reseñas: 156,
    especialidades: ["Cardiología", "Neurología", "Traumatología"],
    horarios: "Lun-Vie 8:00-20:00",
    equipamiento: ["Equipo de rayos X", "Sala de espera", "Estacionamiento"],
    distancia: "2.3 km",
    ultimaVisita: "2024-01-15",
    proximaReserva: "2024-01-28",
    estado: "disponible",
    favorito: true
  },
  {
    id: 2,
    nombre: "Clínica del Sur",
    ubicacion: "Coyoacán, CDMX",
    precio: 650,
    calificacion: 4.6,
    reseñas: 89,
    especialidades: ["Pediatría", "Ginecología", "Medicina General"],
    horarios: "Lun-Sáb 9:00-18:00",
    equipamiento: ["Laboratorio", "Farmacia", "Área infantil"],
    distancia: "5.1 km",
    ultimaVisita: "2024-01-10",
    proximaReserva: null,
    estado: "disponible",
    favorito: true
  },
  {
    id: 3,
    nombre: "Consultorio Especializado Este",
    ubicacion: "Iztapalapa, CDMX",
    precio: 500,
    calificacion: 4.4,
    reseñas: 203,
    especialidades: ["Dermatología", "Oftalmología"],
    horarios: "Mar-Jue 10:00-19:00",
    equipamiento: ["Equipo dermatológico", "Lámpara de Wood"],
    distancia: "8.7 km",
    ultimaVisita: "2024-01-05",
    proximaReserva: "2024-02-02",
    estado: "disponible",
    favorito: true
  },
  {
    id: 4,
    nombre: "Centro de Salud Integral",
    ubicacion: "Tlalpan, CDMX",
    precio: 750,
    calificacion: 4.9,
    reseñas: 312,
    especialidades: ["Medicina Integrativa", "Nutrición", "Psicología"],
    horarios: "Lun-Vie 7:00-21:00",
    equipamiento: ["Sala de meditación", "Gimnasio", "Cafetería"],
    distancia: "12.3 km",
    ultimaVisita: "2024-01-20",
    proximaReserva: null,
    estado: "disponible",
    favorito: true
  },
  {
    id: 5,
    nombre: "Clínica de Especialidades",
    ubicacion: "Miguel Hidalgo, CDMX",
    precio: 900,
    calificacion: 4.7,
    reseñas: 178,
    especialidades: ["Ortopedia", "Fisioterapia", "Rehabilitación"],
    horarios: "Lun-Sáb 8:00-20:00",
    equipamiento: ["Equipo de rehabilitación", "Piscina terapéutica"],
    distancia: "3.8 km",
    ultimaVisita: "2024-01-12",
    proximaReserva: "2024-01-30",
    estado: "disponible",
    favorito: true
  }
];

export default function FavoritosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [especialidadFilter, setEspecialidadFilter] = useState("todas");
  const [precioFilter, setPrecioFilter] = useState("todos");
  const [sortBy, setSortBy] = useState("nombre");
  const { user, isAuthenticated } = useAuthStore();

  // Verificar si el usuario está autenticado y es profesional
  if (!isAuthenticated || user?.tipo !== "profesional") {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Acceso restringido</h2>
              <p className="text-muted-foreground mb-4">
                Solo los profesionales pueden ver sus favoritos.
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

  // Obtener todas las especialidades únicas
  const todasEspecialidades = Array.from(
    new Set(consultoriosFavoritos.flatMap(c => c.especialidades))
  ).sort();

  // Filtrar y ordenar consultorios favoritos
  const filteredFavoritos = consultoriosFavoritos
    .filter(consultorio => {
      const matchesSearch = consultorio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           consultorio.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           consultorio.especialidades.some(esp => esp.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesEspecialidad = especialidadFilter === "todas" || 
                                 consultorio.especialidades.includes(especialidadFilter);
      
      const matchesPrecio = precioFilter === "todos" || 
                           (precioFilter === "bajo" && consultorio.precio <= 600) ||
                           (precioFilter === "medio" && consultorio.precio > 600 && consultorio.precio <= 800) ||
                           (precioFilter === "alto" && consultorio.precio > 800);
      
      return matchesSearch && matchesEspecialidad && matchesPrecio;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "nombre":
          return a.nombre.localeCompare(b.nombre);
        case "precio":
          return a.precio - b.precio;
        case "calificacion":
          return b.calificacion - a.calificacion;
        case "distancia":
          return parseFloat(a.distancia) - parseFloat(b.distancia);
        case "ultimaVisita":
          return new Date(b.ultimaVisita).getTime() - new Date(a.ultimaVisita).getTime();
        default:
          return 0;
      }
    });

  const handleRemoveFavorite = (consultorioId: number) => {
    // Aquí se implementaría la lógica para remover de favoritos
    console.log("Remover de favoritos:", consultorioId);
  };

  const getPrecioBadge = (precio: number) => {
    if (precio <= 600) return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Económico</Badge>;
    if (precio <= 800) return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medio</Badge>;
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Premium</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-foreground">Mis Favoritos</h1>
          </div>
          <p className="text-muted-foreground">
            Consultorios que has guardado como favoritos para acceso rápido
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Favoritos</p>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(consultoriosFavoritos.length)}</p>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Con Reservas</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatNumber(consultoriosFavoritos.filter(c => c.proximaReserva).length)}
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
                  <p className="text-sm font-medium text-muted-foreground">Precio Promedio</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(Math.round(consultoriosFavoritos.reduce((sum, c) => sum + c.precio, 0) / consultoriosFavoritos.length))}
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
                  <p className="text-sm font-medium text-muted-foreground">Calificación Promedio</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(consultoriosFavoritos.reduce((sum, c) => sum + c.calificacion, 0) / consultoriosFavoritos.length).toFixed(1)}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
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
                    placeholder="Buscar por nombre, ubicación o especialidad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={especialidadFilter} onValueChange={setEspecialidadFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Especialidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las especialidades</SelectItem>
                  {todasEspecialidades.map(especialidad => (
                    <SelectItem key={especialidad} value={especialidad}>
                      {especialidad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={precioFilter} onValueChange={setPrecioFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Rango de precio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los precios</SelectItem>
                  <SelectItem value="bajo">Hasta $600</SelectItem>
                  <SelectItem value="medio">$601 - $800</SelectItem>
                  <SelectItem value="alto">Más de $800</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nombre">Nombre</SelectItem>
                  <SelectItem value="precio">Precio (menor a mayor)</SelectItem>
                  <SelectItem value="calificacion">Calificación</SelectItem>
                  <SelectItem value="distancia">Distancia</SelectItem>
                  <SelectItem value="ultimaVisita">Última visita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de favoritos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Consultorios Favoritos</span>
              <Badge variant="secondary">{formatNumber(filteredFavoritos.length)} favoritos</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Consultorio</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Calificación</TableHead>
                    <TableHead>Especialidades</TableHead>
                    <TableHead>Última visita</TableHead>
                    <TableHead>Próxima reserva</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFavoritos.map((consultorio) => (
                    <TableRow key={consultorio.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{consultorio.nombre}</div>
                          <div className="text-sm text-muted-foreground">
                            {consultorio.horarios}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          {consultorio.ubicacion}
                          <span className="ml-2 text-xs">({consultorio.distancia})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatCurrency(consultorio.precio)}/hora</div>
                          {getPrecioBadge(consultorio.precio)}
                        </div>
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
                        <div className="flex flex-wrap gap-1">
                          {consultorio.especialidades.slice(0, 2).map((esp, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {esp}
                            </Badge>
                          ))}
                          {consultorio.especialidades.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{consultorio.especialidades.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(consultorio.ultimaVisita)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {consultorio.proximaReserva ? (
                          <div className="text-sm text-green-600">
                            {formatDate(consultorio.proximaReserva)}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Sin reserva</span>
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
                              <Link href={`/consultorios/${consultorio.id}`}>
                                <Calendar className="h-4 w-4 mr-2" />
                                Reservar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleRemoveFavorite(consultorio.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Quitar de favoritos
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredFavoritos.length === 0 && (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No se encontraron favoritos
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || especialidadFilter !== "todas" || precioFilter !== "todos"
                    ? "Intenta ajustar los filtros de búsqueda"
                    : "Aún no tienes consultorios en favoritos"
                  }
                </p>
                {!searchTerm && especialidadFilter === "todas" && precioFilter === "todos" && (
                  <Button asChild>
                    <Link href="/consultorios">
                      <Plus className="h-4 w-4 mr-2" />
                      Explorar consultorios
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
