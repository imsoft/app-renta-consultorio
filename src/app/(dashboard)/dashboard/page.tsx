"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Forzar renderizado dinámico para evitar problemas con Supabase
export const dynamic = 'force-dynamic';
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Building2,
  Star,
  Eye,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

// Datos simulados para el dashboard
const dashboardData = {
  profesional: {
    reservasActivas: 3,
    consultoriosFavoritos: 5,
    gastosMes: 2400,
    proximaReserva: {
      consultorio: "Consultorio Médico Central",
      fecha: "2024-01-25",
      hora: "14:00",
      duracion: "2 horas"
    },
    historialReservas: [
      {
        id: 1,
        consultorio: "Clínica Especializada Norte",
        fecha: "2024-01-20",
        precio: 1200,
        estado: "Completada"
      },
      {
        id: 2,
        consultorio: "Consultorio Familiar Sur",
        fecha: "2024-01-18",
        precio: 600,
        estado: "Completada"
      }
    ]
  },
  propietario: {
    consultoriosActivos: 2,
    reservasPendientes: 8,
    ingresosMes: 15600,
    proximaReserva: {
      consultorio: "Consultorio Médico Central",
      profesional: "Dr. Laura Martínez",
      fecha: "2024-01-25",
      hora: "14:00",
      duracion: "2 horas"
    },
    consultorios: [
      {
        id: 1,
        nombre: "Consultorio Médico Central",
        ubicacion: "Centro Histórico, CDMX",
        precio: 800,
        ocupacion: 85,
        reservasMes: 12
      },
      {
        id: 2,
        nombre: "Clínica Especializada Norte",
        ubicacion: "Polanco, CDMX",
        precio: 1200,
        ocupacion: 70,
        reservasMes: 8
      }
    ]
  }
};

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Datos del dashboard según el tipo de usuario

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header del Dashboard */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Bienvenido, {user?.nombre}
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.role === "professional" ? "Panel de Profesional" : "Panel de Propietario"}
            </p>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {user?.role === "professional" ? (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Reservas Activas</p>
                      <p className="text-2xl font-bold text-foreground">{dashboardData.profesional.reservasActivas}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Favoritos</p>
                      <p className="text-2xl font-bold text-foreground">{dashboardData.profesional.consultoriosFavoritos}</p>
                    </div>
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Gastos del Mes</p>
                      <p className="text-2xl font-bold text-foreground">{dashboardData.profesional.gastosMes}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Próxima Reserva</p>
                      <p className="text-lg font-bold text-foreground">{dashboardData.profesional.proximaReserva.fecha}</p>
                    </div>
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Consultorios Activos</p>
                      <p className="text-2xl font-bold text-foreground">{dashboardData.propietario.consultoriosActivos}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Reservas Pendientes</p>
                      <p className="text-2xl font-bold text-foreground">{dashboardData.propietario.reservasPendientes}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ingresos del Mes</p>
                      <p className="text-2xl font-bold text-foreground">{dashboardData.propietario.ingresosMes}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Próxima Reserva</p>
                      <p className="text-lg font-bold text-foreground">{dashboardData.propietario.proximaReserva.fecha}</p>
                    </div>
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Contenido específico por tipo de usuario */}
        <div className="grid lg:grid-cols-2 gap-8">
          {user?.role === "professional" ? (
            <>
              {/* Próxima reserva */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Próxima Reserva
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{dashboardData.profesional.proximaReserva.consultorio}</h3>
                        <p className="text-sm text-muted-foreground">{dashboardData.profesional.proximaReserva.fecha} a las {dashboardData.profesional.proximaReserva.hora}</p>
                      </div>
                      <Badge variant="secondary">{dashboardData.profesional.proximaReserva.duracion}</Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Ver detalles
                      </Button>
                      <Button size="sm" variant="outline">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Historial de reservas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Historial de Reservas</span>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver detalles
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.profesional.historialReservas.map((reserva) => (
                      <div key={reserva.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <h4 className="font-medium text-foreground">{reserva.consultorio}</h4>
                          <p className="text-sm text-muted-foreground">{reserva.fecha}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{reserva.precio}</p>
                          <Badge variant="outline" className="text-xs">{reserva.estado}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Próxima reserva */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Próxima Reserva
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{dashboardData.propietario.proximaReserva.consultorio}</h3>
                        <p className="text-sm text-muted-foreground">
                          {dashboardData.propietario.proximaReserva.profesional} - {dashboardData.propietario.proximaReserva.fecha} a las {dashboardData.propietario.proximaReserva.hora}
                        </p>
                      </div>
                      <Badge variant="secondary">{dashboardData.propietario.proximaReserva.duracion}</Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Ver detalles
                      </Button>
                      <Button size="sm" variant="outline">
                        Contactar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mis consultorios */}
              <Card>
                <CardHeader>
                                     <CardTitle className="flex items-center justify-between">
                     <span>Mis Consultorios</span>
                     <Button size="sm" variant="outline">
                       <Eye className="h-4 w-4 mr-2" />
                       Ver todos
                     </Button>
                   </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.propietario.consultorios.map((consultorio) => (
                      <div key={consultorio.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">{consultorio.nombre}</h4>
                          <Badge variant="secondary">{consultorio.ocupacion}% ocupado</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{consultorio.ubicacion}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{consultorio.precio}/hora</span>
                            <span>{consultorio.reservasMes} reservas este mes</span>
                          </div>
                          <Button size="sm" variant="outline">
                            Gestionar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {user?.role === "professional" ? (
                  <>
                    <Button variant="outline" className="h-auto p-4 flex-col">
                      <Eye className="h-6 w-6 mb-2" />
                      <span>Buscar consultorios</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col">
                      <Star className="h-6 w-6 mb-2" />
                      <span>Mis favoritos</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col">
                      <Calendar className="h-6 w-6 mb-2" />
                      <span>Mis reservas</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col">
                      <Users className="h-6 w-6 mb-2" />
                      <span>Mi perfil</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="h-auto p-4 flex-col">
                      <Building2 className="h-6 w-6 mb-2" />
                      <span>Mis consultorios</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col">
                      <Eye className="h-6 w-6 mb-2" />
                      <span>Crear consultorio</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col">
                      <Calendar className="h-6 w-6 mb-2" />
                      <span>Gestionar reservas</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col">
                      <DollarSign className="h-6 w-6 mb-2" />
                      <span>Ver ingresos</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col">
                      <Users className="h-6 w-6 mb-2" />
                      <span>Mi perfil</span>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
