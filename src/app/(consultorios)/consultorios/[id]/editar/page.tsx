"use client";
import { Card, CardContent } from "@/components/ui/card";

// Forzar renderizado dinámico para evitar problemas con Supabase
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  DollarSign,
  Clock,
  Building,
  CheckCircle,
  AlertCircle,
  Save,
  Upload,
  X
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import HorariosManager from "@/components/HorariosManager";

// Schema de validación (mismo que crear consultorio)
const consultorioSchema = z.object({
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  descripcion: z.string().min(20, "La descripción debe tener al menos 20 caracteres"),
  direccion: z.string().min(10, "La dirección debe ser más específica"),
  ciudad: z.string().min(2, "La ciudad es requerida"),
  estado: z.string().min(2, "El estado es requerido"),
  codigo_postal: z.string().min(5, "El código postal debe tener 5 dígitos"),
  precio_por_hora: z.number().min(100, "El precio mínimo es $100 por hora"),
  precio_por_dia: z.number().min(0, "El precio por día no puede ser negativo"),
  precio_por_mes: z.number().min(0, "El precio por mes no puede ser negativo"),
  metros_cuadrados: z.number().min(1, "Los metros cuadrados deben ser al menos 1"),
  numero_consultorios: z.number().min(1, "El número de consultorios debe ser al menos 1"),
  especialidades: z.array(z.string()).min(1, "Selecciona al menos una especialidad"),
  servicios: z.array(z.string()),
  equipamiento: z.array(z.string()),
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
  permite_mascotas: z.boolean(),
  estacionamiento: z.boolean(),
  wifi: z.boolean(),
  aire_acondicionado: z.boolean(),
  terminos: z.boolean(),
});

type ConsultorioFormValues = z.infer<typeof consultorioSchema>;

// Opciones predefinidas
const especialidades = [
  "Medicina General",
  "Cardiología",
  "Dermatología",
  "Oftalmología",
  "Ortopedia",
  "Pediatría",
  "Ginecología",
  "Neurología",
  "Psiquiatría",
  "Psicología",
  "Odontología",
  "Fisioterapia",
  "Nutrición",
  "Radiología",
  "Cirugía",
  "Oncología",
  "Endocrinología",
  "Gastroenterología",
  "Urología",
  "Otorrinolaringología"
];

const serviciosDisponibles = [
  "Consulta médica",
  "Exámenes de laboratorio",
  "Radiografías",
  "Ecografías",
  "Terapia física",
  "Psicoterapia",
  "Cirugía ambulatoria",
  "Vacunación",
  "Control prenatal",
  "Rehabilitación"
];

const equipamientoBasico = [
  "Estetoscopio",
  "Tensiómetro",
  "Otoscopio",
  "Oftalmoscopio",
  "Balanza",
  "Cama de exploración",
  "Lámpara de examen",
  "Computadora",
  "Impresora",
  "Sistema de archivos"
];

