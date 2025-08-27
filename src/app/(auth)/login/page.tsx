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
  AlertCircle,
  CheckCircle,
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

// Forzar renderizado dinámico para evitar problemas con Supabase
export const dynamic = 'force-dynamic';

// Schema de validación para el formulario de login
const loginSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
  password: z.string().min(1, "La contraseña es requerida"),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { signIn, signInWithGoogle, loading } = useSupabaseStore();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError("");
    setSuccess("");
    
    const { error } = await signIn(data.email, data.password);

    if (error) {
      console.error("Login error:", error);
      setError(
        "Credenciales incorrectas. Verifica tu email y contraseña."
      );
    } else {
      setSuccess("¡Inicio de sesión exitoso! Redirigiendo...");
      setTimeout(() => router.push("/dashboard"), 1000);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccess("");
    
    const { error } = await signInWithGoogle();
    
    if (error) {
      console.error("Google sign in error:", error);
      setError("Error al iniciar sesión con Google. Intenta de nuevo.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
              <CardTitle className="text-2xl font-bold">Bienvenido de vuelta</CardTitle>
              <p className="text-muted-foreground mt-2">
                Inicia sesión en tu cuenta de WellPoint
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

            {/* Login Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="rounded border-border text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <FormLabel className="text-sm text-muted-foreground cursor-pointer">
                          Recordarme
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <Link
                    href="/recuperar-password"
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

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
                      <span>Iniciando sesión...</span>
                    </div>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </form>
            </Form>

            {/* Divider */}
            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-background px-2 text-muted-foreground text-sm">
                  o continúa con
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-border hover:bg-accent/50 transition-all duration-200"
              onClick={handleGoogleSignIn}
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

            {/* Register Link */}
            <p className="text-center text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <Link
                href="/registro"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
