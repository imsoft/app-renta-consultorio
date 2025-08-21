import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, DollarSign, Calendar, Shield, Users } from "lucide-react";

export default function PublicarEspacioPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Publica tu Espacio Médico</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Conecta con profesionales de la salud y genera ingresos adicionales rentando tu consultorio
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                ¿Por qué publicar con nosotros?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Ingresos garantizados</h4>
                  <p className="text-sm text-muted-foreground">Recibe pagos seguros y puntuales por cada reserva</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Amplia red de profesionales</h4>
                  <p className="text-sm text-muted-foreground">Conecta con médicos, psicólogos, fisioterapeutas y más</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Protección completa</h4>
                  <p className="text-sm text-muted-foreground">Seguro de responsabilidad civil incluido</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Gestión flexible</h4>
                  <p className="text-sm text-muted-foreground">Controla tu disponibilidad y horarios</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Requisitos básicos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Badge variant="secondary">Requisito</Badge>
                <p className="text-sm">Espacio médico habilitado y certificado</p>
              </div>
              <div className="space-y-2">
                <Badge variant="secondary">Requisito</Badge>
                <p className="text-sm">Documentación legal al día</p>
              </div>
              <div className="space-y-2">
                <Badge variant="secondary">Requisito</Badge>
                <p className="text-sm">Equipamiento básico médico</p>
              </div>
              <div className="space-y-2">
                <Badge variant="secondary">Requisito</Badge>
                <p className="text-sm">Acceso a internet y sistema de reservas</p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">Opcional</Badge>
                <p className="text-sm">Estacionamiento disponible</p>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">Opcional</Badge>
                <p className="text-sm">Accesibilidad para personas con discapacidad</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Proceso de publicación</CardTitle>
            <CardDescription>
              Sigue estos pasos para comenzar a rentar tu espacio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Registra tu espacio</h3>
                <p className="text-sm text-muted-foreground">
                  Completa el formulario con los detalles de tu consultorio
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Verificación</h3>
                <p className="text-sm text-muted-foreground">
                  Nuestro equipo revisa y valida tu información
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">¡Listo!</h3>
                <p className="text-sm text-muted-foreground">
                  Tu espacio estará disponible para reservas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button size="lg" className="px-8">
            Comenzar a publicar
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            ¿Tienes preguntas? <a href="/contacto" className="text-primary hover:underline">Contáctanos</a>
          </p>
        </div>
      </div>
    </div>
  );
}