export default function EditarConsultorioPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [camposFaltantes, setCamposFaltantes] = useState<string[]>([]);
  const [consultorioData, setConsultorioData] = useState<Partial<ConsultorioFormValues> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const { getConsultorio, updateConsultorio } = useSupabaseStore();
  const id = params.id as string;

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

  // Función para verificar si un paso está completo
  const isStepComplete = (step: number) => {
    const formValues = form.getValues();
    
    switch (step) {
      case 1: // Información básica
        return !!(
          formValues.titulo?.trim().length >= 3 &&
          formValues.descripcion?.trim().length >= 20 &&
          formValues.direccion?.trim().length >= 10 &&
          formValues.ciudad?.trim().length >= 2 &&
          formValues.estado?.trim().length >= 2 &&
          formValues.codigo_postal?.trim().length >= 5
        );
      
      case 2: // Detalles
        return !!(
          formValues.precio_por_hora &&
          formValues.precio_por_hora >= 100 &&
          formValues.metros_cuadrados &&
          formValues.metros_cuadrados >= 1 &&
          formValues.numero_consultorios &&
          formValues.numero_consultorios >= 1
        );
      
      case 3: // Servicios
        return !!(
          formValues.especialidades &&
          formValues.especialidades.length > 0
        );
      
      case 4: // Imágenes
        return uploadedImages.length > 0;
      
      default:
        return false;
    }
  };

  // Cargar datos del consultorio
  useEffect(() => {
    const fetchConsultorio = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await getConsultorio(id);
        if (error) {
          console.error("Error al cargar consultorio:", error);
          setError("Error al cargar el consultorio");
          return;
        }
        
        if (data) {
          console.log("Datos del consultorio cargados:", data);
          setConsultorioData(data);
          
          // Cargar imágenes existentes
          const imagenesExistentes = data.imagenes || [];
          console.log("Imágenes existentes:", imagenesExistentes);
          setUploadedImages(imagenesExistentes);
          
          // Llenar el formulario con los datos existentes
           form.reset({
             titulo: data.titulo || "",
             descripcion: data.descripcion || "",
             direccion: data.direccion || "",
             ciudad: data.ciudad || "",
             estado: data.estado || "",
             codigo_postal: data.codigo_postal || "",
             precio_por_hora: data.precio_por_hora || 200,
             precio_por_dia: data.precio_por_dia || 0,
             precio_por_mes: data.precio_por_mes || 0,
             metros_cuadrados: data.metros_cuadrados || 20,
             numero_consultorios: data.numero_consultorios || 1,
             especialidades: data.especialidades || [],
             servicios: data.servicios || [],
             equipamiento: data.equipamiento || [],
             horarios: {
               lunes: { abierto: true, inicio: "08:00", fin: "18:00" },
               martes: { abierto: true, inicio: "08:00", fin: "18:00" },
               miercoles: { abierto: true, inicio: "08:00", fin: "18:00" },
               jueves: { abierto: true, inicio: "08:00", fin: "18:00" },
               viernes: { abierto: true, inicio: "08:00", fin: "18:00" },
               sabado: { abierto: false, inicio: "", fin: "" },
               domingo: { abierto: false, inicio: "", fin: "" }
             },
             permite_mascotas: data.permite_mascotas || false,
             estacionamiento: data.estacionamiento || false,
             wifi: data.wifi || true,
             aire_acondicionado: data.aire_acondicionado || false,
             terminos: false, // Siempre false para editar
           });
        }
      } catch (error) {
        console.error("Error inesperado:", error);
        setError("Error inesperado al cargar el consultorio");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && id) {
      fetchConsultorio();
    }
  }, [id, isAuthenticated, getConsultorio, form]);

  // Efecto para detectar cambios en el formulario y validar automáticamente
  useEffect(() => {
    // Validar inmediatamente al cargar
    const validateForm = () => {
      const formValues = form.getValues();
      const camposFaltantes: string[] = [];
      
      if (!formValues.titulo || formValues.titulo.trim().length < 3) {
        camposFaltantes.push("Título (mínimo 3 caracteres)");
      }
      
      if (!formValues.descripcion || formValues.descripcion.trim().length < 20) {
        camposFaltantes.push("Descripción (mínimo 20 caracteres)");
      }
      
      if (!formValues.direccion || formValues.direccion.trim().length < 10) {
        camposFaltantes.push("Dirección (mínimo 10 caracteres)");
      }
      
      if (!formValues.ciudad || formValues.ciudad.trim().length < 2) {
        camposFaltantes.push("Ciudad");
      }
      
      if (!formValues.estado || formValues.estado.trim().length < 2) {
        camposFaltantes.push("Estado");
      }
      
      if (!formValues.codigo_postal || formValues.codigo_postal.trim().length < 5) {
        camposFaltantes.push("Código Postal (mínimo 5 dígitos)");
      }
      
      if (!formValues.precio_por_hora || formValues.precio_por_hora < 100) {
        camposFaltantes.push("Precio por hora (mínimo $100)");
      }
      
      if (!formValues.metros_cuadrados || formValues.metros_cuadrados < 1) {
        camposFaltantes.push("Metros cuadrados");
      }
      
      if (!formValues.numero_consultorios || formValues.numero_consultorios < 1) {
        camposFaltantes.push("Número de consultorios");
      }
      
      if (!formValues.especialidades || formValues.especialidades.length === 0) {
        camposFaltantes.push("Especialidades (selecciona al menos una)");
      }

      if (!uploadedImages || uploadedImages.length === 0) {
        camposFaltantes.push("Imágenes (sube al menos una imagen)");
      }

      setCamposFaltantes(camposFaltantes);
    };

    // Validar inmediatamente
    validateForm();

    // Validar cuando cambien los valores
    const subscription = form.watch(() => {
      validateForm();
    });
    
    return () => subscription.unsubscribe();
  }, [form, uploadedImages]);

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("=== handleImageUpload llamado ===");
    const files = event.target.files;
    console.log("Archivos seleccionados:", files);
    console.log("Número de archivos:", files?.length);
    
    if (!files || files.length === 0) {
      console.log("No se seleccionaron archivos");
      return;
    }
    
    console.log("Estado actual de uploadedImages antes de procesar:", uploadedImages);

    const newImages: string[] = [];
    let processedFiles = 0;
    let errorCount = 0;

    const checkCompletion = () => {
      console.log(`=== checkCompletion ===`);
      console.log(`processedFiles=${processedFiles}, files.length=${files.length}, errorCount=${errorCount}`);
      console.log(`newImages acumuladas:`, newImages);
      
      if (processedFiles === files.length) {
        if (errorCount === 0) {
          console.log("✅ Agregando nuevas imágenes:", newImages);
          setUploadedImages(prev => {
            const nuevas = [...prev, ...newImages];
            console.log("🔄 Estado anterior:", prev);
            console.log("🆕 Nuevo estado de imágenes:", nuevas);
            return nuevas;
          });
        } else {
          console.log("❌ Errores al procesar imágenes:", errorCount);
        }
      }
    };

    Array.from(files).forEach((file, index) => {
      console.log(`Procesando archivo ${index}:`, file.name, file.type, file.size);
      
      if (!file.type.startsWith('image/')) {
        console.error(`Archivo ${file.name} no es una imagen`);
        errorCount++;
        processedFiles++;
        checkCompletion();
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        console.log(`Archivo ${file.name} leído exitosamente, tamaño:`, typeof result === 'string' ? result.length : 'no string');
        if (typeof result === 'string') {
          newImages.push(result);
        }
        processedFiles++;
        checkCompletion();
      };

      reader.onerror = (error) => {
        console.error(`Error al leer el archivo ${file.name}:`, error);
        errorCount++;
        processedFiles++;
        checkCompletion();
      };

      console.log(`Iniciando lectura del archivo ${file.name}`);
      reader.readAsDataURL(file);
    });

    event.target.value = '';
    
    // Log adicional para verificar que la función se completó
    console.log("=== handleImageUpload completado ===");
    console.log("Archivos enviados para procesamiento:", files.length);
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
    setCamposFaltantes([]);

    try {
      // Validar que el usuario esté autenticado
      if (!isAuthenticated || !user) {
        setError("Debes estar autenticado para editar un consultorio.");
        return;
      }

      // Validar campos requeridos y mostrar mensajes específicos
      const camposFaltantes: string[] = [];
      
      if (!data.titulo || data.titulo.trim().length < 3) {
        camposFaltantes.push("Título (mínimo 3 caracteres)");
      }
      
      if (!data.descripcion || data.descripcion.trim().length < 20) {
        camposFaltantes.push("Descripción (mínimo 20 caracteres)");
      }
      
      if (!data.direccion || data.direccion.trim().length < 10) {
        camposFaltantes.push("Dirección (mínimo 10 caracteres)");
      }
      
      if (!data.ciudad || data.ciudad.trim().length < 2) {
        camposFaltantes.push("Ciudad");
      }
      
      if (!data.estado || data.estado.trim().length < 2) {
        camposFaltantes.push("Estado");
      }
      
      if (!data.codigo_postal || data.codigo_postal.trim().length < 5) {
        camposFaltantes.push("Código Postal (mínimo 5 dígitos)");
      }
      
      if (!data.precio_por_hora || data.precio_por_hora < 100) {
        camposFaltantes.push("Precio por hora (mínimo $100)");
      }
      
      if (!data.metros_cuadrados || data.metros_cuadrados < 1) {
        camposFaltantes.push("Metros cuadrados");
      }
      
      if (!data.numero_consultorios || data.numero_consultorios < 1) {
        camposFaltantes.push("Número de consultorios");
      }
      
      if (!data.especialidades || data.especialidades.length === 0) {
        camposFaltantes.push("Especialidades (selecciona al menos una)");
      }

      // Validar que se hayan subido imágenes
      if (!uploadedImages || uploadedImages.length === 0) {
        camposFaltantes.push("Imágenes (sube al menos una imagen)");
      }

      // Si hay campos faltantes, mostrar error y detener
      if (camposFaltantes.length > 0) {
        setCamposFaltantes(camposFaltantes);
        setError("Por favor, completa los campos marcados abajo:");
        return;
      }

      // Limpiar campos faltantes si no hay errores
      setCamposFaltantes([]);

      const consultorioData = {
        titulo: data.titulo,
        descripcion: data.descripcion,
        direccion: data.direccion,
        ciudad: data.ciudad,
        estado: data.estado,
        codigo_postal: data.codigo_postal,
        precio_por_hora: data.precio_por_hora,
        precio_por_dia: data.precio_por_dia,
        precio_por_mes: data.precio_por_mes,
        metros_cuadrados: data.metros_cuadrados,
        numero_consultorios: data.numero_consultorios,
        especialidades: data.especialidades,
        servicios: data.servicios,
        equipamiento: data.equipamiento,
        horarios: data.horarios,
        permite_mascotas: data.permite_mascotas,
        estacionamiento: data.estacionamiento,
        wifi: data.wifi,
        aire_acondicionado: data.aire_acondicionado,
        imagenes: uploadedImages,
        imagen_principal: uploadedImages[0] || undefined,
      };

      console.log("Actualizando consultorio con datos:", consultorioData);

      setLoading(true);
      const { data: updatedConsultorio, error } = await updateConsultorio(id, consultorioData);

      if (error) {
        console.error("Error al actualizar consultorio:", error);
        setError(`Error al actualizar el consultorio: ${error}`);
        return;
      }

      if (!updatedConsultorio) {
        setError("No se pudo actualizar el consultorio. Por favor, intenta de nuevo.");
        return;
      }

      setSuccess("¡Consultorio actualizado exitosamente! Redirigiendo...");
      setTimeout(() => {
        router.push(`/consultorios/${id}`);
      }, 2000);

    } catch (error) {
      console.error("Error inesperado:", error);
      setError("Error inesperado. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando consultorio...</p>
        </div>
      </div>
    );
  }

  if (!consultorioData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Consultorio no encontrado</h2>
          <p className="text-gray-600 mb-4">El consultorio que buscas no existe o no tienes permisos para editarlo.</p>
          <Link href="/mis-consultorios">
            <Button>Volver a mis consultorios</Button>
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
            href={`/consultorios/${id}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al consultorio
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Editar consultorio</h1>
          <p className="mt-2 text-gray-600">
            Modifica la información de tu consultorio médico
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
                <button
                  onClick={() => setCurrentStep(step)}
                  disabled={step > currentStep + 1} // Solo permitir ir a pasos anteriores o al siguiente
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                    currentStep >= step
                      ? "bg-primary border-primary text-white hover:bg-primary/90 cursor-pointer"
                      : step <= currentStep + 1
                      ? "border-gray-400 text-gray-400 hover:border-gray-500 hover:text-gray-500 cursor-pointer"
                      : "border-gray-300 text-gray-300 cursor-not-allowed opacity-50"
                  }`}
                  title={
                    step > currentStep + 1
                      ? "Completa el paso anterior primero"
                      : step === currentStep
                      ? "Paso actual"
                      : `Ir al paso ${step}`
                  }
                >
                  {isStepComplete(step) ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step
                  )}
                </button>
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
            <button
              onClick={() => setCurrentStep(1)}
              disabled={1 > currentStep + 1}
              className={`transition-colors duration-200 ${
                1 <= currentStep + 1
                  ? "hover:text-primary cursor-pointer"
                  : "cursor-not-allowed opacity-50"
              }`}
            >
              Información básica
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              disabled={2 > currentStep + 1}
              className={`transition-colors duration-200 ${
                2 <= currentStep + 1
                  ? "hover:text-primary cursor-pointer"
                  : "cursor-not-allowed opacity-50"
              }`}
            >
              Detalles
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={3 > currentStep + 1}
              className={`transition-colors duration-200 ${
                3 <= currentStep + 1
                  ? "hover:text-primary cursor-pointer"
                  : "cursor-not-allowed opacity-50"
              }`}
            >
              Servicios
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              disabled={4 > currentStep + 1}
              className={`transition-colors duration-200 ${
                4 <= currentStep + 1
                  ? "hover:text-primary cursor-pointer"
                  : "cursor-not-allowed opacity-50"
              }`}
            >
              Imágenes
            </button>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-red-700">
                <p className="font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-green-700">
                <p className="font-medium">{success}</p>
              </div>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Información básica */}
            {currentStep === 1 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="titulo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título del consultorio</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: Consultorio médico en zona centro"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="descripcion"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe tu consultorio, instalaciones, ubicación y características principales..."
                              rows={4}
                              {...field}
                            />
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
                          <FormLabel>Dirección completa</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Calle, número, colonia"
                              {...field}
                            />
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
                            <Input
                              placeholder="Ciudad"
                              {...field}
                            />
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
                          <FormControl>
                            <Input
                              placeholder="Estado"
                              {...field}
                            />
                          </FormControl>
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
                            <Input
                              placeholder="12345"
                              {...field}
                            />
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
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="precio_por_hora"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio por hora (MXN)</FormLabel>
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

                    <FormField
                      control={form.control}
                      name="precio_por_dia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio por día (MXN) - Opcional</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
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
                      name="precio_por_mes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio por mes (MXN) - Opcional</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Servicios */}
            {currentStep === 3 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="especialidades"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especialidades médicas</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {especialidades.map((especialidad) => (
                              <div key={especialidad} className="flex items-center space-x-2">
                                <Checkbox
                                  id={especialidad}
                                  checked={field.value?.includes(especialidad)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value || [], especialidad]);
                                    } else {
                                      field.onChange(field.value?.filter((e) => e !== especialidad) || []);
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={especialidad}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {especialidad}
                                </label>
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
                          <FormLabel>Servicios disponibles</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {serviciosDisponibles.map((servicio) => (
                              <div key={servicio} className="flex items-center space-x-2">
                                <Checkbox
                                  id={servicio}
                                  checked={field.value?.includes(servicio)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value || [], servicio]);
                                    } else {
                                      field.onChange(field.value?.filter((s) => s !== servicio) || []);
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={servicio}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {servicio}
                                </label>
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
                            {equipamientoBasico.map((equipo) => (
                              <div key={equipo} className="flex items-center space-x-2">
                                <Checkbox
                                  id={equipo}
                                  checked={field.value?.includes(equipo)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value || [], equipo]);
                                    } else {
                                      field.onChange(field.value?.filter((e) => e !== equipo) || []);
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={equipo}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {equipo}
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="permite_mascotas"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Permite mascotas</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="estacionamiento"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Estacionamiento</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="wifi"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>WiFi</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="aire_acondicionado"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Aire acondicionado</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="horarios"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horarios de atención</FormLabel>
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
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Imágenes */}
            {currentStep === 4 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <FormLabel>Imágenes del consultorio</FormLabel>
                      <p className="text-sm text-gray-600 mb-4">
                        Sube imágenes de tu consultorio. La primera imagen será la principal.
                      </p>
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute opacity-0 w-0 h-0"
                          id="image-upload"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="cursor-pointer"
                          onClick={() => {
                            console.log("Botón clickeado, activando input de archivos");
                            document.getElementById('image-upload')?.click();
                          }}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Seleccionar imágenes
                        </Button>
                        
                        {/* Debug info */}
                        <div className="mt-4 text-xs text-gray-500">
                          <p>Estado actual: {uploadedImages.length} imágenes</p>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              console.log("Estado actual de uploadedImages:", uploadedImages);
                              console.log("Estado actual de consultorioData:", consultorioData);
                              console.log("Tipo de uploadedImages:", typeof uploadedImages);
                              console.log("Es array:", Array.isArray(uploadedImages));
                            }}
                          >
                            Debug Estado
                          </Button>
                        </div>
                      </div>
                    </div>

                    {uploadedImages.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-3">Imágenes subidas ({uploadedImages.length})</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {uploadedImages.map((image, index) => (
                            <div key={index} className="relative group">
                              <Image
                                src={image}
                                alt={`Imagen ${index + 1}`}
                                width={200}
                                height={200}
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
                                <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                  Principal
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
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
                  </div>
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
                  {loading ? "Guardando cambios..." : "Guardar cambios"}
                </Button>
              )}
            </div>

            {/* Mensaje de validación de campos faltantes */}
            {camposFaltantes.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-yellow-700">
                    <p className="font-medium mb-2">Por favor, completa los siguientes campos para continuar:</p>
                    <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                      {camposFaltantes.map((campo, index) => (
                        <li key={index}>{campo}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </form>
        </Form>
      </main>
    </div>
  );
}
