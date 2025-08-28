"use client";

// Forzar renderizado dinámico para evitar problemas con Supabase
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  DollarSign,
  Building,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  Wifi,
  Car,
  PawPrint,
  Snowflake,
  Users
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import Image from "next/image";
import { DebugInfo } from "@/components/DebugInfo";

// Schema de validación para el formulario de consultorio
const consultorioSchema = z.object({
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  descripcion: z.string().min(20, "La descripción debe tener al menos 20 caracteres"),
  direccion: z.string().min(10, "La dirección debe ser más específica"),
  ciudad: z.string().min(2, "La ciudad es requerida"),
  estado: z.string().min(2, "El estado es requerido"),
  codigo_postal: z.string().min(5, "El código postal debe tener 5 dígitos"),
  precio_por_hora: z.number().min(100, "El precio mínimo es $100 por hora"),
  precio_por_dia: z.number().optional(),
  precio_por_mes: z.number().optional(),
  metros_cuadrados: z.number().min(1, "Los metros cuadrados son requeridos"),
  numero_consultorios: z.number().min(1, "Debe tener al menos 1 consultorio"),
  especialidades: z.array(z.string()).min(1, "Selecciona al menos una especialidad"),
  servicios: z.array(z.string()).optional(),
  equipamiento: z.array(z.string()).optional(),
  horario_apertura: z.string().optional(),
  horario_cierre: z.string().optional(),
  dias_disponibles: z.array(z.string()).optional(),
  permite_mascotas: z.boolean().optional(),
  estacionamiento: z.boolean().optional(),
  wifi: z.boolean().optional(),
  aire_acondicionado: z.boolean().optional(),
  terminos: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones",
  }),
});

type ConsultorioFormValues = z.infer<typeof consultorioSchema>;

// Opciones para selects
const especialidadesOptions = [
  "Medicina General",
  "Cardiología",
  "Dermatología",
  "Ginecología",
  "Pediatría",
  "Neurología",
  "Oftalmología",
  "Traumatología",
  "Psiquiatría",
  "Psicología",
  "Odontología",
  "Nutrición",
  "Fisioterapia",
];

const serviciosOptions = [
  "Consulta médica",
  "Procedimientos menores",
  "Análisis clínicos",
  "Electrocardiograma",
  "Ultrasonido",
  "Rayos X",
  "Limpieza dental",
  "Terapia física",
  "Consulta nutricional",
];

const equipamientoOptions = [
  "Camilla médica",
  "Escritorio",
  "Sillas",
  "Equipo de diagnóstico",
  "Esterilizador",
  "Báscula",
  "Tensiómetro",
  "Estetoscopio",
  "Lámpara de exploración",
  "Instrumental básico",
];

const estadosOptions = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
  "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
  "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
  "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
  "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
];

const diasSemana = [
  "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"
];

