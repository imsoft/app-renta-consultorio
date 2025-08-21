"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  Building,
  Wifi,
  Car,
  Accessibility,
  Upload,
  X,
  Plus,
  CheckCircle,
  AlertCircle,
  Save
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/authStore";

// Schema de validación (mismo que crear consultorio)
const consultorioSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().min(20, "La descripción debe tener al menos 20 caracteres"),
  direccion: z.string().min(10, "La dirección debe ser más específica"),
  colonia: z.string().min(2, "La colonia es requerida"),
  ciudad: z.string().min(2, "La ciudad es requerida"),
  codigoPostal: z.string().min(5, "El código postal debe tener 5 dígitos"),
  precio: z.number().min(100, "El precio mínimo es $100 por hora"),
  capacidad: z.number().min(1, "La capacidad debe ser al menos 1"),
  especialidades: z.array(z.string()).min(1, "Selecciona al menos una especialidad"),
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
  equipamiento: z.array(z.string()).min(1, "Agrega al menos un elemento de equipamiento"),
  servicios: z.array(z.string()),
  politicas: z.object({
    reservaMinima: z.number().min(1, "La reserva mínima debe ser al menos 1 hora"),
    cancelacionGratuita: z.boolean(),
    horasCancelacion: z.number().min(0, "Las horas deben ser 0 o más"),
    seguroIncluido: z.boolean(),
  }),
  contacto: z.object({
    telefono: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
    email: z.string().email("Ingresa un email válido"),
    whatsapp: z.boolean(),
  }),
  terminos: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones",
  }),
});

type ConsultorioFormValues = z.infer<typeof consultorioSchema>;

// Opciones predefinidas (mismas que crear consultorio)
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

const equipamientoBasico = [
  "Sala de espera",
  "Consultorio privado",
  "Baño privado",
  "Sistema de aire acondicionado",
  "Iluminación profesional",
  "Escritorio y silla",
  "Sillón de consulta",
  "Estante para documentos",
  "Sistema de sonido",
  "Conexión eléctrica"
];

const serviciosDisponibles = [
  { id: "wifi", nombre: "WiFi", descripcion: "Internet de alta velocidad" },
  { id: "estacionamiento", nombre: "Estacionamiento", descripcion: "Estacionamiento gratuito" },
  { id: "accesibilidad", nombre: "Accesibilidad", descripcion: "Acceso para sillas de ruedas" },
  { id: "cafeteria", nombre: "Cafetería", descripcion: "Cafetería o área de café" },
  { id: "limpieza", nombre: "Limpieza incluida", descripcion: "Servicio de limpieza incluido" },
  { id: "seguridad", nombre: "Seguridad 24/7", descripcion: "Vigilancia las 24 horas" },
  { id: "aire", nombre: "Aire acondicionado", descripcion: "Control de temperatura" },
  { id: "calefaccion", nombre: "Calefacción", descripcion: "Sistema de calefacción" }
];

// Datos simulados del consultorio a editar
const getConsultorioData = (id: string) => {
  const consultorios = {
    "1": {
      id: 1,
      nombre: "Consultorio Médico Central",
      descripcion: "Consultorio médico completamente equipado ubicado en el corazón del Centro Histórico. Ideal para médicos generales y especialistas que buscan un espacio profesional y accesible.",
      direccion: "Av. Juárez 123, Centro Histórico",
      colonia: "Centro Histórico",
      ciudad: "Ciudad de México",
      codigoPostal: "06000",
      precio: 800,
      capacidad: 2,
      especialidades: ["Medicina General", "Cardiología", "Dermatología"],
      horarios: {
        lunes: { abierto: true, inicio: "08:00", fin: "18:00" },
        martes: { abierto: true, inicio: "08:00", fin: "18:00" },
        miercoles: { abierto: true, inicio: "08:00", fin: "18:00" },
        jueves: { abierto: true, inicio: "08:00", fin: "18:00" },
        viernes: { abierto: true, inicio: "08:00", fin: "18:00" },
        sabado: { abierto: false, inicio: "09:00", fin: "14:00" },
        domingo: { abierto: false, inicio: "", fin: "" },
      },
      equipamiento: ["Sala de espera", "Consultorio privado", "Baño privado", "Sistema de aire acondicionado"],
      servicios: ["wifi", "estacionamiento", "accesibilidad"],
      politicas: {
        reservaMinima: 2,
        cancelacionGratuita: true,
        horasCancelacion: 24,
        seguroIncluido: true,
      },
      contacto: {
        telefono: "+52 55 1234 5678",
        email: "carlos.mendoza@medirenta.com",
        whatsapp: true,
      },
      propietario: "Carlos Mendoza"
    }
  };
  
  return consultorios[id as keyof typeof consultorios] || null;
};

