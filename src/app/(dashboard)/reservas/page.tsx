"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  Phone,
  Mail,
  DollarSign,
  CalendarDays,
  Users
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/stores/authStore";
import { formatDate, formatCurrency, formatNumber, formatDateTime } from "@/lib/utils";

// Tipos para las reservas
interface Reserva {
  id: number;
  consultorio: string;
  profesional?: string;
  propietario?: string;
  email: string;
  telefono: string;
  fecha: string;
  hora: string;
  duracion: string;
  precio: number;
  estado: "confirmada" | "pendiente" | "cancelada";
  especialidad: string;
  notas?: string;
}

// Datos simulados de reservas
const reservasData: {
  propietario: Reserva[];
  profesional: Reserva[];
} = {
  propietario: [
    {
      id: 1,
      consultorio: "Consultorio Médico Central",
      profesional: "Dr. Laura Martínez",
      email: "laura.martinez@email.com",
      telefono: "+52 55 1234 5678",
      fecha: "2024-01-25",
      hora: "14:00",
      duracion: "2 horas",
      precio: 1600,
      estado: "confirmada",
      especialidad: "Cardiología",
      notas: "Paciente con antecedentes cardíacos"
    },
    {
      id: 2,
      consultorio: "Clínica Especializada Norte",
      profesional: "Dra. Ana García",
      email: "ana.garcia@email.com",
      telefono: "+52 55 9876 5432",
      fecha: "2024-01-26",
      hora: "10:00",
      duracion: "1 hora",
      precio: 1200,
      estado: "pendiente",
      especialidad: "Dermatología",
      notas: "Consulta de seguimiento"
    },
    {
      id: 3,
      consultorio: "Consultorio Médico Central",
      profesional: "Dr. Carlos López",
      email: "carlos.lopez@email.com",
      telefono: "+52 55 5555 1234",
      fecha: "2024-01-27",
      hora: "16:00",
      duracion: "3 horas",
      precio: 2400,
      estado: "cancelada",
      especialidad: "Ortopedia",
      notas: "Cancelada por el profesional"
    },
    {
      id: 4,
      consultorio: "Clínica Especializada Norte",
      profesional: "Dra. María Rodríguez",
      email: "maria.rodriguez@email.com",
      telefono: "+52 55 7777 8888",
      fecha: "2024-01-28",
      hora: "09:00",
      duracion: "1.5 horas",
      precio: 1800,
      estado: "confirmada",
      especialidad: "Ginecología",
      notas: "Consulta prenatal"
    }
  ],
  profesional: [
    {
      id: 1,
      consultorio: "Consultorio Médico Central",
      propietario: "Dr. Roberto Silva",
      email: "roberto.silva@email.com",
      telefono: "+52 55 1111 2222",
      fecha: "2024-01-25",
      hora: "14:00",
      duracion: "2 horas",
      precio: 1600,
      estado: "confirmada",
      especialidad: "Cardiología",
      notas: "Paciente con antecedentes cardíacos"
    },
    {
      id: 2,
      consultorio: "Clínica Especializada Norte",
      propietario: "Dra. Patricia Morales",
      email: "patricia.morales@email.com",
      telefono: "+52 55 3333 4444",
      fecha: "2024-01-26",
      hora: "10:00",
      duracion: "1 hora",
      precio: 1200,
      estado: "pendiente",
      especialidad: "Dermatología",
      notas: "Consulta de seguimiento"
    }
  ]
};