function CrearConsultorioPageContent() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { createConsultorio, loading } = useSupabaseStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const form = useForm<ConsultorioFormValues>({
    resolver: zodResolver(consultorioSchema),
    defaultValues: {
      titulo: "",
      descripcion: "",
      direccion: "",
      ciudad: "",
      estado: "",
      codigo_postal: "",
      precio_por_hora: 200,
      precio_por_dia: 0,
      precio_por_mes: 0,
      metros_cuadrados: 20,
      numero_consultorios: 1,
      especialidades: [],
      servicios: [],
      equipamiento: [],
      horario_apertura: "08:00",
      horario_cierre: "18:00",
      dias_disponibles: ["lunes", "martes", "miercoles", "jueves", "viernes"],
      permite_mascotas: false,
      estacionamiento: false,
      wifi: true,
      aire_acondicionado: false,
      terminos: false,
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (user?.role !== "owner") {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string);
            if (newImages.length === files.length) {
              setUploadedImages(prev => [...prev, ...newImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: ConsultorioFormValues) => {
    setError("");
    setSuccess("");

    try {
      // Validar que el usuario esté autenticado
      if (!isAuthenticated || !user) {
        setError("Debes estar autenticado para crear un consultorio.");
        return;
      }

      // Validar que el usuario tenga el rol correcto
      if (user.role !== "owner") {
        setError("Solo los propietarios pueden crear consultorios.");
        return;
      }

      const consultorioData = {
        titulo: data.titulo,
        descripcion: data.descripcion,
        direccion: data.direccion,
        ciudad: data.ciudad,
        estado: data.estado,
        codigo_postal: data.codigo_postal,
        precio_por_hora: data.precio_por_hora,
        precio_por_dia: data.precio_por_dia || undefined,
        precio_por_mes: data.precio_por_mes || undefined,
        metros_cuadrados: data.metros_cuadrados,
        numero_consultorios: data.numero_consultorios,
        especialidades: data.especialidades,
        servicios: data.servicios || [],
        equipamiento: data.equipamiento || [],
        horario_apertura: data.horario_apertura,
        horario_cierre: data.horario_cierre,
        dias_disponibles: data.dias_disponibles || [],
        permite_mascotas: data.permite_mascotas || false,
        estacionamiento: data.estacionamiento || false,
        wifi: data.wifi || false,
        aire_acondicionado: data.aire_acondicionado || false,
        imagenes: uploadedImages,
        imagen_principal: uploadedImages[0] || undefined,
      };

      console.log("Creando consultorio con datos:", consultorioData);

      const { data: newConsultorio, error } = await createConsultorio(consultorioData);

      if (error) {
        console.error("Error al crear consultorio:", error);
        
        // Proporcionar mensajes de error más específicos
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('permission')) {
          setError("No tienes permisos para crear consultorios. Verifica tu rol de usuario.");
        } else if (errorMessage.includes('storage')) {
          setError("Error al subir las imágenes. Por favor, intenta de nuevo.");
        } else {
          setError(`Error al crear el consultorio: ${errorMessage || 'Error desconocido'}`);
        }
        return;
      }

      if (!newConsultorio) {
        setError("No se pudo crear el consultorio. Por favor, intenta de nuevo.");
        return;
      }

      setSuccess("¡Consultorio creado exitosamente! Redirigiendo...");
      setTimeout(() => {
        router.push(`/consultorios/${newConsultorio.id}`);
      }, 2000);

    } catch (error) {
      console.error("Error inesperado:", error);
      setError("Error inesperado. Por favor, intenta de nuevo.");
    }
  };

  if (!isAuthenticated || user?.role !== "owner") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso restringido
          </h1>
          <p className="text-gray-600 mb-6">
            Solo los propietarios pueden crear consultorios.
          </p>
          <Link href="/dashboard">
            <Button>Ir al Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/mis-consultorios"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a mis consultorios
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Publicar consultorio</h1>
          <p className="mt-2 text-gray-600">
            Completa la información para publicar tu consultorio médico
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center ${
                  step < 4 ? "flex-1" : ""
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep >= step
                      ? "bg-primary border-primary text-white"
                      : "border-gray-300 text-gray-300"
                  }`}
                >
                  {currentStep > step ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-0.5 ml-4 ${
                      currentStep > step ? "bg-primary" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>Información básica</span>
            <span>Detalles</span>
            <span>Servicios</span>
            <span>Imágenes</span>
          </div>
        </div>

        {/* Debug Info - Solo mostrar en desarrollo */}
        <DebugInfo show={process.env.NODE_ENV === 'development'} />

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Información básica */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Información básica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="titulo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del consultorio</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Consultorio médico en zona centro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descripcion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe tu consultorio, instalaciones, ubicación y características principales..."
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="direccion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección completa</FormLabel>
                          <FormControl>
                            <Input placeholder="Calle, número, colonia" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ciudad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ciudad</FormLabel>
                          <FormControl>
                            <Input placeholder="Ciudad" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {estadosOptions.map((estado) => (
                                <SelectItem key={estado} value={estado}>
                                  {estado}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="codigo_postal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código postal</FormLabel>
                          <FormControl>
                            <Input placeholder="12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Detalles */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Detalles y precios
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="precio_por_hora"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio por hora</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="200"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="precio_por_dia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio por día (opcional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1500"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="precio_por_mes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio por mes (opcional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="30000"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="metros_cuadrados"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Metros cuadrados</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="20"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="numero_consultorios"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de consultorios</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="horario_apertura"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horario de apertura</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="horario_cierre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horario de cierre</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="dias_disponibles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Días disponibles</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {diasSemana.map((dia) => (
                            <div key={dia} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(dia)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...(field.value || []), dia]);
                                  } else {
                                    field.onChange(field.value?.filter((d) => d !== dia));
                                  }
                                }}
                              />
                              <label className="text-sm capitalize">{dia}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Características adicionales */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Características adicionales</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="wifi"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-1 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="flex items-center space-x-2">
                              <Wifi className="h-4 w-4" />
                              <FormLabel>WiFi</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="estacionamiento"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-1 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="flex items-center space-x-2">
                              <Car className="h-4 w-4" />
                              <FormLabel>Estacionamiento</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="aire_acondicionado"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-1 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="flex items-center space-x-2">
                              <Snowflake className="h-4 w-4" />
                              <FormLabel>Aire acondicionado</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="permite_mascotas"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-1 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="flex items-center space-x-2">
                              <PawPrint className="h-4 w-4" />
                              <FormLabel>Permite mascotas</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Servicios */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Servicios y especialidades
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="especialidades"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Especialidades permitidas</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {especialidadesOptions.map((especialidad) => (
                            <div key={especialidad} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(especialidad)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...(field.value || []), especialidad]);
                                  } else {
                                    field.onChange(field.value?.filter((e) => e !== especialidad));
                                  }
                                }}
                              />
                              <label className="text-sm">{especialidad}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="servicios"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Servicios incluidos</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {serviciosOptions.map((servicio) => (
                            <div key={servicio} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(servicio)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...(field.value || []), servicio]);
                                  } else {
                                    field.onChange(field.value?.filter((s) => s !== servicio));
                                  }
                                }}
                              />
                              <label className="text-sm">{servicio}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="equipamiento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipamiento disponible</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {equipamientoOptions.map((equipo) => (
                            <div key={equipo} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(equipo)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...(field.value || []), equipo]);
                                  } else {
                                    field.onChange(field.value?.filter((e) => e !== equipo));
                                  }
                                }}
                              />
                              <label className="text-sm">{equipo}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 4: Imágenes */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Imágenes del consultorio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Sube imágenes de tu consultorio para atraer más profesionales
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <Button type="button" variant="outline" className="cursor-pointer">
                        Seleccionar imágenes
                      </Button>
                    </label>
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={image}
                            alt={`Imagen ${index + 1}`}
                            width={200}
                            height={150}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                              Principal
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="terminos"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-1 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm leading-6 whitespace-nowrap">
                          Acepto los{" "}
                          <Link href="/terminos-servicio" className="text-primary hover:text-primary/80">
                            términos y condiciones
                          </Link>{" "}
                          y la{" "}
                          <Link href="/politica-privacidad" className="text-primary hover:text-primary/80">
                            política de privacidad
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              
              {currentStep < 4 ? (
                <Button type="button" onClick={nextStep}>
                  Siguiente
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? "Creando consultorio..." : "Publicar consultorio"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}

// Wrapper dinámico para evitar problemas de prerender
export default function CrearConsultorioPage() {
  return <CrearConsultorioPageContent />;
}