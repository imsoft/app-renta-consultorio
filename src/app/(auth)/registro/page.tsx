"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  User,
  AlertCircle,
  CheckCircle,
  UserPlus
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSupabaseStore } from "@/stores/supabaseStore";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

// Forzar renderizado dinámico para evitar problemas con Supabase
export const dynamic = 'force-dynamic';

// Schema de validación para el formulario de registro
const registroSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un email válido"),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "La contraseña debe contener al menos una mayúscula, una minúscula y un número"),
  confirmPassword: z.string(),
  aceptoTerminos: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegistroFormValues = z.infer<typeof registroSchema>;

export default function RegistroPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { signUp, signInWithGoogle, loading } = useSupabaseStore();

  const form = useForm<RegistroFormValues>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      password: "",
      confirmPassword: "",
      aceptoTerminos: false,
    },
  });

  const onSubmit = async (data: RegistroFormValues) => {
    setError("");
    setSuccess("");
    
    const { error } = await signUp(data.email, data.password, {
      nombre: data.nombre,
      apellidos: data.apellido,
      role: "professional"
    });
    
    if (error) {
      console.error("Registration error:", error);
      setError("Error al crear la cuenta. El email podría estar ya registrado.");
    } else {
      setSuccess("¡Cuenta creada exitosamente! Revisa tu email para confirmar tu cuenta.");
      setTimeout(() => router.push("/login"), 3000);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setSuccess("");
    
    const { error } = await signInWithGoogle();
    
    if (error) {
      console.error("Google sign up error:", error);
      setError("Error al registrarse con Google. Intenta de nuevo.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <div className="p-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-6 text-center">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <Image
                  src="/logo.svg"
                  alt="WellPoint Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            
            <div>
              <CardTitle className="text-2xl font-bold">Únete a WellPoint</CardTitle>
              <p className="text-muted-foreground mt-2">
                Crea tu cuenta y comienza a rentar consultorios
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error/Success Messages */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            {success && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {/* Register Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              placeholder="Tu nombre"
                              className="pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apellido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Tu apellido"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="tu@email.com"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Tu contraseña"
                            className="pl-10 pr-10"
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password Field */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirma tu contraseña"
                            className="pl-10 pr-10"
                          />
                          <button
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Terms and Conditions */}
                <FormField
                  control={form.control}
                  name="aceptoTerminos"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm text-muted-foreground cursor-pointer">
                          Acepto los{" "}
                          <Link
                            href="/terminos-servicio"
                            className="text-primary hover:text-primary/80 underline"
                          >
                            términos y condiciones
                          </Link>{" "}
                          y la{" "}
                          <Link
                            href="/politica-privacidad"
                            className="text-primary hover:text-primary/80 underline"
                          >
                            política de privacidad
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      <span>Creando cuenta...</span>
                    </div>
                  ) : (
                    "Crear Cuenta"
                  )}
                </Button>
              </form>
            </Form>

            {/* Divider */}
            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-background px-2 text-muted-foreground text-sm">
                  o regístrate con
                </span>
              </div>
            </div>

            {/* Google Sign Up */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-border hover:bg-accent/50 transition-all duration-200"
              onClick={handleGoogleSignUp}
              disabled={loading}
              size="lg"
            >
              <div className="relative w-5 h-5 mr-2">
                <Image
                  src="/google-logo.svg"
                  alt="Google Logo"
                  fill
                  className="object-contain"
                />
              </div>
              {loading ? "Conectando..." : "Continuar con Google"}
            </Button>

            {/* Login Link */}
            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
