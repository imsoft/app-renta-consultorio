"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  MapPin,
  DollarSign,
  User,
  Calendar
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

interface Consultorio {
  id: string;
  titulo: string;
  descripcion: string;
  direccion: string;
  ciudad: string;
  estado: string;
  precio_por_hora: number;
  especialidades: string[] | null;
  imagen_principal: string | null;
  activo: boolean;
  aprobado: boolean;
  created_at: string;
  owner_id: string;
  owner: {
    nombre: string;
    apellidos: string;
    email: string;
  };
}

export default function AdminConsultoriosPage() {
  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setError("Acceso denegado. Solo administradores pueden ver este dashboard.");
      return;
    }

    fetchConsultorios();
  }, [user]);

  const fetchConsultorios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("consultorios")
        .select(`
          *,
          owner:profiles(nombre, apellidos, email)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching consultorios:", error);
        setError("Error al cargar los consultorios");
        return;
      }

      setConsultorios(data || []);
    } catch (error) {
      console.error("Error:", error);
      setError("Error al cargar los consultorios");
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (consultorioId: string) => {
    try {
      const { error } = await supabase
        .from("consultorios")
        .update({ aprobado: true })
        .eq("id", consultorioId);

      if (error) {
        console.error("Error approving consultorio:", error);
        setError("Error al aprobar el consultorio");
        return;
      }

      setSuccess("Consultorio aprobado exitosamente");
      fetchConsultorios();
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error:", error);
      setError("Error al aprobar el consultorio");
    }
  };

  const handleRechazar = async (consultorioId: string) => {
    try {
      const { error } = await supabase
        .from("consultorios")
        .update({ aprobado: false, activo: false })
        .eq("id", consultorioId);

      if (error) {
        console.error("Error rejecting consultorio:", error);
        setError("Error al rechazar el consultorio");
        return;
      }

      setSuccess("Consultorio rechazado exitosamente");
      fetchConsultorios();
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error:", error);
      setError("Error al rechazar el consultorio");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Acceso denegado. Solo administradores pueden ver este dashboard.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Administración de Consultorios
          </h1>
          <p className="text-muted-foreground">
            Gestiona y aprueba los consultorios registrados en la plataforma
          </p>
        </div>

        {/* Alertas */}
        {error && (
          <Alert className="mb-6">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{consultorios.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {consultorios.filter(c => !c.aprobado).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aprobados</p>
                  <p className="text-2xl font-bold text-green-600">
                    {consultorios.filter(c => c.aprobado).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Activos</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {consultorios.filter(c => c.activo).length}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Consultorios */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted"></div>
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consultorios.map((consultorio) => (
              <Card key={consultorio.id} className="overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center">
                  {consultorio.imagen_principal ? (
                    <Image
                      src={consultorio.imagen_principal}
                      alt={consultorio.titulo}
                      className="w-full h-full object-cover"
                      width={400}
                      height={300}
                    />
                  ) : (
                    <div className="text-center">
                      <Building2 className="h-12 w-12 text-primary mx-auto mb-2" />
                      <p className="text-primary font-medium">Sin imagen</p>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-foreground line-clamp-2">
                      {consultorio.titulo}
                    </h3>
                    <Badge 
                      variant={consultorio.aprobado ? "default" : "secondary"}
                      className={consultorio.aprobado ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                    >
                      {consultorio.aprobado ? "Aprobado" : "Pendiente"}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-muted-foreground flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {consultorio.ciudad}, {consultorio.estado}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ${consultorio.precio_por_hora}/hora
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {consultorio.owner?.nombre} {consultorio.owner?.apellidos}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(consultorio.created_at)}
                    </p>
                  </div>

                  {consultorio.especialidades && consultorio.especialidades.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {consultorio.especialidades.slice(0, 3).map((especialidad, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {especialidad}
                          </Badge>
                        ))}
                        {consultorio.especialidades.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{consultorio.especialidades.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Link href={`/consultorios/${consultorio.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Link>
                    </Button>
                    
                    {!consultorio.aprobado ? (
                      <Button
                        onClick={() => handleAprobar(consultorio.id)}
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprobar
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleRechazar(consultorio.id)}
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rechazar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && consultorios.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No hay consultorios registrados
              </h3>
              <p className="text-muted-foreground">
                Cuando los usuarios registren consultorios, aparecerán aquí para su aprobación.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
