"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  DollarSign, 
  TrendingUp,
  Download,
  Filter,
  Building,
  Clock,
  Users,
  BarChart3,
  FileText,
  Search,
  Eye,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/stores/authStore";
import { formatDate, formatCurrency, formatNumber, formatDateTime } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Tipos para los ingresos
interface Transaccion {
  id: number;
  fecha: string;
  hora: string;
  consultorio: string;
  profesional: string;
  duracion: string;
  monto: number;
  comision: number;
  montoNeto: number;
  estado: "completada" | "pendiente" | "cancelada";
  metodoPago: string;
  concepto: string;
}

interface EstadisticaIngreso {
  mes: string;
  ingresos: number;
  transacciones: number;
  ocupacion: number;
}

interface ResumenFinanciero {
  ingresosHoy: number;
  ingresosMes: number;
  ingresosAnio: number;
  transaccionesHoy: number;
  transaccionesMes: number;
  promedioTransaccion: number;
  consultorioMasRentable: string;
  tendenciaMes: number; // porcentaje
  pendientesCobro: number;
}

// Datos simulados de ingresos
const ingresosData = {
  resumen: {
    ingresosHoy: 4800,
    ingresosMes: 15600,
    ingresosAnio: 187200,
    transaccionesHoy: 6,
    transaccionesMes: 24,
    promedioTransaccion: 650,
    consultorioMasRentable: "Consultorio Médico Central",
    tendenciaMes: 12.5,
    pendientesCobro: 2400
  } as ResumenFinanciero,
  
  estadisticasMensuales: [
    { mes: "Ene", ingresos: 12800, transacciones: 20, ocupacion: 75 },
    { mes: "Feb", ingresos: 14200, transacciones: 22, ocupacion: 80 },
    { mes: "Mar", ingresos: 13900, transacciones: 21, ocupacion: 78 },
    { mes: "Abr", ingresos: 15600, transacciones: 24, ocupacion: 85 },
    { mes: "May", ingresos: 16800, transacciones: 26, ocupacion: 88 },
    { mes: "Jun", ingresos: 15200, transacciones: 23, ocupacion: 82 }
  ] as EstadisticaIngreso[],
  
  transacciones: [
    {
      id: 1,
      fecha: "2024-01-25",
      hora: "14:00",
      consultorio: "Consultorio Médico Central",
      profesional: "Dr. Laura Martínez",
      duracion: "2 horas",
      monto: 1600,
      comision: 160,
      montoNeto: 1440,
      estado: "completada",
      metodoPago: "Tarjeta de Crédito",
      concepto: "Renta de consultorio"
    },
    {
      id: 2,
      fecha: "2024-01-25",
      hora: "10:00",
      consultorio: "Clínica Especializada Norte",
      profesional: "Dra. Ana García",
      duracion: "1 hora",
      monto: 1200,
      comision: 120,
      montoNeto: 1080,
      estado: "completada",
      metodoPago: "Transferencia",
      concepto: "Renta de consultorio"
    },
    {
      id: 3,
      fecha: "2024-01-24",
      hora: "16:00",
      consultorio: "Consultorio Médico Central",
      profesional: "Dr. Carlos López",
      duracion: "3 horas",
      monto: 2400,
      comision: 240,
      montoNeto: 2160,
      estado: "pendiente",
      metodoPago: "Efectivo",
      concepto: "Renta de consultorio"
    },
    {
      id: 4,
      fecha: "2024-01-24",
      hora: "09:00",
      consultorio: "Clínica Especializada Norte",
      profesional: "Dra. María Rodríguez",
      duracion: "1.5 horas",
      monto: 1800,
      comision: 180,
      montoNeto: 1620,
      estado: "completada",
      metodoPago: "Tarjeta de Débito",
      concepto: "Renta de consultorio"
    },
    {
      id: 5,
      fecha: "2024-01-23",
      hora: "11:00",
      consultorio: "Consultorio Médico Central",
      profesional: "Dr. Roberto Silva",
      duracion: "2 horas",
      monto: 1600,
      comision: 160,
      montoNeto: 1440,
      estado: "completada",
      metodoPago: "Transferencia",
      concepto: "Renta de consultorio"
    }
  ] as Transaccion[]
};

