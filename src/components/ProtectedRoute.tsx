"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("user" | "admin")[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = "/login" 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Mostrar spinner mientras carga
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Verificando autenticación...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirige)
  if (!isAuthenticated) {
    return null;
  }

  // Si hay roles específicos requeridos, verificar acceso
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Lock className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acceso restringido</h2>
            <p className="text-muted-foreground mb-4">
              No tienes permisos para acceder a esta página.
            </p>
            <Button asChild>
              <Link href="/dashboard">Ir al dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
