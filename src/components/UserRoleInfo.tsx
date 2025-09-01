"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Calendar, 
  Star, 
  Eye, 
  Plus,
  Users,
  Shield,
  Info
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

interface UserRoleInfoProps {
  className?: string;
}

export function UserRoleInfo({ className = "" }: UserRoleInfoProps) {
  const { user } = useAuthStore();

  if (!user) return null;

  const roleInfo = {
    user: {
      title: "Usuario",
      description: "Puedes buscar y reservar consultorios",
      color: "bg-blue-100 text-blue-800",
      actions: [
        { icon: Eye, text: "Buscar consultorios", available: true },
        { icon: Calendar, text: "Hacer reservas", available: true },
        { icon: Star, text: "Guardar favoritos", available: true },
        { icon: Plus, text: "Crear consultorio", available: false },
        { icon: Building2, text: "Gestionar consultorios", available: false },
      ]
    },
    professional: {
      title: "Profesional",
      description: "Puedes buscar, reservar y gestionar tus reservas",
      color: "bg-green-100 text-green-800",
      actions: [
        { icon: Eye, text: "Buscar consultorios", available: true },
        { icon: Calendar, text: "Hacer reservas", available: true },
        { icon: Star, text: "Guardar favoritos", available: true },
        { icon: Plus, text: "Crear consultorio", available: false },
        { icon: Building2, text: "Gestionar consultorios", available: false },
      ]
    },
    owner: {
      title: "Propietario",
      description: "Puedes crear, gestionar y administrar consultorios",
      color: "bg-purple-100 text-purple-800",
      actions: [
        { icon: Eye, text: "Buscar consultorios", available: true },
        { icon: Calendar, text: "Hacer reservas", available: true },
        { icon: Star, text: "Guardar favoritos", available: true },
        { icon: Plus, text: "Crear consultorio", available: true },
        { icon: Building2, text: "Gestionar consultorios", available: true },
      ]
    },
    admin: {
      title: "Administrador",
      description: "Acceso completo al sistema y gestión de usuarios",
      color: "bg-red-100 text-red-800",
      actions: [
        { icon: Eye, text: "Buscar consultorios", available: true },
        { icon: Calendar, text: "Hacer reservas", available: true },
        { icon: Star, text: "Guardar favoritos", available: true },
        { icon: Plus, text: "Crear consultorio", available: true },
        { icon: Building2, text: "Gestionar consultorios", available: true },
        { icon: Shield, text: "Panel de administración", available: true },
        { icon: Users, text: "Gestionar usuarios", available: true },
      ]
    }
  };

  const currentRole = roleInfo[user.role as keyof typeof roleInfo];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Info className="h-5 w-5 mr-2" />
          Información de tu cuenta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Rol actual</p>
            <Badge className={currentRole.color}>
              {currentRole.title}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Usuario</p>
            <p className="font-medium">{user.nombre} {user.apellidos}</p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {currentRole.description}
        </p>

        <div className="space-y-2">
          <p className="text-sm font-medium">Acciones disponibles:</p>
          <div className="grid grid-cols-1 gap-2">
            {currentRole.actions.map((action, index) => (
              <div key={index} className="flex items-center space-x-2">
                <action.icon className={`h-4 w-4 ${action.available ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={`text-sm ${action.available ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {action.text}
                </span>
                {action.available && (
                  <Badge variant="secondary" className="text-xs">Disponible</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {user.role !== "owner" && user.role !== "admin" && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>¿Quieres crear consultorios?</strong> Contacta a un administrador 
              para solicitar el cambio de rol a &quot;Propietario&quot;.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
