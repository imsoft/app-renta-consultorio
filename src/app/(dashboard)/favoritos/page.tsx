"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Heart, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  Search,
  MoreHorizontal,
  Eye
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// Forzar renderizado dinámico para evitar problemas con Supabase
export const dynamic = 'force-dynamic';

interface Favorito {
  id: string;
  created_at: string;
  consultorio_id: string;
  consultorios: {
    id: string;
    nombre: string;
    ubicacion: string;
    precio_hora: number;
    horario_apertura: string;
    horario_cierre: string;
    especialidades: string[];
    calificacion_promedio: number;
    total_calificaciones: number;
  }[];
}

export default function FavoritosPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [especialidadFilter, setEspecialidadFilter] = useState("todas");
  const [precioFilter, setPrecioFilter] = useState("todos");
  const [ordenFilter, setOrdenFilter] = useState("nombre");

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchFavoritos();
    }
  }, [isAuthenticated, user]);

  const fetchFavoritos = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('favoritos')
        .select(`
          id,
          created_at,
          consultorio_id,
          consultorios (
            id,
            nombre,
            ubicacion,
            precio_hora,
            horario_apertura,
            horario_cierre,
            especialidades,
            calificacion_promedio,
            total_calificaciones
          )
        `)
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching favoritos:', error);
        return;
      }

      setFavoritos(data || []);
    } catch (error) {
      console.error('Error fetching favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrecioLabel = (precio: number) => {
    if (precio < 500) return { text: "Económico", color: "bg-green-100 text-green-800" };
    if (precio < 800) return { text: "Medio", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Premium", color: "bg-pink-100 text-pink-800" };
  };

  const calcularDistancia = () => {
    // Simulación simple de distancia - en producción se usaría una API de geocoding
    const distancias = [2.3, 3.8, 5.1, 8.7, 12.3];
    return distancias[Math.floor(Math.random() * distancias.length)];
  };

  const filtrarFavoritos = () => {
    let filtrados = favoritos;

    // Filtro por búsqueda
    if (searchTerm) {
      filtrados = filtrados.filter(favorito => {
        const consultorio = favorito.consultorios[0];
        if (!consultorio) return false;
        return consultorio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
               consultorio.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
               consultorio.especialidades.some(esp => 
                 esp.toLowerCase().includes(searchTerm.toLowerCase())
               );
      });
    }

    // Filtro por especialidad
    if (especialidadFilter !== "todas") {
      filtrados = filtrados.filter(favorito => {
        const consultorio = favorito.consultorios[0];
        return consultorio?.especialidades.includes(especialidadFilter);
      });
    }

    // Filtro por precio
    if (precioFilter !== "todos") {
      filtrados = filtrados.filter(favorito => {
        const consultorio = favorito.consultorios[0];
        if (!consultorio) return false;
        const precio = consultorio.precio_hora;
        switch (precioFilter) {
          case "economico":
            return precio < 500;
          case "medio":
            return precio >= 500 && precio < 800;
          case "premium":
            return precio >= 800;
          default:
            return true;
        }
      });
    }

    // Ordenamiento
    filtrados.sort((a, b) => {
      const consultorioA = a.consultorios[0];
      const consultorioB = b.consultorios[0];
      if (!consultorioA || !consultorioB) return 0;
      
      switch (ordenFilter) {
        case "nombre":
          return consultorioA.nombre.localeCompare(consultorioB.nombre);
        case "precio":
          return consultorioA.precio_hora - consultorioB.precio_hora;
        case "calificacion":
          return (consultorioB.calificacion_promedio || 0) - (consultorioA.calificacion_promedio || 0);
        case "distancia":
          return calcularDistancia() - calcularDistancia();
        default:
          return 0;
      }
    });

    return filtrados;
  };

  const favoritosFiltrados = filtrarFavoritos();

  const totalFavoritos = favoritos.length;
  const precioPromedio = favoritos.length > 0 
    ? Math.round(favoritos.reduce((sum, f) => sum + (f.consultorios[0]?.precio_hora || 0), 0) / favoritos.length)
    : 0;
  const calificacionPromedio = favoritos.length > 0
    ? Math.round((favoritos.reduce((sum, f) => sum + (f.consultorios[0]?.calificacion_promedio || 0), 0) / favoritos.length) * 10) / 10
    : 0;

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando favoritos...</p>
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <Heart className="h-8 w-8 mr-3 text-red-500" />
              Mis Favoritos
            </h1>
            <p className="text-muted-foreground mt-1">
              Consultorios que has guardado como favoritos para acceso rápido
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Favoritos</p>
                  <p className="text-2xl font-bold text-foreground">{totalFavoritos}</p>
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
                  <p className="text-2xl font-bold text-foreground">0</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Precio Promedio</p>
                  <p className="text-2xl font-bold text-foreground">${precioPromedio}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Calificación Promedio</p>
                  <p className="text-2xl font-bold text-foreground">{calificacionPromedio}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
                  <SelectValue placeholder="Todas las especialidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las especialidades</SelectItem>
                  <SelectItem value="Cardiología">Cardiología</SelectItem>
                  <SelectItem value="Dermatología">Dermatología</SelectItem>
                  <SelectItem value="Ortopedia">Ortopedia</SelectItem>
                  <SelectItem value="Pediatría">Pediatría</SelectItem>
                  <SelectItem value="Ginecología">Ginecología</SelectItem>
                  <SelectItem value="Neurología">Neurología</SelectItem>
                  <SelectItem value="Oftalmología">Oftalmología</SelectItem>
                  <SelectItem value="Fisioterapia">Fisioterapia</SelectItem>
                  <SelectItem value="Nutrición">Nutrición</SelectItem>
                </SelectContent>
              </Select>
              <Select value={precioFilter} onValueChange={setPrecioFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Todos los precios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los precios</SelectItem>
                  <SelectItem value="economico">Económico (&lt; $500)</SelectItem>
                  <SelectItem value="medio">Medio ($500 - $800)</SelectItem>
                  <SelectItem value="premium">Premium (&gt; $800)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ordenFilter} onValueChange={setOrdenFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nombre">Nombre</SelectItem>
                  <SelectItem value="precio">Precio</SelectItem>
                  <SelectItem value="calificacion">Calificación</SelectItem>
                  <SelectItem value="distancia">Distancia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Favoritos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Consultorios Favoritos</span>
              <span className="text-sm text-muted-foreground">{favoritosFiltrados.length} favoritos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {favoritosFiltrados.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Consultorio</th>
                      <th className="text-left py-3 px-4 font-medium">Ubicación</th>
                      <th className="text-left py-3 px-4 font-medium">Precio</th>
                      <th className="text-left py-3 px-4 font-medium">Calificación</th>
                      <th className="text-left py-3 px-4 font-medium">Especialidades</th>
                      <th className="text-left py-3 px-4 font-medium">Última visita</th>
                      <th className="text-left py-3 px-4 font-medium">Próxima reserva</th>
                      <th className="text-left py-3 px-4 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {favoritosFiltrados.map((favorito) => {
                      const consultorio = favorito.consultorios[0];
                      if (!consultorio) return null;
                      
                      const precioLabel = getPrecioLabel(consultorio.precio_hora);
                      const distancia = calcularDistancia();
                      const ultimaVisita = new Date(favorito.created_at).toLocaleDateString('es-ES');
                      
                      return (
                        <tr key={favorito.id} className="border-b hover:bg-muted/30">
                          <td className="py-4 px-4">
                            <div>
                              <h4 className="font-medium text-foreground">{consultorio.nombre}</h4>
                              <p className="text-sm text-muted-foreground">
                                {consultorio.horario_apertura} - {consultorio.horario_cierre}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {consultorio.ubicacion} ({distancia} km)
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">${consultorio.precio_hora}/hora</span>
                              <Badge className={precioLabel.color}>{precioLabel.text}</Badge>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="font-medium">
                                {consultorio.calificacion_promedio?.toFixed(1) || 'N/A'}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                ({consultorio.total_calificaciones || 0})
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1">
                              {consultorio.especialidades.slice(0, 2).map((esp: string, index: number) => (
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
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-muted-foreground">{ultimaVisita}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-muted-foreground">Sin reserva</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/consultorios/${consultorio.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button size="sm" variant="outline">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No tienes favoritos</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || especialidadFilter !== "todas" || precioFilter !== "todos"
                    ? "No hay favoritos que coincidan con los filtros aplicados."
                    : "Aún no has guardado ningún consultorio como favorito."
                  }
                </p>
                <Button asChild>
                  <Link href="/consultorios">Explorar consultorios</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
