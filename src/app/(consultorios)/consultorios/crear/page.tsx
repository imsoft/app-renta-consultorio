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
import HorariosManager from "@/components/HorariosManager";
import { ProtectedRoute } from "@/components/ProtectedRoute";

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
  horarios: z.object({
    lunes: z.object({
      abierto: z.boolean(),
      inicio: z.string().optional(),
      fin: z.string().optional(),
    }),
    martes: z.object({
      abierto: z.boolean(),
      inicio: z.string().optional(),
      fin: z.string().optional(),
    }),
    miercoles: z.object({
      abierto: z.boolean(),
      inicio: z.string().optional(),
      fin: z.string().optional(),
    }),
    jueves: z.object({
      abierto: z.boolean(),
      inicio: z.string().optional(),
      fin: z.string().optional(),
    }),
    viernes: z.object({
      abierto: z.boolean(),
      inicio: z.string().optional(),
      fin: z.string().optional(),
    }),
    sabado: z.object({
      abierto: z.boolean(),
      inicio: z.string().optional(),
      fin: z.string().optional(),
    }),
    domingo: z.object({
      abierto: z.boolean(),
      inicio: z.string().optional(),
      fin: z.string().optional(),
    }),
  }),
  permite_mascotas: z.boolean().optional(),
  estacionamiento: z.boolean().optional(),
  wifi: z.boolean().optional(),
  aire_acondicionado: z.boolean().optional(),
  terminos: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones",
  }),
});

type ConsultorioFormValues = z.infer<typeof consultorioSchema>;

// Opciones para selects (se pueden expandir según las necesidades reales)
const especialidadesOptions = [
  "Medicina General",
  "Cardiología",
  "Dermatología",
  "Endocrinología",
  "Gastroenterología",
  "Ginecología",
  "Neurología",
  "Oftalmología",
  "Ortopedia",
  "Pediatría",
  "Psiquiatría",
  "Radiología",
  "Traumatología",
  "Urología"
];

const serviciosOptions = [
  "Consulta médica",
  "Exámenes de laboratorio",
  "Radiografías",
  "Ecografías",
  "Electrocardiogramas",
  "Espirometría",
  "Endoscopias",
  "Cirugía ambulatoria",
  "Terapia física",
  "Psicoterapia"
];

const equipamientoOptions = [
  "Estetoscopio",
  "Tensiómetro",
  "Termómetro",
  "Otoscopio",
  "Oftalmoscopio",
  "Equipo de rayos X",
  "Ecógrafo",
  "Electrocardiógrafo",
  "Espirómetro",
  "Endoscopio",
  "Equipo de cirugía",
  "Cama de exploración",
  "Silla de ruedas",
  "Muletas",
  "Vendajes"
];

const estadosOptions = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
  "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
  "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
  "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
  "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
];



