"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import HourlyBookingSelector from "@/components/HourlyBookingSelector";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  MapPin, 
  Star, 
  Heart,
  Share2,
  Clock,
  Shield,
  Wifi,
  Car,

  Phone,
  Mail,
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  User,
  Building,
  Loader2,
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { validateUUID, secureLog, validateImageUrl } from "@/lib/security";

interface Consultorio {
  id: string;
  titulo: string;
  descripcion: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  precio_por_hora: number;
  precio_por_dia?: number;
  precio_por_mes?: number;
  metros_cuadrados?: number;
  numero_consultorios: number;
  equipamiento: string[];
  servicios: string[];
  especialidades: string[];
  horario_apertura: string;
  horario_cierre: string;
  dias_disponibles: string[];
  activo: boolean;
  permite_mascotas: boolean;
  estacionamiento: boolean;
  wifi: boolean;
  aire_acondicionado: boolean;
  imagenes: string[];
  imagen_principal?: string;
  calificacion_promedio: number;
  total_calificaciones: number;
  total_reservas: number;
  vistas: number;
  propietario: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    telefono?: string;
  };
}

interface Calificacion {
  id: string;
  puntuacion: number;
  comentario: string;
  created_at: string;
  usuario: {
    full_name: string;
    avatar_url?: string;
  };
}

