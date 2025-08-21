"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bug, MessageCircle, CreditCard, Building2, Users, Shield, Send, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function ReportarProblemaPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    tipo: "",
    asunto: "",
    descripcion: "",
    urgencia: "",
    adjuntarArchivos: false,
    notificarActualizaciones: true
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el reporte
    console.log("Reporte enviado:", formData);
    setIsSubmitted(true);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-4">¡Reporte enviado!</h2>
              <p className="text-muted-foreground mb-6">
                Hemos recibido tu reporte y nos pondremos en contacto contigo pronto. 
                Te enviaremos actualizaciones por email.
              </p>
              <div className="space-y-4">
                <Badge variant="secondary">Ticket: #{Math.random().toString(36).substr(2, 9).toUpperCase()}</Badge>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => setIsSubmitted(false)}>
                    Reportar otro problema
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/centro-ayuda">Ir al centro de ayuda</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Reportar un Problema</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ayúdanos a mejorar reportando cualquier problema que encuentres. 
            Tu feedback es valioso para nosotros.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Formulario de reporte
                </CardTitle>
                <CardDescription>
                  Completa todos los campos para que podamos ayudarte mejor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nombre">Nombre completo *</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => handleInputChange("nombre", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tipo">Tipo de problema *</Label>
                      <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tecnico">Problema técnico</SelectItem>
                          <SelectItem value="pago">Problema de pago</SelectItem>
                          <SelectItem value="reserva">Problema con reserva</SelectItem>
                          <SelectItem value="cuenta">Problema de cuenta</SelectItem>
                          <SelectItem value="seguridad">Problema de seguridad</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="urgencia">Nivel de urgencia *</Label>
                      <Select value={formData.urgencia} onValueChange={(value) => handleInputChange("urgencia", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona la urgencia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baja">Baja - No urgente</SelectItem>
                          <SelectItem value="media">Media - Moderadamente urgente</SelectItem>
                          <SelectItem value="alta">Alta - Muy urgente</SelectItem>
                          <SelectItem value="critica">Crítica - Bloquea el uso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="asunto">Asunto *</Label>
                    <Input
                      id="asunto"
                      value={formData.asunto}
                      onChange={(e) => handleInputChange("asunto", e.target.value)}
                      placeholder="Describe brevemente el problema"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="descripcion">Descripción detallada *</Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => handleInputChange("descripcion", e.target.value)}
                      placeholder="Proporciona todos los detalles posibles sobre el problema..."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="adjuntarArchivos"
                        checked={formData.adjuntarArchivos}
                        onCheckedChange={(checked) => handleInputChange("adjuntarArchivos", checked as boolean)}
                      />
                      <Label htmlFor="adjuntarArchivos">
                        ¿Necesitas adjuntar archivos? (capturas de pantalla, documentos, etc.)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="notificarActualizaciones"
                        checked={formData.notificarActualizaciones}
                        onCheckedChange={(checked) => handleInputChange("notificarActualizaciones", checked as boolean)}
                      />
                      <Label htmlFor="notificarActualizaciones">
                        Recibir actualizaciones por email sobre el estado del reporte
                      </Label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar reporte
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Información lateral */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tipos de problemas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Bug className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Problema técnico</h4>
                    <p className="text-xs text-muted-foreground">Errores, fallos, problemas de rendimiento</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Problema de pago</h4>
                    <p className="text-xs text-muted-foreground">Transacciones, reembolsos, facturación</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Problema con reserva</h4>
                    <p className="text-xs text-muted-foreground">Cancelaciones, modificaciones, conflictos</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Problema de cuenta</h4>
                    <p className="text-xs text-muted-foreground">Acceso, verificación, configuración</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Problema de seguridad</h4>
                    <p className="text-xs text-muted-foreground">Privacidad, datos, acceso no autorizado</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tiempos de respuesta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Crítica</span>
                  <Badge variant="destructive">2-4 horas</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Alta</span>
                  <Badge variant="secondary">24 horas</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Media</span>
                  <Badge variant="outline">2-3 días</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Baja</span>
                  <Badge variant="outline">1 semana</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contacto alternativo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                  <span>Chat en vivo</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span>Emergencias: +1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Seguridad: security@medirenta.com</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