export default function EditarConsultorioPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [consultorioData, setConsultorioData] = useState<ConsultorioFormValues | null>(null);
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();

  const form = useForm<ConsultorioFormValues>({
    resolver: zodResolver(consultorioSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      direccion: "",
      colonia: "",
      ciudad: "Ciudad de México",
      codigoPostal: "",
      precio: 800,
      capacidad: 1,
      especialidades: [],
      horarios: {
        lunes: { abierto: true, inicio: "08:00", fin: "18:00" },
        martes: { abierto: true, inicio: "08:00", fin: "18:00" },
        miercoles: { abierto: true, inicio: "08:00", fin: "18:00" },
        jueves: { abierto: true, inicio: "08:00", fin: "18:00" },
        viernes: { abierto: true, inicio: "08:00", fin: "18:00" },
        sabado: { abierto: false, inicio: "09:00", fin: "14:00" },
        domingo: { abierto: false, inicio: "", fin: "" },
      },
      equipamiento: [],
      servicios: [],
      politicas: {
        reservaMinima: 2,
        cancelacionGratuita: true,
        horasCancelacion: 24,
        seguroIncluido: true,
      },
      contacto: {
        telefono: "",
        email: user?.email || "",
        whatsapp: true,
      },
      terminos: true,
    },
  });

  // Cargar datos del consultorio
  useEffect(() => {
    const loadConsultorio = async () => {
      setIsLoading(true);
      
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data = getConsultorioData(params.id as string);
      
      if (data) {
        const consultorioWithTerminos = { ...data, terminos: true };
        setConsultorioData(consultorioWithTerminos);
        form.reset({
          nombre: data.nombre,
          descripcion: data.descripcion,
          direccion: data.direccion,
          colonia: data.colonia,
          ciudad: data.ciudad,
          codigoPostal: data.codigoPostal,
          precio: data.precio,
          capacidad: data.capacidad,
          especialidades: data.especialidades,
          horarios: data.horarios,
          equipamiento: data.equipamiento,
          servicios: data.servicios,
          politicas: data.politicas,
          contacto: data.contacto,
          terminos: true,
        });
      } else {
        setError("Consultorio no encontrado");
      }
      
      setIsLoading(false);
    };

    if (params.id) {
      loadConsultorio();
    }
  }, [params.id, form]);

  const onSubmit = async (data: ConsultorioFormValues) => {
    setError("");
    setSuccess("");
    
    try {
      // Simular envío de datos
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Consultorio actualizado:", data);
      setSuccess("¡Consultorio actualizado exitosamente!");
      
      // Redireccionar después de 2 segundos
      setTimeout(() => {
        router.push("/mis-consultorios");
      }, 2000);
    } catch (error) {
      setError("Error al actualizar el consultorio. Intenta de nuevo.");
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Verificar si el usuario está autenticado y es propietario
  if (!isAuthenticated || user?.tipo !== "propietario") {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Acceso restringido</h2>
              <p className="text-muted-foreground mb-4">
                Solo los propietarios pueden editar consultorios.
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

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando consultorio...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si no se encuentra el consultorio
  if (error && !consultorioData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Consultorio no encontrado</h2>
              <p className="text-muted-foreground mb-4">
                El consultorio que buscas no existe o no tienes permisos para editarlo.
              </p>
              <Button asChild>
                <Link href="/mis-consultorios">Volver a mis consultorios</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/mis-consultorios"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a mis consultorios
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Editar Consultorio
          </h1>
          <p className="text-muted-foreground">
            Actualiza la información de tu espacio médico
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Información básica</span>
            <span>Horarios y equipamiento</span>
            <span>Políticas y contacto</span>
            <span>Revisar y guardar</span>
          </div>
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Información básica */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Información Básica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del consultorio *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Consultorio Médico Central" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="precio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio por hora (MXN) *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                placeholder="800"
                                className="pl-10"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="descripcion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe tu consultorio, equipamiento, servicios especiales, etc."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="capacidad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacidad de pacientes *</FormLabel>
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
                      name="codigoPostal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código Postal *</FormLabel>
                          <FormControl>
                            <Input placeholder="06000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="direccion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección completa *</FormLabel>
                        <FormControl>
                          <Input placeholder="Av. Juárez 123, Centro Histórico" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="colonia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Colonia *</FormLabel>
                          <FormControl>
                            <Input placeholder="Centro Histórico" {...field} />
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
                          <FormLabel>Ciudad *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ciudad de México" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="especialidades"
                    render={() => (
                      <FormItem>
                        <FormLabel>Especialidades médicas *</FormLabel>
                        <div className="grid sm:grid-cols-3 gap-3">
                          {especialidades.map((especialidad) => (
                            <FormField
                              key={especialidad}
                              control={form.control}
                              name="especialidades"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={especialidad}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(especialidad)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, especialidad])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== especialidad
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {especialidad}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 2: Horarios y equipamiento */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Horarios y Equipamiento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Horarios */}
                  <div>
                    <h3 className="font-semibold mb-4">Horarios de disponibilidad</h3>
                    <div className="space-y-3">
                      {Object.entries(form.watch("horarios")).map(([dia, horario]) => (
                        <div key={dia} className="flex items-center space-x-4 p-3 border rounded-lg">
                          <div className="w-24">
                            <span className="font-medium capitalize">
                              {dia === 'miercoles' ? 'Miércoles' : 
                               dia === 'sabado' ? 'Sábado' : 
                               dia.charAt(0).toUpperCase() + dia.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={horario.abierto}
                              onCheckedChange={(checked) => {
                                form.setValue(`horarios.${dia}.abierto` as keyof ConsultorioFormValues, checked as boolean);
                              }}
                            />
                            <span className="text-sm">Abierto</span>
                          </div>
                          {horario.abierto && (
                            <div className="flex items-center space-x-2">
                              <Input
                                type="time"
                                className="w-32"
                                value={horario.inicio || ""}
                                onChange={(e) => {
                                  form.setValue(`horarios.${dia}.inicio` as keyof ConsultorioFormValues, e.target.value);
                                }}
                              />
                              <span>a</span>
                              <Input
                                type="time"
                                className="w-32"
                                value={horario.fin || ""}
                                onChange={(e) => {
                                  form.setValue(`horarios.${dia}.fin` as keyof ConsultorioFormValues, e.target.value);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Equipamiento */}
                  <FormField
                    control={form.control}
                    name="equipamiento"
                    render={() => (
                      <FormItem>
                        <FormLabel>Equipamiento disponible *</FormLabel>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {equipamientoBasico.map((equipo) => (
                            <FormField
                              key={equipo}
                              control={form.control}
                              name="equipamiento"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={equipo}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(equipo)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, equipo])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== equipo
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {equipo}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Servicios */}
                  <FormField
                    control={form.control}
                    name="servicios"
                    render={() => (
                      <FormItem>
                        <FormLabel>Servicios incluidos</FormLabel>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {serviciosDisponibles.map((servicio) => (
                            <FormField
                              key={servicio.id}
                              control={form.control}
                              name="servicios"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={servicio.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(servicio.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, servicio.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== servicio.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <div>
                                      <FormLabel className="text-sm font-normal">
                                        {servicio.nombre}
                                      </FormLabel>
                                      <p className="text-xs text-muted-foreground">
                                        {servicio.descripcion}
                                      </p>
                                    </div>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 3: Políticas y contacto */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Políticas y Contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Políticas */}
                  <div>
                    <h3 className="font-semibold mb-4">Políticas de reserva</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="politicas.reservaMinima"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reserva mínima (horas)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="2"
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
                        name="politicas.horasCancelacion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horas para cancelación gratuita</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="24"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-3 mt-4">
                      <FormField
                        control={form.control}
                        name="politicas.cancelacionGratuita"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm">
                              Permitir cancelación gratuita
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="politicas.seguroIncluido"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm">
                              Seguro de responsabilidad civil incluido
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Contacto */}
                  <div>
                    <h3 className="font-semibold mb-4">Información de contacto</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contacto.telefono"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono *</FormLabel>
                            <FormControl>
                              <Input placeholder="+52 55 1234 5678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contacto.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input placeholder="tu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="contacto.whatsapp"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm">
                            Disponible para WhatsApp
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Revisar y guardar */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Revisar y Guardar Cambios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Resumen */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Resumen de cambios</h3>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Nombre:</p>
                        <p className="text-muted-foreground">{form.watch("nombre")}</p>
                      </div>
                      <div>
                        <p className="font-medium">Precio:</p>
                        <p className="text-muted-foreground">${form.watch("precio")}/hora</p>
                      </div>
                      <div>
                        <p className="font-medium">Ubicación:</p>
                        <p className="text-muted-foreground">
                          {form.watch("direccion")}, {form.watch("colonia")}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Especialidades:</p>
                        <p className="text-muted-foreground">
                          {form.watch("especialidades").join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Términos */}
                  <FormField
                    control={form.control}
                    name="terminos"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm">
                          Confirmo que la información es correcta y acepto los{" "}
                          <Link href="/terminos" className="text-primary hover:text-primary/80">
                            términos y condiciones
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
                Anterior
              </Button>
              
              {currentStep < 4 ? (
                <Button type="button" onClick={nextStep}>
                  Siguiente
                </Button>
              ) : (
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                      Guardando cambios...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar cambios
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </main>

    </div>
  );
}
