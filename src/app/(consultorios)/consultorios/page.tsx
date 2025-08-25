"use client";

// Forzar renderizado dinámico para evitar problemas con Supabase
export const dynamic = 'force-dynamic';

import { useState } from "react";
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
import { formatCurrency } from "@/lib/utils";

// Datos simulados de consultorios (como fallback)
const consultorios = [
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEspecialidades, setSelectedEspecialidades] = useState<
    string[]
  >([]);
  const [selectedZonas, setSelectedZonas] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");

  // Filtrar consultorios
  const filteredConsultorios = consultorios.filter((consultorio) => {
    const matchesSearch =
      consultorio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultorio.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEspecialidades =
      selectedEspecialidades.length === 0 ||
      selectedEspecialidades.some((esp) =>
        consultorio.especialidades.includes(esp)
      );

    const matchesZonas =
      selectedZonas.length === 0 ||
      selectedZonas.some((zona) => consultorio.ubicacion.includes(zona));

    const matchesPrice =
      consultorio.precio >= priceRange[0] &&
      consultorio.precio <= priceRange[1];

    return (
      matchesSearch && matchesEspecialidades && matchesZonas && matchesPrice
    );
  });

  // Ordenar consultorios
  const sortedConsultorios = [...filteredConsultorios].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.precio - b.precio;
      case "price-high":
        return b.precio - a.precio;
      case "rating":
        return b.calificacion - a.calificacion;
      case "reviews":
        return b.reseñas - a.reseñas;
      default:
        return 0;
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedConsultorios.map((consultorio) => (
              <Link
                key={consultorio.id}
                href={`/consultorios/${consultorio.id}`}
                className="block"
              >
                <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer hover:border-primary/50">
                  {/* Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center relative">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                      <p className="text-primary font-medium">
                        Consultorio {consultorio.id}
                      </p>
                    </div>
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
                        {consultorio.nombre}
                      </h3>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm text-muted-foreground">
                          {consultorio.calificacion}
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({consultorio.reseñas})
                        </span>
                      </div>
                    </div>

                    {/* Location */}
                    <p className="text-muted-foreground mb-3 flex items-center">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      {consultorio.ubicacion}
                    </p>

                    {/* Price */}
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(consultorio.precio)}/hora
                      </p>
                    </div>

                    {/* Specialties */}
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

                    {/* Services */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {consultorio.servicios.includes("WiFi") && (
                          <Wifi className="h-4 w-4 text-muted-foreground" />
                        )}
                        {consultorio.servicios.includes("Estacionamiento") && (
                          <Car className="h-4 w-4 text-muted-foreground" />
                        )}
                        {consultorio.servicios.includes("Accesibilidad") && (
                          <Accessibility className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="mb-4 flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {consultorio.horarios}
                    </div>

                    {/* Owner */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="text-sm text-muted-foreground">
                          {consultorio.propietario}
                        </span>
                      </div>
                      {consultorio.verificado && (
                        <Shield className="h-4 w-4 text-primary" />
                      )}
                    </div>

                    {/* Action Button */}
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                      Ver detalles
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* No Results */}
          {sortedConsultorios.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No se encontraron consultorios
              </h3>
              <p className="text-muted-foreground">
                Intenta ajustar tus filtros de búsqueda
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
