"use client";

// Forzar renderizado dinámico para evitar problemas con Supabase
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  MapPin,
  Star,
  Filter,
  SlidersHorizontal,
  Heart,
  Share2,
  Clock,
  Users,
  Shield,
  Wifi,
  Car,
  Accessibility,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import Image from "next/image";

interface Consultorio {
  id: string;
  titulo: string;
  direccion: string;
  ciudad: string;
  estado: string;
  precio_por_hora: number;
  calificacion_promedio: number;
  total_calificaciones: number;
  especialidades: string[] | null;
  equipamiento: string[] | null;
  servicios: string[] | null;
  imagen_principal: string | null;
  activo: boolean;
  aprobado: boolean;
  horario_apertura?: string;
  horario_cierre?: string;
  wifi: boolean;
  estacionamiento: boolean;
  propietario?: {
    full_name: string;
  };
}

// Datos simulados de consultorios (como fallback)
const consultoriosFallback = [
  {
    id: 1,
    nombre: "Consultorio Médico Central",
    ubicacion: "Centro Histórico, CDMX",
    precio: 800,
    calificacion: 4.8,
    reseñas: 124,
    especialidades: ["Medicina General", "Cardiología", "Dermatología"],
    imagen: "/api/placeholder/400/300",
    disponible: true,
    horarios: "Lun-Vie 8:00-20:00",
    equipamiento: ["Equipo de rayos X", "Electrocardiógrafo", "Sala de espera"],
    servicios: ["WiFi", "Estacionamiento", "Accesibilidad"],
    propietario: "Carlos Mendoza",
    verificado: true,
  },
  {
    id: 2,
    nombre: "Clínica Especializada Norte",
    ubicacion: "Polanco, CDMX",
    precio: 1200,
    calificacion: 4.9,
    reseñas: 89,
    especialidades: ["Dermatología", "Oftalmología", "Ortopedia"],
    imagen: "/api/placeholder/400/300",
    disponible: true,
    horarios: "Lun-Sáb 9:00-18:00",
    equipamiento: [
      "Microscopio",
      "Lámpara de hendidura",
      "Sala de procedimientos",
    ],
    servicios: ["WiFi", "Estacionamiento", "Cafetería"],
    propietario: "Ana García",
    verificado: true,
  },
  {
    id: 3,
    nombre: "Consultorio Familiar Sur",
    ubicacion: "Coyoacán, CDMX",
    precio: 600,
    calificacion: 4.7,
    reseñas: 156,
    especialidades: ["Pediatría", "Ginecología", "Medicina Familiar"],
    imagen: "/api/placeholder/400/300",
    disponible: true,
    horarios: "Lun-Vie 7:00-19:00",
    equipamiento: [
      "Sala de espera infantil",
      "Equipo pediátrico",
      "Sala de lactancia",
    ],
    servicios: ["WiFi", "Accesibilidad", "Área infantil"],
    propietario: "Roberto Silva",
    verificado: true,
  },
  {
    id: 4,
    nombre: "Centro Médico Integral Este",
    ubicacion: "Iztapalapa, CDMX",
    precio: 1200,
    calificacion: 4.6,
    reseñas: 203,
    especialidades: ["Medicina General", "Fisioterapia", "Nutrición"],
    imagen: "/api/placeholder/400/300",
    disponible: true,
    horarios: "Lun-Sáb 8:00-17:00",
    equipamiento: ["Equipo de fisioterapia", "Báscula", "Sala de ejercicios"],
    servicios: ["WiFi", "Estacionamiento"],
    propietario: "María López",
    verificado: true,
  },
  {
    id: 5,
    nombre: "Consultorio de Especialidades Oeste",
    ubicacion: "Tlalpan, CDMX",
    precio: 900,
    calificacion: 4.8,
    reseñas: 67,
    especialidades: ["Neurología", "Psiquiatría", "Psicología"],
    imagen: "/api/placeholder/400/300",
    disponible: true,
    horarios: "Lun-Vie 10:00-18:00",
    equipamiento: [
      "Sala de terapia",
      "Equipo de diagnóstico",
      "Sala de consulta privada",
    ],
    servicios: ["WiFi", "Accesibilidad", "Sala de espera privada"],
    propietario: "Fernando Ruiz",
    verificado: true,
  },
  {
    id: 6,
    nombre: "Clínica Dental Premium",
    ubicacion: "Roma Norte, CDMX",
    precio: 1500,
    calificacion: 4.9,
    reseñas: 45,
    especialidades: ["Odontología", "Ortodoncia", "Cirugía oral"],
    imagen: "/api/placeholder/400/300",
    disponible: true,
    horarios: "Lun-Sáb 9:00-19:00",
    equipamiento: ["Silla dental", "Rayos X dental", "Sala de esterilización"],
    servicios: ["WiFi", "Estacionamiento", "Sala de espera premium"],
    propietario: "Patricia Vega",
    verificado: true,
  },
];

