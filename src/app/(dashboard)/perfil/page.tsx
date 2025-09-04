"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Forzar renderizado dinámico para evitar problemas con Supabase
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  GraduationCap,
  Shield,
  Camera,
  Save,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  Calendar,
  Star,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuthStore } from "@/stores/authStore";
import { useSupabaseStore } from "@/stores/supabaseStore";
import Link from "next/link";

// Schema de validación para el perfil
const profileSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellidos: z.string().min(2, "Los apellidos deben tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un email válido"),
  telefono: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  fechaNacimiento: z.string().optional(),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  codigoPostal: z.string().optional(),
  especialidad: z.string().optional(),
  experiencia: z.string().optional(),
  cedula: z.string().optional(),
  descripcion: z.string().max(500, "La descripción no puede exceder 500 caracteres"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Función para obtener datos del perfil del usuario (vacío por defecto)
const getProfileData = (userType: string) => {
  return {
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    fechaNacimiento: "",
    direccion: "",
    ciudad: "",
    codigoPostal: "",
    especialidad: "",
    experiencia: "",
    cedula: "",
    descripcion: "",
    whatsapp: false,
    notificacionesEmail: false,
    notificacionesSMS: false,
    tipo: "user",
    fechaRegistro: "",
    consultoriosVisitados: 0,
    reservasRealizadas: 0,
    calificacionPromedio: 0,
    reseñasRecibidas: 0,
    consultoriosRegistrados: 0,
    ingresosTotales: 0
  };
};

// Componente para mostrar el mensaje de acceso restringido
function AccessDenied() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acceso restringido</h2>
            <p className="text-muted-foreground mb-4">
              Debes iniciar sesión para ver tu perfil.
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

// Componente principal del perfil (solo se renderiza si está autenticado)
function PerfilContent() {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const { getProfile, updateProfile } = useSupabaseStore();
  const [profileData, setProfileData] = useState<ProfileFormValues | null>(null);

  // Cargar datos del perfil
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const { data } = await getProfile();
        if (data) {
          // Mapear datos de Supabase a formato del formulario
          setProfileData({
            nombre: data.nombre || "",
            apellidos: data.apellidos || "",
            email: data.email || "",
            telefono: data.telefono || "",
            fechaNacimiento: data.fecha_nacimiento || "",
            direccion: data.direccion || "",
            ciudad: data.ciudad || "",
            codigoPostal: data.codigo_postal || "",
            especialidad: data.especialidad || "",
            experiencia: "",
            cedula: data.cedula_profesional || "",
            descripcion: data.biografia || "",
          });
        } else {
          // Usar datos por defecto si no hay perfil
          setProfileData(getProfileData(user?.role || "professional"));
        }
      }
    };
    loadProfile();
  }, [user, getProfile]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nombre: profileData?.nombre || "",
      apellidos: profileData?.apellidos || "",
      email: profileData?.email || "",
      telefono: profileData?.telefono || "",
      fechaNacimiento: profileData?.fechaNacimiento || "",
      direccion: profileData?.direccion || "",
      ciudad: profileData?.ciudad || "",
      codigoPostal: profileData?.codigoPostal || "",
      especialidad: profileData?.especialidad || "",
      experiencia: profileData?.experiencia || "",
      cedula: profileData?.cedula || "",
      descripcion: profileData?.descripcion || "",
    },
  });

  // Actualizar el formulario cuando se carguen los datos
  useEffect(() => {
    if (profileData) {
      form.reset(profileData);
    }
  }, [profileData, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      const { error } = await updateProfile({
        nombre: data.nombre,
        apellidos: data.apellidos,
        telefono: data.telefono,
        direccion: data.direccion,
        ciudad: data.ciudad,
        especialidad: data.especialidad,
        biografia: data.descripcion,
      });
      
      if (error) {
        throw error;
      }
      
      setSuccess("¡Perfil actualizado exitosamente!");
      setIsEditing(false);
      
      // Recargar datos del perfil
      const { data: updatedProfile } = await getProfile();
      if (updatedProfile) {
        // Mapear datos de Supabase a formato del formulario
        setProfileData({
          nombre: updatedProfile.nombre || "",
          apellidos: updatedProfile.apellidos || "",
          email: updatedProfile.email || "",
          telefono: updatedProfile.telefono || "",
          fechaNacimiento: updatedProfile.fecha_nacimiento || "",
          direccion: updatedProfile.direccion || "",
          ciudad: updatedProfile.ciudad || "",
          codigoPostal: updatedProfile.codigo_postal || "",
          especialidad: updatedProfile.especialidad || "",
          experiencia: "",
          cedula: updatedProfile.cedula_profesional || "",
          descripcion: updatedProfile.biografia || "",
        });
      }
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      setError("Error al actualizar el perfil. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Mi Perfil
          </h1>
          <p className="text-muted-foreground">
            Gestiona tu información personal y preferencias
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-700">{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Información del perfil */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información personal */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Información Personal
                </CardTitle>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Foto de perfil */}
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-10 w-10 text-primary" />
                        </div>
                        {isEditing && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute -bottom-1 -right-1 h-8 w-8 p-0 rounded-full"
                          >
                            <Camera className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {profileData?.nombre || ""} {profileData?.apellidos || ""}
                        </h3>
                        <p className="text-muted-foreground">
                          {user?.role === "user" ? "Usuario" : "Administrador"}
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          Miembro desde {new Date().toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long' 
                          })}
                        </Badge>
                      </div>
                    </div>

                    {/* Campos del formulario */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nombre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre *</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!isEditing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="apellidos"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apellidos *</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!isEditing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input {...field} className="pl-10" disabled={!isEditing} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="telefono"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input {...field} className="pl-10" disabled={!isEditing} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fechaNacimiento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de nacimiento</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} disabled={!isEditing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="direccion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dirección</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input {...field} className="pl-10" disabled={!isEditing} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="ciudad"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ciudad</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!isEditing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="codigoPostal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código Postal</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!isEditing} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {user?.role === "user" && (
                      <>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="especialidad"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Especialidad</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input {...field} className="pl-10" disabled={!isEditing} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="cedula"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cédula Profesional</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input {...field} className="pl-10" disabled={!isEditing} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="experiencia"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Experiencia</FormLabel>
                              <FormControl>
                                <Textarea {...field} disabled={!isEditing} placeholder="Describe tu experiencia profesional..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    <FormField
                      control={form.control}
                      name="descripcion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea {...field} disabled={!isEditing} placeholder="Cuéntanos sobre ti..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isEditing && (
                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            form.reset();
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={loading || form.formState.isSubmitting}>
                          {form.formState.isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Guardar cambios
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha - Estadísticas y acciones */}
          <div className="space-y-6">
            {/* Estadísticas */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user?.role === "user" ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Building className="h-5 w-5 text-primary mr-2" />
                        <span className="text-sm">Consultorios visitados</span>
                      </div>
                      <span className="font-semibold">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-primary mr-2" />
                        <span className="text-sm">Reservas realizadas</span>
                      </div>
                      <span className="font-semibold">0</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Building className="h-5 w-5 text-primary mr-2" />
                        <span className="text-sm">Consultorios registrados</span>
                      </div>
                      <span className="font-semibold">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 text-primary mr-2" />
                        <span className="text-sm">Ingresos totales</span>
                      </div>
                      <span className="font-semibold">$0</span>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-sm">Calificación promedio</span>
                  </div>
                  <span className="font-semibold">0.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-primary mr-2" />
                    <span className="text-sm">Reseñas recibidas</span>
                  </div>
                  <span className="font-semibold">0</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

    </div>
  );
}

// Componente principal que decide qué mostrar
export default function PerfilPage() {
  const { isAuthenticated } = useAuthStore();

  // Renderizar condicionalmente basado en autenticación
  if (!isAuthenticated) {
    return <AccessDenied />;
  }

  return <PerfilContent />;
}