export default function ReservasPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroConsultorio, setFiltroConsultorio] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState<string>("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      const data = user.tipo === "profesional" ? reservasData.profesional : reservasData.propietario;
      setReservas(data);
    }
  }, [user]);

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

  // Filtrar reservas
  const reservasFiltradas = reservas.filter((reserva: Reserva) => {
    const cumpleEstado = filtroEstado === "todos" || reserva.estado === filtroEstado;
    const cumpleConsultorio = filtroConsultorio === "todos" || reserva.consultorio === filtroConsultorio;
    const cumpleBusqueda = busqueda === "" || 
      reserva.consultorio.toLowerCase().includes(busqueda.toLowerCase()) ||
      (user?.tipo === "profesional" ? reserva.propietario : reserva.profesional)?.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleEstado && cumpleConsultorio && cumpleBusqueda;
  });

  const getEstadoColor = (estado: string): string => {
    switch (estado) {
      case "confirmada":
        return "bg-green-50 text-green-700 border-green-200";
      case "pendiente":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "cancelada":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getEstadoText = (estado: string): string => {
    switch (estado) {
      case "confirmada":
        return "Confirmada";
      case "pendiente":
        return "Pendiente";
      case "cancelada":
        return "Cancelada";
      default:
        return estado;
    }
  };

  const handleConfirmarReserva = (id: number): void => {
    setReservas(prev => prev.map(reserva => 
      reserva.id === id ? { ...reserva, estado: "confirmada" as const } : reserva
    ));
  };

  const handleCancelarReserva = (id: number): void => {
    setReservas(prev => prev.map(reserva => 
      reserva.id === id ? { ...reserva, estado: "cancelada" as const } : reserva
    ));
  };

  const limpiarFiltros = (): void => {
    setFiltroEstado("todos");
    setFiltroConsultorio("todos");
    setBusqueda("");
  };

  const consultoriosUnicos = [...new Set(reservas.map(r => r.consultorio))];

  return (
    <div className="min-h-screen bg-background">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {user?.tipo === "profesional" ? "Mis Reservas" : "Gestionar Reservas"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.tipo === "profesional" 
                ? "Gestiona tus reservas de consultorios" 
                : "Administra las reservas de tus consultorios"
              }
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard">
              <Calendar className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Link>
          </Button>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid sm:grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por consultorio o profesional..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="confirmada">Confirmadas</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="cancelada">Canceladas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroConsultorio} onValueChange={setFiltroConsultorio}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por consultorio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los consultorios</SelectItem>
                  {consultoriosUnicos.map(consultorio => (
                    <SelectItem key={consultorio} value={consultorio}>
                      {consultorio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center" onClick={limpiarFiltros}>
                <Filter className="h-4 w-4 mr-2" />
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reservas</p>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(reservas.length)}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confirmadas</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatNumber(reservas.filter(r => r.estado === "confirmada").length)}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-700" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {formatNumber(reservas.filter(r => r.estado === "pendiente").length)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-700" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(reservas.filter(r => r.estado === "confirmada").reduce((sum, r) => sum + r.precio, 0))}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de reservas */}
        <div className="space-y-4">
          {reservasFiltradas.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No se encontraron reservas</h3>
                <p className="text-muted-foreground">
                  No hay reservas que coincidan con los filtros aplicados.
                </p>
              </CardContent>
            </Card>
          ) : (
            reservasFiltradas.map((reserva: Reserva) => (
              <Card key={reserva.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    {/* Información principal */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {reserva.consultorio}
                          </h3>
                          <p className="text-muted-foreground">
                            {user?.tipo === "profesional" ? reserva.propietario : reserva.profesional}
                          </p>
                        </div>
                        <Badge className={`${getEstadoColor(reserva.estado)}`}>
                          {getEstadoText(reserva.estado)}
                        </Badge>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center">
                          <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{formatDate(reserva.fecha)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{reserva.hora} ({reserva.duracion})</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{formatCurrency(reserva.precio)}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{reserva.especialidad}</span>
                        </div>
                      </div>
                      
                      {reserva.notas && (
                        <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                          <strong>Notas:</strong> {reserva.notas}
                        </p>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col space-y-2 lg:ml-6">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contactar
                        </Button>
                      </div>
                      
                      {user?.tipo === "propietario" && reserva.estado === "pendiente" && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleConfirmarReserva(reserva.id)}
                            className="bg-green-700 hover:bg-green-800 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirmar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleCancelarReserva(reserva.id)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rechazar
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4 mr-2" />
                          {reserva.telefono}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4 mr-2" />
                          {reserva.email}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

    </div>
  );
}