export default function ConsultorioDetailPage({ params }: { params: { id: string } }) {
  const [consultorio, setConsultorio] = useState<Consultorio | null>(null);
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { user } = useAuthStore();
  const router = useRouter();

  // Cargar datos del consultorio
  useEffect(() => {
    const loadConsultorioData = async () => {
      try {
        // Validar UUID del consultorio
        if (!validateUUID(params.id)) {
          console.error('ID de consultorio inválido');
          router.push('/consultorios');
          return;
        }

        // Cargar datos del consultorio
        const { data: consultorioData, error: consultorioError } = await supabase
          .from('consultorios')
          .select(`
            *,
            propietario:propietario_id (
              id,
              full_name,
              email,
              avatar_url,
              telefono
            )
          `)
          .eq('id', params.id)
          .eq('activo', true)
          .single();

        if (consultorioError) {
          secureLog('Error al cargar consultorio', consultorioError);
          return;
        }

        setConsultorio(consultorioData);

        // Cargar calificaciones
        const { data: calificacionesData } = await supabase
          .from('calificaciones')
          .select(`
            id,
            puntuacion,
            comentario,
            created_at,
            usuario:usuario_id!inner (
              full_name,
              avatar_url
            )
          `)
          .eq('consultorio_id', params.id)
          .order('created_at', { ascending: false })
          .limit(10);

        setCalificaciones((calificacionesData || []) as unknown as Calificacion[]);

        // Verificar si está en favoritos (si el usuario está logueado)
        if (user) {
          const { data: favoritoData } = await supabase
            .from('favoritos')
            .select('id')
            .eq('consultorio_id', params.id)
            .eq('usuario_id', user.id)
            .single();

          setIsFavorite(!!favoritoData);
        }

        // Incrementar contador de vistas
        await supabase
          .from('consultorios')
          .update({ vistas: (consultorioData.vistas || 0) + 1 })
          .eq('id', params.id);

      } catch (error) {
        console.error('Error general:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConsultorioData();
  }, [params.id, user]);

  // Manejar favoritos
  const toggleFavorite = async () => {
    if (!user || !consultorio) return;

    try {
      if (isFavorite) {
        await supabase
          .from('favoritos')
          .delete()
          .eq('consultorio_id', consultorio.id)
          .eq('usuario_id', user.id);
      } else {
        await supabase
          .from('favoritos')
          .insert({
            consultorio_id: consultorio.id,
            usuario_id: user.id
          });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error al manejar favorito:', error);
    }
  };

  // Manejar confirmación de reserva
  const handleBookingConfirm = (fecha: Date, hora: string, total: number) => {
    // Redirigir a la página de pago o mostrar confirmación
    router.push(`/dashboard/reservas?confirmacion=exitosa&fecha=${fecha.toISOString()}&hora=${hora}&total=${total}`);
  };

  // Navegación de imágenes
  const nextImage = () => {
    if (consultorio?.imagenes) {
      setCurrentImageIndex((prev) => 
        prev === consultorio.imagenes.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (consultorio?.imagenes) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? consultorio.imagenes.length - 1 : prev - 1
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Cargando consultorio...</p>
        </div>
      </div>
    );
  }

  if (!consultorio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Consultorio no encontrado</h1>
          <p className="text-muted-foreground mb-4">
            El consultorio que buscas no existe o ya no está disponible.
          </p>
          <Button asChild>
            <Link href="/consultorios">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a consultorios
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentImages = consultorio.imagenes.length > 0 
    ? consultorio.imagenes 
    : [consultorio.imagen_principal].filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Navegación superior */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
            {user && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleFavorite}
                className={isFavorite ? "text-red-500 border-red-200" : ""}
              >
                <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                {isFavorite ? "Guardado" : "Guardar"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Información del consultorio */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galería de imágenes */}
            <Card>
              <CardContent className="p-0">
                <div className="relative h-96 bg-gradient-to-br from-primary/10 to-accent/20">
                  {currentImages.length > 0 && currentImages[currentImageIndex] && validateImageUrl(currentImages[currentImageIndex]) ? (
                    <Image
                      src={currentImages[currentImageIndex]}
                      alt={consultorio.titulo}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Building className="h-24 w-24 text-muted-foreground" />
                    </div>
                  )}
                  
                  {currentImages.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Información básica */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{consultorio.titulo}</CardTitle>
                    <div className="flex items-center mt-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{consultorio.ciudad}, {consultorio.estado}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      ${consultorio.precio_por_hora.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">por hora</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mt-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-current text-yellow-400 mr-1" />
                    <span className="font-medium">{consultorio.calificacion_promedio || 0}</span>
                    <span className="text-muted-foreground ml-1">
                      ({consultorio.total_calificaciones} reseñas)
                    </span>
                  </div>
                  <Badge variant="secondary">{consultorio.numero_consultorios} consultorio{consultorio.numero_consultorios > 1 ? 's' : ''}</Badge>
                  {consultorio.metros_cuadrados && (
                    <Badge variant="outline">{consultorio.metros_cuadrados} m²</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {consultorio.descripcion}
                </p>
                
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Especialidades permitidas</h4>
                  <div className="flex flex-wrap gap-2">
                    {consultorio.especialidades.map((especialidad) => (
                      <Badge key={especialidad} variant="secondary">
                        {especialidad}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Equipamiento y servicios */}
            <Card>
              <CardHeader>
                <CardTitle>Equipamiento y servicios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Equipamiento incluido</h4>
                    <ul className="space-y-2">
                      {consultorio.equipamiento.map((item) => (
                        <li key={item} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Servicios disponibles</h4>
                    <div className="space-y-3">
                      {consultorio.wifi && (
                        <div className="flex items-center">
                          <Wifi className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-sm">WiFi gratuito</span>
                        </div>
                      )}
                      {consultorio.estacionamiento && (
                        <div className="flex items-center">
                          <Car className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-sm">Estacionamiento</span>
                        </div>
                      )}
                      {consultorio.permite_mascotas && (
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-sm">Se permiten mascotas</span>
                        </div>
                      )}
                      {consultorio.aire_acondicionado && (
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-sm">Aire acondicionado</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Horarios de operación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Horarios de operación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map((dia) => (
                    <div key={dia} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="font-medium text-foreground capitalize">
                        {dia === 'miercoles' ? 'Miércoles' : 
                         dia === 'sabado' ? 'Sábado' : 
                         dia.charAt(0).toUpperCase() + dia.slice(1)}
                      </span>
                      <span className="text-muted-foreground">
                        {consultorio.dias_disponibles.includes(dia) ? (
                          `${consultorio.horario_apertura} - ${consultorio.horario_cierre}`
                        ) : (
                          <span className="text-red-500">Cerrado</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Propietario */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Propietario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    {consultorio.propietario.avatar_url ? (
                      <Image
                        src={consultorio.propietario.avatar_url}
                        alt={consultorio.propietario.full_name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{consultorio.propietario.full_name}</h4>
                    <p className="text-sm text-muted-foreground">Propietario verificado</p>
                    <div className="flex items-center space-x-4 mt-3">
                      {consultorio.propietario.telefono && (
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          Llamar
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        Contactar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reseñas */}
            {calificaciones.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Reseñas de usuarios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {calificaciones.map((calificacion) => (
                      <div key={calificacion.id} className="border-b border-border pb-4 last:border-b-0">
                        <div className="flex items-start space-x-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                            {calificacion.usuario.avatar_url ? (
                              <Image
                                src={calificacion.usuario.avatar_url}
                                alt={calificacion.usuario.full_name}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            ) : (
                              <User className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium">{calificacion.usuario.full_name}</h5>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < calificacion.puntuacion 
                                        ? "fill-current text-yellow-400" 
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(calificacion.created_at).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="mt-2 text-sm leading-relaxed">
                              {calificacion.comentario}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Columna derecha - Selector de reservas */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2" />
                    Reservar por horas
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Selecciona fecha y hora para tu consulta
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  <HourlyBookingSelector
                    consultorioId={consultorio.id}
                    consultorioTitulo={consultorio.titulo}
                    precioPorHora={consultorio.precio_por_hora}
                    diasDisponibles={consultorio.dias_disponibles}
                    onBookingConfirm={handleBookingConfirm}
                    className="p-6"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}