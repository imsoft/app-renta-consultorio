"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Calendar, Star, Users, Shield, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

interface Consultorio {
  id: string;
  titulo: string;
  direccion: string;
  ciudad: string;
  estado: string;
  precio_por_hora: number;
  calificacion_promedio: number;
  especialidades: string[] | null;
  imagen_principal: string | null;
  activo: boolean;
  aprobado: boolean;
}

export default function Home() {
  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);
  const [loading, setLoading] = useState(true);
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
          especialidades,
          imagen_principal,
          activo,
          aprobado
        `)
        .eq('activo', true)
        .eq('aprobado', true)
        .order('calificacion_promedio', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching consultorios:', error);
        return;
      }

      setConsultorios(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-accent/20 to-primary/10 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              Encuentra el consultorio perfecto para tu práctica médica
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Conectamos profesionales de la salud con espacios médicos de calidad. 
              Renta consultorios por hora, día o mes según tus necesidades.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
              <div className="flex flex-col sm:flex-row bg-background rounded-lg shadow-lg p-3 sm:p-2 border border-border gap-3 sm:gap-2">
                <div className="flex-1 flex items-center px-3 sm:px-4 py-2 sm:py-0">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mr-3 sm:mr-2 flex-shrink-0" />
                  <Input
                    type="text"
                    placeholder="¿Dónde buscas consultorio?"
                    className="flex-1 border-0 bg-transparent text-base sm:text-sm lg:text-base min-w-0 focus-visible:ring-0"
                  />
                </div>
                <div className="flex-1 flex items-center px-3 sm:px-4 py-2 sm:py-0 border-t sm:border-t-0 sm:border-l border-border">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mr-3 sm:mr-2 flex-shrink-0" />
                  <Input
                    type="date"
                    className="flex-1 border-0 bg-transparent text-base sm:text-sm lg:text-base min-w-0 focus-visible:ring-0"
                  />
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 sm:px-6 py-3 text-base sm:text-sm lg:text-base font-medium">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                  Buscar
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                Verificados
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Disponible 24/7
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                +500 profesionales
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              ¿Por qué elegir WellPoint?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              La plataforma más confiable para rentar espacios médicos
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Para Propietarios */}
            <div className="bg-accent/10 p-6 sm:p-8 rounded-xl border border-accent/20">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Para Propietarios</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary text-primary-foreground p-2 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm sm:text-base">Gestión Segura</h4>
                    <p className="text-muted-foreground text-sm sm:text-base">Verificamos a todos los profesionales antes de confirmar reservas</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary text-primary-foreground p-2 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm sm:text-base">Flexibilidad Total</h4>
                    <p className="text-muted-foreground text-sm sm:text-base">Define tus horarios y precios según tus necesidades</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary text-primary-foreground p-2 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm sm:text-base">Más Ingresos</h4>
                    <p className="text-muted-foreground text-sm sm:text-base">Maximiza el uso de tu espacio y genera ingresos adicionales</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Para Profesionales */}
            <div className="bg-secondary/10 p-6 sm:p-8 rounded-xl border border-secondary/20">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Para Profesionales</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-secondary text-secondary-foreground p-2 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm sm:text-base">Búsqueda Fácil</h4>
                    <p className="text-muted-foreground text-sm sm:text-base">Encuentra consultorios por ubicación, especialidad y precio</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-secondary text-secondary-foreground p-2 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm sm:text-base">Reserva Inmediata</h4>
                    <p className="text-muted-foreground text-sm sm:text-base">Reserva tu espacio en minutos, sin complicaciones</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-secondary text-secondary-foreground p-2 rounded-lg mr-3 sm:mr-4 flex-shrink-0">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm sm:text-base">Calidad Garantizada</h4>
                    <p className="text-muted-foreground text-sm sm:text-base">Todos nuestros espacios cumplen con estándares médicos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Consultorios */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Consultorios Destacados
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Los espacios más populares entre nuestros profesionales
            </p>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-40 sm:h-48 bg-muted"></div>
                  <CardContent className="p-4 sm:p-6">
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-8 bg-muted rounded mb-4"></div>
                    <div className="h-10 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : consultorios.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {consultorios.map((consultorio) => (
                <Link key={consultorio.id} href={`/consultorios/${consultorio.id}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer hover:border-primary/50">
                    <div className="h-40 sm:h-48 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center">
                      {consultorio.imagen_principal ? (
                        <img 
                          src={consultorio.imagen_principal} 
                          alt={consultorio.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <MapPin className="h-8 w-8 sm:h-12 sm:w-12 text-primary mx-auto mb-2" />
                          <p className="text-primary font-medium text-sm sm:text-base">Consultorio</p>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg sm:text-xl font-bold text-foreground">{consultorio.titulo}</h3>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-muted-foreground">
                            {consultorio.calificacion_promedio > 0 ? consultorio.calificacion_promedio.toFixed(1) : '5.0'}
                          </span>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        {consultorio.ciudad}, {consultorio.estado}
                      </p>
                      <div className="mb-3 sm:mb-4">
                        <p className="text-xl sm:text-2xl font-bold text-primary">${consultorio.precio_por_hora}/hora</p>
                      </div>
                      {consultorio.especialidades && consultorio.especialidades.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {consultorio.especialidades.slice(0, 3).map((especialidad, index) => (
                              <Badge key={index} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                {especialidad}
                              </Badge>
                            ))}
                            {consultorio.especialidades.length > 3 && (
                              <Badge variant="secondary" className="bg-muted text-muted-foreground">
                                +{consultorio.especialidades.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base">
                        Ver detalles
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            // CTA cuando no hay consultorios
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Plus className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">¡Sé el primero!</h3>
                <p className="text-muted-foreground mb-6">
                  Aún no hay consultorios publicados. ¿Tienes un espacio médico? ¡Publica el primer consultorio en WellPoint!
                </p>
                <div className="space-y-3">
                  {user?.role === 'owner' ? (
                    <Link href="/consultorios/crear">
                      <Button size="lg" className="w-full">
                        <Plus className="h-5 w-5 mr-2" />
                        Publicar mi consultorio
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/registro">
                      <Button size="lg" className="w-full">
                        Registrarme como propietario
                      </Button>
                    </Link>
                  )}
                  <Link href="/como-funciona">
                    <Button variant="outline" size="lg" className="w-full">
                      Conocer cómo funciona
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {consultorios.length > 0 && (
            <div className="text-center mt-8 sm:mt-12">
              <Link href="/consultorios">
                <Button variant="outline" className="px-6 sm:px-8 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-sm sm:text-base">
                  Ver todos los consultorios
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-lg sm:text-xl text-primary-foreground/80 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Únete a nuestra comunidad de profesionales de la salud y propietarios de consultorios
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Button variant="secondary" className="px-6 sm:px-8 py-3 bg-background text-primary hover:bg-background/90 font-semibold text-sm sm:text-base">
              Soy Profesional de la Salud
            </Button>
            <Button variant="outline" className="px-6 sm:px-8 py-3 border-2 border-background text-background hover:bg-background hover:text-primary font-semibold text-sm sm:text-base bg-background/10">
              Tengo un Consultorio
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
