import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, HelpCircle, MessageCircle, Phone, Mail, BookOpen, Video, FileText } from "lucide-react";

export default function CentroAyudaPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Centro de Ayuda</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Encuentra respuestas rápidas a tus preguntas y obtén el soporte que necesitas
          </p>
        </div>

        {/* Buscador */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar en el centro de ayuda..."
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categorías principales */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <HelpCircle className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Primeros pasos</CardTitle>
              <CardDescription>
                Guías para comenzar a usar la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Crear una cuenta</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Completar tu perfil</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Verificar tu identidad</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Reservas</CardTitle>
              <CardDescription>
                Todo sobre reservas y pagos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Hacer una reserva</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Cancelar reserva</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Métodos de pago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Video className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Publicar espacios</CardTitle>
              <CardDescription>
                Guías para propietarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Registrar consultorio</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Gestionar disponibilidad</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Recibir pagos</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Comunicación</CardTitle>
              <CardDescription>
                Contacto entre usuarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Mensajes privados</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Notificaciones</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Reseñas y calificaciones</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <HelpCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Problemas técnicos</CardTitle>
              <CardDescription>
                Solución de errores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Error de inicio de sesión</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Problemas de pago</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Errores de la aplicación</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Políticas</CardTitle>
              <CardDescription>
                Términos y condiciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Términos de servicio</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Política de privacidad</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Política de cancelación</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Artículos populares */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Artículos populares</CardTitle>
            <CardDescription>
              Las preguntas más frecuentes de nuestros usuarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div>
                  <h4 className="font-semibold">¿Cómo cancelo una reserva?</h4>
                  <p className="text-sm text-muted-foreground">Aprende el proceso de cancelación y políticas de reembolso</p>
                </div>
                <Badge variant="secondary">Popular</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div>
                  <h4 className="font-semibold">¿Cuáles son las comisiones?</h4>
                  <p className="text-sm text-muted-foreground">Información detallada sobre tarifas y comisiones</p>
                </div>
                <Badge variant="secondary">Popular</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div>
                  <h4 className="font-semibold">¿Cómo funciona el seguro?</h4>
                  <p className="text-sm text-muted-foreground">Cobertura y protección para propietarios y profesionales</p>
                </div>
                <Badge variant="secondary">Popular</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacto directo */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>¿No encuentras lo que buscas?</CardTitle>
            <CardDescription>
              Nuestro equipo de soporte está aquí para ayudarte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Chat en vivo</h3>
                <p className="text-sm text-muted-foreground mb-4">Respuesta inmediata</p>
                <Button variant="outline" size="sm">Iniciar chat</Button>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-sm text-muted-foreground mb-4">Respuesta en 24h</p>
                <Button variant="outline" size="sm">Enviar email</Button>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Teléfono</h3>
                <p className="text-sm text-muted-foreground mb-4">Lun-Vie 9AM-6PM</p>
                <Button variant="outline" size="sm">Llamar</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            ¿Tienes una sugerencia para mejorar el centro de ayuda? 
            <a href="/contacto" className="text-primary hover:underline ml-1">Déjanos saber</a>
          </p>
        </div>
      </div>
    </div>
  );
}