export default function IngresosPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroConsultorio, setFiltroConsultorio] = useState<string>("todos");
  const [filtroFecha, setFiltroFecha] = useState<string>("mes");
  const [busqueda, setBusqueda] = useState<string>("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role !== "owner") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, user, router]);

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

  if (!isAuthenticated || user?.role !== "owner") {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Acceso restringido</h2>
              <p className="text-muted-foreground mb-4">
                Solo los propietarios pueden ver los ingresos.
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

  // Filtrar transacciones
  const transaccionesFiltradas = ingresosData.transacciones.filter((transaccion: Transaccion) => {
    const cumpleEstado = filtroEstado === "todos" || transaccion.estado === filtroEstado;
    const cumpleConsultorio = filtroConsultorio === "todos" || transaccion.consultorio === filtroConsultorio;
    const cumpleBusqueda = busqueda === "" || 
      transaccion.consultorio.toLowerCase().includes(busqueda.toLowerCase()) ||
      transaccion.profesional.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleEstado && cumpleConsultorio && cumpleBusqueda;
  });

  const getEstadoColor = (estado: string): string => {
    switch (estado) {
      case "completada":
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
      case "completada":
        return "Completada";
      case "pendiente":
        return "Pendiente";
      case "cancelada":
        return "Cancelada";
      default:
        return estado;
    }
  };

  const limpiarFiltros = (): void => {
    setFiltroEstado("todos");
    setFiltroConsultorio("todos");
    setFiltroFecha("mes");
    setBusqueda("");
  };

  const exportarReporte = (): void => {
    // Simular exportación de reporte
    console.log("Exportando reporte de ingresos...");
    // Aquí se implementaría la lógica de exportación
  };

  const consultoriosUnicos = [...new Set(ingresosData.transacciones.map(t => t.consultorio))];

  return (
    <div className="min-h-screen bg-background">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ingresos</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona y analiza tus ingresos de consultorios
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button onClick={exportarReporte} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button asChild>
              <Link href="/dashboard">
                <BarChart3 className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Resumen financiero */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ingresos Hoy</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(ingresosData.resumen.ingresosHoy)}</p>
                                      <p className="text-xs text-muted-foreground">{formatNumber(ingresosData.resumen.transaccionesHoy)} transacciones</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ingresos del Mes</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(ingresosData.resumen.ingresosMes)}</p>
                  <div className="flex items-center text-xs">
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-green-600">+{ingresosData.resumen.tendenciaMes}%</span>
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Promedio/Transacción</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(ingresosData.resumen.promedioTransaccion)}</p>
                                      <p className="text-xs text-muted-foreground">{formatNumber(ingresosData.resumen.transaccionesMes)} este mes</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pendientes de Cobro</p>
                  <p className="text-2xl font-bold text-yellow-700">{formatCurrency(ingresosData.resumen.pendientesCobro)}</p>
                  <p className="text-xs text-muted-foreground">Por confirmar</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-700" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de ingresos mensuales */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Ingresos de los Últimos 6 Meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ingresosData.estadisticasMensuales.map((mes, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 text-center">
                      <span className="font-medium text-foreground">{mes.mes}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Ingresos</span>
                        <span className="font-semibold text-foreground">{formatCurrency(mes.ingresos)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(mes.ingresos / 20000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{formatNumber(mes.transacciones)} transacciones</div>
                    <div>{mes.ocupacion}% ocupación</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filtros y búsqueda */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid sm:grid-cols-1 md:grid-cols-5 gap-4">
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
                  <SelectItem value="completada">Completadas</SelectItem>
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

              <Select value={filtroFecha} onValueChange={setFiltroFecha}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por fecha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoy">Hoy</SelectItem>
                  <SelectItem value="semana">Esta semana</SelectItem>
                  <SelectItem value="mes">Este mes</SelectItem>
                  <SelectItem value="trimestre">Este trimestre</SelectItem>
                  <SelectItem value="año">Este año</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={limpiarFiltros}>
                <Filter className="h-4 w-4 mr-2" />
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de transacciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Historial de Transacciones</span>
              <Badge variant="secondary">{formatNumber(transaccionesFiltradas.length)} transacciones</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transaccionesFiltradas.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No se encontraron transacciones</h3>
                <p className="text-muted-foreground">
                  No hay transacciones que coincidan con los filtros aplicados.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Consultorio</TableHead>
                      <TableHead>Profesional</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Comisión</TableHead>
                      <TableHead>Neto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transaccionesFiltradas.map((transaccion) => (
                      <TableRow key={transaccion.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{formatDate(transaccion.fecha)}</div>
                            <div className="text-sm text-muted-foreground">{transaccion.hora}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                            {transaccion.consultorio}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                            {transaccion.profesional}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaccion.duracion}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">{formatCurrency(transaccion.monto)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-red-600">-{formatCurrency(transaccion.comision)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-700">{formatCurrency(transaccion.montoNeto)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getEstadoColor(transaccion.estado)}>
                            {getEstadoText(transaccion.estado)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{transaccion.metodoPago}</span>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

    </div>
  );
}