// Filtros disponibles
const especialidades = [
  "Medicina General",
  "Cardiología",
  "Dermatología",
  "Oftalmología",
  "Ortopedia",
  "Pediatría",
  "Ginecología",
  "Neurología",
  "Psiquiatría",
  "Psicología",
  "Odontología",
  "Fisioterapia",
  "Nutrición",
];

const zonas = [
  "Centro Histórico",
  "Polanco",
  "Coyoacán",
  "Iztapalapa",
  "Tlalpan",
  "Roma Norte",
  "Condesa",
  "Del Valle",
];

export default function ConsultoriosPage() {
  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEspecialidades, setSelectedEspecialidades] = useState<
    string[]
  >([]);
  const [selectedZonas, setSelectedZonas] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const { user } = useAuthStore();

  useEffect(() => {
    fetchConsultorios();
  }, []);

  const fetchConsultorios = async () => {
    try {
      const { data, error } = await supabase
        .from('consultorios')
        .select(`
          id,
          titulo,
          direccion,
          ciudad,
          estado,
          precio_por_hora,
          calificacion_promedio,
          total_calificaciones,
          especialidades,
          equipamiento,
          servicios,
          imagen_principal,
          activo,
          aprobado,
          horario_apertura,
          horario_cierre,
          wifi,
          estacionamiento,
          profiles:propietario_id (
            full_name
          )
        `)
        .eq('activo', true)
        .eq('aprobado', true)
        .order('calificacion_promedio', { ascending: false });

      if (error) {
        console.error('Error fetching consultorios:', error);
        setConsultorios([]);
        return;
      }

      setConsultorios(data || []);
    } catch (error) {
      console.error('Error:', error);
      setConsultorios([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar consultorios
  const filteredConsultorios = consultorios.filter((consultorio) => {
    const matchesSearch =
      consultorio.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultorio.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultorio.direccion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEspecialidades =
      selectedEspecialidades.length === 0 ||
      (consultorio.especialidades && selectedEspecialidades.some((esp) =>
        consultorio.especialidades!.includes(esp)
      ));

    const matchesZonas =
      selectedZonas.length === 0 ||
      selectedZonas.some((zona) =>
        consultorio.ciudad.toLowerCase().includes(zona.toLowerCase()) ||
        consultorio.direccion.toLowerCase().includes(zona.toLowerCase())
      );

    const matchesPrice =
      consultorio.precio_por_hora >= priceRange[0] &&
      consultorio.precio_por_hora <= priceRange[1];

    return (
      matchesSearch && matchesEspecialidades && matchesZonas && matchesPrice
    );
  });

  // Ordenar consultorios
  const sortedConsultorios = [...filteredConsultorios].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.precio_por_hora - b.precio_por_hora;
      case "price-high":
        return b.precio_por_hora - a.precio_por_hora;
      case "rating":
        return b.calificacion_promedio - a.calificacion_promedio;
      case "reviews":
        return b.total_calificaciones - a.total_calificaciones;
      default:
        return b.calificacion_promedio - a.calificacion_promedio;
    }
  });

  const toggleEspecialidad = (especialidad: string) => {
    setSelectedEspecialidades((prev) =>
      prev.includes(especialidad)
        ? prev.filter((e) => e !== especialidad)
        : [...prev, especialidad]
    );
  };

  const toggleZona = (zona: string) => {
    setSelectedZonas((prev) =>
      prev.includes(zona) ? prev.filter((z) => z !== zona) : [...prev, zona]
    );
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-accent/20 to-primary/10 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Encuentra tu consultorio ideal
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explora nuestra amplia selección de consultorios médicos
              disponibles para renta
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex bg-background rounded-lg shadow-lg p-3 border border-border">
              <div className="flex-1 flex items-center px-3">
                <Search className="h-5 w-5 text-muted-foreground mr-3" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, ubicación o especialidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 border-0 bg-transparent text-base focus-visible:ring-0"
                />
              </div>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      {showFilters && (
        <section className="bg-muted/30 border-b border-border py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Especialidades */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Especialidades
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {especialidades.map((especialidad) => (
                    <div
                      key={especialidad}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={especialidad}
                        checked={selectedEspecialidades.includes(especialidad)}
                        onCheckedChange={() => toggleEspecialidad(especialidad)}
                      />
                      <label
                        htmlFor={especialidad}
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        {especialidad}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zonas */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Zonas</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {zonas.map((zona) => (
                    <div key={zona} className="flex items-center space-x-2">
                      <Checkbox
                        id={zona}
                        checked={selectedZonas.includes(zona)}
                        onCheckedChange={() => toggleZona(zona)}
                      />
                      <label
                        htmlFor={zona}
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        {zona}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rango de Precios */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Rango de Precios
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {/* Ordenar por */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">
                  Ordenar por
                </h3>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevancia</SelectItem>
                    <SelectItem value="price-low">
                      Precio: Menor a Mayor
                    </SelectItem>
                    <SelectItem value="price-high">
                      Precio: Mayor a Menor
                    </SelectItem>
                    <SelectItem value="rating">Mejor Calificación</SelectItem>
                    <SelectItem value="reviews">Más Reseñas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Results Section */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">
              {sortedConsultorios.length} consultorio
              {sortedConsultorios.length !== 1 ? "s" : ""} encontrado
              {sortedConsultorios.length !== 1 ? "s" : ""}
            </p>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Consultorios Grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted"></div>
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded mb-3"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-8 bg-muted rounded mb-4"></div>
                    <div className="h-10 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedConsultorios.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedConsultorios.map((consultorio) => (
              <Link
                key={consultorio.id}
                href={`/consultorios/${consultorio.id}`}
                className="block"
              >
                <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer hover:border-primary/50">
                  {/* Image */}
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center relative">
                    {consultorio.imagen_principal ? (
                      <Image
                        src={consultorio.imagen_principal} 
                        alt={consultorio.titulo}
                        className="w-full h-full object-cover"
                        width={500}
                        height={500}
                      />
                    ) : (
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                        <p className="text-primary font-medium">Consultorio</p>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
                      >
                        <Heart className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
                      >
                        <Share2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-foreground">
                        {consultorio.titulo}
                      </h3>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm text-muted-foreground">
                          {consultorio.calificacion_promedio > 0 ? consultorio.calificacion_promedio.toFixed(1) : '5.0'}
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({consultorio.total_calificaciones})
                        </span>
                      </div>
                    </div>

                    {/* Location */}
                    <p className="text-muted-foreground mb-3 flex items-center">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      {consultorio.ciudad}, {consultorio.estado}
                    </p>

                    {/* Price */}
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-primary">
                        ${consultorio.precio_por_hora}/hora
                      </p>
                    </div>

                    {/* Specialties */}
                    {consultorio.especialidades && consultorio.especialidades.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {consultorio.especialidades
                            .slice(0, 2)
                            .map((especialidad, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-primary/10 text-primary hover:bg-primary/20"
                              >
                                {especialidad}
                              </Badge>
                            ))}
                          {consultorio.especialidades.length > 2 && (
                            <Badge
                              variant="outline"
                              className="text-muted-foreground"
                            >
                              +{consultorio.especialidades.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Services */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {consultorio.wifi && (
                          <Wifi className="h-4 w-4 text-muted-foreground" />
                        )}
                        {consultorio.estacionamiento && (
                          <Car className="h-4 w-4 text-muted-foreground" />
                        )}
                        {consultorio.servicios && consultorio.servicios.includes("Accesibilidad") && (
                          <Accessibility className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Schedule */}
                    {(consultorio.horario_apertura && consultorio.horario_cierre) && (
                      <div className="mb-4 flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {consultorio.horario_apertura} - {consultorio.horario_cierre}
                      </div>
                    )}

                    {/* Owner */}
                    {consultorio.propietario && (
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-muted-foreground mr-1" />
                          <span className="text-sm text-muted-foreground">
                            {consultorio.propietario.full_name}
                          </span>
                        </div>
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                    )}

                    {/* Action Button */}
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                      Ver detalles
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
            </div>
          ) : (
            // CTA cuando no hay consultorios
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Plus className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">¡Sé el primero en WellPoint!</h3>
                <p className="text-muted-foreground mb-6">
                  Aún no hay consultorios publicados en nuestra plataforma. ¿Tienes un espacio médico? 
                  ¡Únete a nosotros y ayuda a crear la primera comunidad de consultorios profesionales!
                </p>
                <div className="space-y-4">
                  {user ? (
                    <Link href="/consultorios/crear">
                      <Button size="lg" className="w-full">
                        <Plus className="h-5 w-5 mr-2" />
                        Publicar mi consultorio
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/registro">
                      <Button size="lg" className="w-full">
                        Registrarme para publicar
                      </Button>
                    </Link>
                  )}
                  <Link href="/como-funciona">
                    <Button variant="outline" size="lg" className="w-full">
                      Conocer cómo funciona
                    </Button>
                  </Link>
                  <Link href="/contacto">
                    <Button variant="ghost" size="lg" className="w-full">
                      Contactar soporte
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* No Results cuando hay filtros aplicados */}
          {!loading && consultorios.length > 0 && sortedConsultorios.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No se encontraron consultorios
              </h3>
              <p className="text-muted-foreground mb-4">
                Intenta ajustar tus filtros de búsqueda para encontrar más opciones
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedEspecialidades([]);
                  setSelectedZonas([]);
                  setPriceRange([0, 2000]);
                  setSortBy("relevance");
                }}
                variant="outline"
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
