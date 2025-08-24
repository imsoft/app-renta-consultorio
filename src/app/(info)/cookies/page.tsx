import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cookie, Shield, Settings, Eye, Clock, Database, Globe } from "lucide-react";

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Política de Cookies</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Última actualización: 15 de enero de 2025
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" />
              ¿Qué son las cookies?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio web. 
              Nos ayudan a mejorar tu experiencia, recordar tus preferencias y analizar cómo utilizas la plataforma.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Transparente</Badge>
              <Badge variant="outline">Control total</Badge>
              <Badge variant="outline">Sin seguimiento invasivo</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Tipos de cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Cookies que Utilizamos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold">Cookies Esenciales</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Necesarias para el funcionamiento básico del sitio web. No se pueden desactivar.
                  </p>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>• Inicio de sesión</span>
                      <Badge variant="secondary" className="text-xs">Siempre activo</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>• Carrito de compras</span>
                      <Badge variant="secondary" className="text-xs">Siempre activo</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>• Preferencias de idioma</span>
                      <Badge variant="secondary" className="text-xs">Siempre activo</Badge>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Cookies de Funcionalidad</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Mejoran la funcionalidad y personalización de tu experiencia.
                  </p>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>• Preferencias de búsqueda</span>
                      <Badge variant="outline" className="text-xs">Configurable</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>• Historial de consultorios</span>
                      <Badge variant="outline" className="text-xs">Configurable</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>• Configuración de notificaciones</span>
                      <Badge variant="outline" className="text-xs">Configurable</Badge>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold">Cookies de Rendimiento</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Nos ayudan a entender cómo utilizas el sitio para mejorarlo.
                  </p>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>• Análisis de páginas visitadas</span>
                      <Badge variant="outline" className="text-xs">Configurable</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>• Tiempo de permanencia</span>
                      <Badge variant="outline" className="text-xs">Configurable</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>• Errores y problemas técnicos</span>
                      <Badge variant="outline" className="text-xs">Configurable</Badge>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold">Cookies de Marketing</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Utilizadas para mostrar contenido relevante y publicidad personalizada.
                  </p>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>• Recomendaciones personalizadas</span>
                      <Badge variant="outline" className="text-xs">Configurable</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>• Publicidad dirigida</span>
                      <Badge variant="outline" className="text-xs">Configurable</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>• Seguimiento de campañas</span>
                      <Badge variant="outline" className="text-xs">Configurable</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies específicas */}
          <Card>
            <CardHeader>
              <CardTitle>Cookies Específicas que Utilizamos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Nombre de la Cookie</th>
                      <th className="text-left py-2">Propósito</th>
                      <th className="text-left py-2">Duración</th>
                      <th className="text-left py-2">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    <tr className="border-b">
                      <td className="py-2 font-mono text-xs">session_id</td>
                      <td className="py-2">Mantener tu sesión activa</td>
                      <td className="py-2">Hasta cerrar sesión</td>
                      <td className="py-2"><Badge variant="secondary" className="text-xs">Esencial</Badge></td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-mono text-xs">user_preferences</td>
                      <td className="py-2">Recordar tus preferencias</td>
                      <td className="py-2">1 año</td>
                      <td className="py-2"><Badge variant="outline" className="text-xs">Funcionalidad</Badge></td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-mono text-xs">analytics_id</td>
                      <td className="py-2">Análisis de uso del sitio</td>
                      <td className="py-2">2 años</td>
                      <td className="py-2"><Badge variant="outline" className="text-xs">Rendimiento</Badge></td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-mono text-xs">search_history</td>
                      <td className="py-2">Historial de búsquedas</td>
                      <td className="py-2">6 meses</td>
                      <td className="py-2"><Badge variant="outline" className="text-xs">Funcionalidad</Badge></td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-mono text-xs">ad_preferences</td>
                      <td className="py-2">Preferencias de publicidad</td>
                      <td className="py-2">1 año</td>
                      <td className="py-2"><Badge variant="outline" className="text-xs">Marketing</Badge></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Control de cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Control de Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Configuración del navegador</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Puedes configurar tu navegador para rechazar todas las cookies o para que te avise cuando se envíe una cookie.
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Chrome: Configuración → Privacidad y seguridad</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Firefox: Opciones → Privacidad y seguridad</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Safari: Preferencias → Privacidad</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Panel de control</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Utiliza nuestro panel de control para gestionar tus preferencias de cookies de manera granular.
                  </p>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Gestionar preferencias
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies de terceros */}
          <Card>
            <CardHeader>
              <CardTitle>Cookies de Terceros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Algunos servicios de terceros pueden establecer cookies en tu dispositivo:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Google Analytics</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Para analizar el tráfico del sitio web y mejorar nuestros servicios.
                  </p>
                  <Badge variant="outline" className="text-xs">Configurable</Badge>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Stripe</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Para procesar pagos de manera segura.
                  </p>
                  <Badge variant="secondary" className="text-xs">Necesario</Badge>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Facebook Pixel</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Para medir la efectividad de nuestras campañas publicitarias.
                  </p>
                  <Badge variant="outline" className="text-xs">Configurable</Badge>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Intercom</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Para proporcionar soporte al cliente en tiempo real.
                  </p>
                  <Badge variant="outline" className="text-xs">Configurable</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impacto de desactivar cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Impacto de Desactivar Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-red-600">Si desactivas todas las cookies:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• No podrás iniciar sesión</li>
                    <li>• No se recordarán tus preferencias</li>
                    <li>• Algunas funciones no estarán disponibles</li>
                    <li>• La experiencia será menos personalizada</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-green-600">Recomendación:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Mantén las cookies esenciales activas</li>
                    <li>• Configura las demás según tus preferencias</li>
                    <li>• Revisa periódicamente tu configuración</li>
                    <li>• Usa nuestro panel de control</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actualizaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Actualizaciones de esta Política</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Podemos actualizar esta política de cookies ocasionalmente para reflejar cambios en nuestras prácticas 
                o por otros motivos operativos, legales o regulatorios.
              </p>
              <p className="text-sm text-muted-foreground">
                Te notificaremos sobre cambios importantes por email o a través de la plataforma. 
                Te recomendamos revisar esta política periódicamente.
              </p>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card>
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Si tienes preguntas sobre nuestra política de cookies, contáctanos:
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Email: privacy@wellpoint.com</p>
                <p>Teléfono: +1 (555) 123-4567</p>
                <p>Asunto: Consulta sobre cookies</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" className="mr-4">
            <Settings className="h-4 w-4 mr-2" />
            Gestionar cookies
          </Button>
          <Button variant="outline">
            <Database className="h-4 w-4 mr-2" />
            Ver todas las cookies
          </Button>
        </div>
      </div>
    </div>
  );
}
