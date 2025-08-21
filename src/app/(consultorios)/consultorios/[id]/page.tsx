"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useState } from "react";
import { 
  MapPin, 
  Calendar, 
  Star, 
  Heart,
  Share2,
  Clock,
  Users,
  Shield,
  Wifi,
  Car,
  Accessibility,
  Phone,
  Mail,
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  DollarSign,
  User,
  Building
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Datos simulados del consultorio (en un caso real esto vendría de una API)
const consultorio = {
  id: 1,
  nombre: "Consultorio Médico Central",
  ubicacion: "Centro Histórico, CDMX",
  direccion: "Av. Juárez 123, Centro Histórico, Ciudad de México, CDMX 06000",
  precio: 800,
  calificacion: 4.8,
  reseñas: 124,
  especialidades: ["Medicina General", "Cardiología", "Dermatología"],
  imagenes: [
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
    "/api/placeholder/800/600"
  ],
  disponible: true,
  horarios: {
    lunes: "8:00 - 20:00",
    martes: "8:00 - 20:00",
    miercoles: "8:00 - 20:00",
    jueves: "8:00 - 20:00",
    viernes: "8:00 - 20:00",
    sabado: "9:00 - 15:00",
    domingo: "Cerrado"
  },
  equipamiento: [
    "Equipo de rayos X",
    "Electrocardiógrafo", 
    "Sala de espera",
    "Consultorio privado",
    "Baño privado",
    "Sistema de aire acondicionado",
    "Iluminación profesional"
  ],
  servicios: [
    { nombre: "WiFi", icono: Wifi, descripcion: "Internet de alta velocidad" },
    { nombre: "Estacionamiento", icono: Car, descripcion: "Estacionamiento gratuito" },
    { nombre: "Accesibilidad", icono: Accessibility, descripcion: "Acceso para sillas de ruedas" }
  ],
  propietario: {
    nombre: "Carlos Mendoza",
    tipo: "Propietario particular",
    verificado: true,
    telefono: "+52 55 1234 5678",
    email: "carlos.mendoza@medirenta.com",
    experiencia: "Propietario desde 2020",
    calificacion: 4.9
  },
  descripcion: "Espacio médico completamente equipado ubicado en el corazón del Centro Histórico. Este consultorio está disponible para renta por profesionales de la salud que buscan un espacio profesional y accesible. El espacio cuenta con equipamiento moderno y está diseñado para brindar la mejor experiencia tanto para el profesional como para los pacientes.",
  politicas: [
    "Reserva mínima de 2 horas",
    "Cancelación gratuita hasta 24 horas antes",
    "Pago seguro a través de la plataforma",
    "Seguro de responsabilidad civil incluido"
  ],
  reseñasDetalladas: [
    {
      id: 1,
      usuario: "Dr. Laura Martínez",
      especialidad: "Dermatóloga",
      calificacion: 5,
      fecha: "2024-01-15",
      comentario: "Excelente espacio, muy bien equipado y ubicado. El propietario es muy profesional y el consultorio es perfecto para mi práctica."
    },
    {
      id: 2,
      usuario: "Dr. Miguel Torres",
      especialidad: "Cardiólogo",
      calificacion: 4,
      fecha: "2024-01-10",
      comentario: "Buen espacio y equipamiento. La ubicación es conveniente y el precio es justo. Recomendado."
    },
    {
      id: 3,
      usuario: "Dra. Patricia Ruiz",
      especialidad: "Médico General",
      calificacion: 5,
      fecha: "2024-01-05",
      comentario: "Consultorio impecable, muy limpio y profesional. El WiFi funciona perfectamente y el estacionamiento es un plus."
    }
  ]
};

export default function ConsultorioPage({ params }: { params: { id: string } }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === consultorio.imagenes.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? consultorio.imagenes.length - 1 : prev - 1
    );
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="min-h-screen bg-background">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/consultorios"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a consultorios
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Galería de imágenes */}
            <Card className="overflow-hidden">
              <div className="relative">
                <div className="aspect-video relative">
                  <Image
                    src={consultorio.imagenes[currentImageIndex]}
                    alt={consultorio.nombre}
                    fill
                    className="object-cover"
                  />
                  {/* Controles de navegación */}
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                {/* Indicadores */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {consultorio.imagenes.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
                {/* Botones de acción */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={toggleFavorite}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {/* Miniaturas */}
              <div className="p-4 flex space-x-2 overflow-x-auto">
                {consultorio.imagenes.map((imagen, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <Image
                      src={imagen}
                      alt={`Imagen ${index + 1}`}
                      width={80}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            </Card>

            {/* Información del consultorio */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-foreground">
                      {consultorio.nombre}
                    </CardTitle>
                    <div className="flex items-center mt-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{consultorio.ubicacion}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      ${consultorio.precio}
                      <span className="text-sm font-normal text-muted-foreground">/hora</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="ml-1 text-sm">{consultorio.calificacion}</span>
                      <span className="ml-1 text-sm text-muted-foreground">
                        ({consultorio.reseñas} reseñas)
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Especialidades */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Especialidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {consultorio.especialidades.map((especialidad) => (
                      <Badge key={especialidad} variant="secondary">
                        {especialidad}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Descripción</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {consultorio.descripcion}
                  </p>
                </div>

                {/* Equipamiento */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Equipamiento</h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {consultorio.equipamiento.map((equipo) => (
                      <div key={equipo} className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {equipo}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Servicios */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Servicios incluidos</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {consultorio.servicios.map((servicio) => (
                      <div key={servicio.nombre} className="flex items-center p-3 bg-muted/50 rounded-lg">
                        <servicio.icono className="h-5 w-5 text-primary mr-3" />
                        <div>
                          <div className="font-medium text-foreground">{servicio.nombre}</div>
                          <div className="text-xs text-muted-foreground">{servicio.descripcion}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Horarios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Horarios de disponibilidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(consultorio.horarios).map(([dia, horario]) => (
                    <div key={dia} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="font-medium text-foreground capitalize">
                        {dia === 'miercoles' ? 'Miércoles' : 
                         dia === 'sabado' ? 'Sábado' : 
                         dia.charAt(0).toUpperCase() + dia.slice(1)}
                      </span>
                      <span className="text-muted-foreground">
                        {horario === 'Cerrado' ? (
                          <span className="text-red-500">Cerrado</span>
                        ) : (
                          horario
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reseñas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Reseñas de profesionales</span>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 fill-current mr-1" />
                    <span className="font-bold">{consultorio.calificacion}</span>
                    <span className="text-muted-foreground ml-1">({consultorio.reseñas})</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {consultorio.reseñasDetalladas.map((reseña) => (
                    <div key={reseña.id} className="border-b border-border pb-6 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-foreground">{reseña.usuario}</div>
                          <div className="text-sm text-muted-foreground">{reseña.especialidad}</div>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="ml-1 text-sm">{reseña.calificacion}</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm">{reseña.comentario}</p>
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(reseña.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información del propietario */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Propietario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{consultorio.propietario.nombre}</div>
                    <div className="text-sm text-muted-foreground">{consultorio.propietario.tipo}</div>
                    {consultorio.propietario.verificado && (
                      <div className="flex items-center mt-1">
                        <Shield className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-600">Verificado</span>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                    <span>{consultorio.propietario.telefono}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                    <span>{consultorio.propietario.email}</span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {consultorio.propietario.experiencia}
                </div>
              </CardContent>
            </Card>

            {/* Políticas */}
            <Card>
              <CardHeader>
                <CardTitle>Políticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {consultorio.politicas.map((politica, index) => (
                    <div key={index} className="flex items-start text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{politica}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Botón de reserva */}
            <Card>
              <CardContent className="pt-6">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Reservar consultorio
                </Button>
                <div className="mt-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    ${consultorio.precio}
                    <span className="text-sm font-normal text-muted-foreground">/hora</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Pago seguro • Cancelación gratuita
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

    </div>
  );
}