function CrearConsultorioPageContent() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { createConsultorio, loading } = useSupabaseStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processingImages, setProcessingImages] = useState(false);

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
          horarios: {
      lunes: { abierto: true, inicio: "08:00", fin: "18:00" },
      martes: { abierto: true, inicio: "08:00", fin: "18:00" },
      miercoles: { abierto: true, inicio: "08:00", fin: "18:00" },
      jueves: { abierto: true, inicio: "08:00", fin: "18:00" },
      viernes: { abierto: true, inicio: "08:00", fin: "18:00" },
      sabado: { abierto: false, inicio: "", fin: "" },
      domingo: { abierto: false, inicio: "", fin: "" }
    },
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
  }, [isAuthenticated, router]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log('No se seleccionaron archivos');
      return;
    }

    console.log(`Archivos seleccionados: ${files.length}`);

    // Validar tipos de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = Array.from(files).filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      const errorMsg = `Archivos no válidos: ${invalidFiles.map(f => f.name).join(', ')}. Solo se permiten JPG, PNG y WebP.`;
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    // Validar tamaño de archivos (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = Array.from(files).filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      const errorMsg = `Archivos demasiado grandes: ${oversizedFiles.map(f => f.name).join(', ')}. El tamaño máximo es 5MB.`;
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    // Limpiar errores previos
    setError("");
    setProcessingImages(true);
    console.log('Iniciando procesamiento de imágenes...');

    const newImages: string[] = [];
    let processedFiles = 0;
    let errorCount = 0;

    Array.from(files).forEach((file, index) => {
      console.log(`Procesando archivo ${index + 1}: ${file.name} (${file.size} bytes, tipo: ${file.type})`);
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          newImages.push(e.target.result as string);
          console.log(`Archivo ${file.name} procesado exitosamente`);
        } else {
          console.error(`No se pudo leer el contenido del archivo: ${file.name}`);
          errorCount++;
        }
        processedFiles++;
        
        // Cuando todos los archivos han sido procesados
        if (processedFiles === files.length) {
          if (errorCount === 0) {
            setUploadedImages(prev => [...prev, ...newImages]);
            console.log(`Se procesaron ${newImages.length} imágenes exitosamente`);
            setSuccess(`Se subieron ${newImages.length} imágenes correctamente`);
          } else {
            console.warn(`${errorCount} archivos tuvieron errores durante el procesamiento`);
            if (newImages.length > 0) {
              setUploadedImages(prev => [...prev, ...newImages]);
              setSuccess(`Se subieron ${newImages.length} imágenes correctamente (${errorCount} fallaron)`);
            }
          }
          setProcessingImages(false);
        }
      };

      reader.onerror = (error) => {
        console.error(`Error al leer el archivo ${file.name}:`, error);
        setError(`Error al procesar la imagen: ${file.name}`);
        errorCount++;
        processedFiles++;
        
        if (processedFiles === files.length) {
          setProcessingImages(false);
          if (newImages.length > 0) {
            setUploadedImages(prev => [...prev, ...newImages]);
            setSuccess(`Se subieron ${newImages.length} imágenes correctamente (${errorCount} fallaron)`);
          }
        }
      };

      reader.readAsDataURL(file);
    });

    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    event.target.value = '';
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

      // La validación de rol ya se hace en ProtectedRoute

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

  // La validación de rol ya se hace en ProtectedRoute

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
        
        {/* Botón de debug para probar la funcionalidad */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug - Solo desarrollo</h3>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('Estado actual del formulario:', form.getValues());
                  console.log('Imágenes subidas:', uploadedImages);
                  console.log('Usuario autenticado:', user);
                  console.log('Estado de autenticación:', isAuthenticated);
                }}
              >
                Ver estado del formulario en consola
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const testData = {
                    titulo: "Consultorio de prueba",
                    descripcion: "Descripción de prueba para el consultorio",
                    direccion: "Calle de prueba 123",
                    ciudad: "Ciudad de prueba",
                    estado: "Estado de prueba",
                    codigo_postal: "12345",
                    precio_por_hora: 200,
                    metros_cuadrados: 25,
                    numero_consultorios: 1,
                    especialidades: ["Medicina General"],
                    servicios: ["Consulta médica"],
                    equipamiento: ["Estetoscopio"],
                    permite_mascotas: false,
                    estacionamiento: true,
                    wifi: true,
                    aire_acondicionado: false,
                    imagenes: [],
                    imagen_principal: undefined,
                  };
                  console.log('Datos de prueba para crear consultorio:', testData);
                }}
              >
                Generar datos de prueba
              </Button>
            </div>
          </div>
        )}

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
                              value={field.value}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              onBlur={field.onBlur}
                              name={field.name}
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
                              value={field.value || ''}
                              onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                              onBlur={field.onBlur}
                              name={field.name}
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
                              value={field.value || ''}
                              onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                              onBlur={field.onBlur}
                              name={field.name}
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
                              value={field.value}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              onBlur={field.onBlur}
                              name={field.name}
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
                              value={field.value}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              onBlur={field.onBlur}
                              name={field.name}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="horarios"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-medium">Horarios de Disponibilidad</FormLabel>
                        <FormControl>
                          <HorariosManager
                            horarios={field.value}
                            onHorariosChange={field.onChange}
                          />
                        </FormControl>
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
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Subir imágenes del consultorio
                      </h3>
                      <p className="text-gray-600 mb-4 max-w-md mx-auto">
                        Sube fotos de alta calidad de tu consultorio para atraer más profesionales. 
                        La primera imagen será la principal.
                      </p>
                      <div className="text-sm text-muted-foreground mb-4 space-y-1">
                        <p>• Formatos aceptados: JPG, PNG, WebP</p>
                        <p>• Tamaño máximo: 5MB por imagen</p>
                        <p>• Recomendado: Mínimo 3 imágenes</p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => document.getElementById('image-upload')?.click()}
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Seleccionar imágenes
                      </Button>
                      
                      {processingImages && (
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center justify-center text-blue-700">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                            Procesando imágenes...
                          </div>
                        </div>
                      )}
                    </div>

                    {uploadedImages.length === 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Consejos para mejores fotos:</p>
                            <ul className="space-y-1 text-xs">
                              <li>• Toma fotos con buena iluminación</li>
                              <li>• Muestra diferentes ángulos del consultorio</li>
                              <li>• Incluye fotos del equipamiento médico</li>
                              <li>• Destaca las comodidades disponibles</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-foreground">
                          Imágenes subidas ({uploadedImages.length})
                        </h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setUploadedImages([])}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Eliminar todas
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative group border border-border rounded-lg overflow-hidden">
                            <Image
                              src={image}
                              alt={`Imagen ${index + 1} del consultorio`}
                              width={200}
                              height={150}
                              className="w-full h-32 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            
                            {index === 0 && (
                              <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded font-medium">
                                <CheckCircle className="h-3 w-3 mr-1 inline" />
                                Principal
                              </div>
                            )}
                            
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              #{index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-green-800">
                            <p className="font-medium mb-1">¡Perfecto! Imágenes listas</p>
                            <p>La primera imagen será la principal y se mostrará en los resultados de búsqueda.</p>
                          </div>
                        </div>
                      </div>
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
  return (
    <ProtectedRoute allowedRoles={["user", "admin"]} redirectTo="/dashboard">
      <CrearConsultorioPageContent />
    </ProtectedRoute>
  );
}