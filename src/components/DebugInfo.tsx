"use client";

import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DebugInfoProps {
  show?: boolean;
}

export function DebugInfo({ show = false }: DebugInfoProps) {
  const { user, isAuthenticated } = useAuthStore();

  if (!show) return null;

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800">🔧 Información de Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">Estado de autenticación:</span>
          <Badge variant={isAuthenticated ? "default" : "destructive"}>
            {isAuthenticated ? "Autenticado" : "No autenticado"}
          </Badge>
        </div>
        
        {user && (
          <>
            <div className="flex items-center gap-2">
              <span className="font-medium">ID de usuario:</span>
              <code className="text-xs bg-gray-100 px-1 rounded">
                {user.id}
              </code>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium">Email:</span>
              <span>{user.email}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium">Rol:</span>
              <Badge variant={user.role === "owner" ? "default" : "secondary"}>
                {user.role}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium">Verificado:</span>
              <Badge variant={(user as { verificado?: boolean }).verificado ? "default" : "secondary"}>
                {(user as { verificado?: boolean }).verificado ? "Sí" : "No"}
              </Badge>
            </div>
          </>
        )}
        
        <div className="flex items-center gap-2">
          <span className="font-medium">URL actual:</span>
          <code className="text-xs bg-gray-100 px-1 rounded">
            {typeof window !== 'undefined' ? window.location.href : 'SSR'}
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
