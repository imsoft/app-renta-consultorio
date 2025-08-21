import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Users, Database, Globe, Mail, Phone } from "lucide-react";

export default function PoliticaPrivacidadPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Política de Privacidad</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Última actualización: 15 de enero de 2025
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Compromiso con tu privacidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              En MediRenta, tu privacidad es fundamental. Esta política describe cómo recopilamos, 
              utilizamos y protegemos tu información personal cuando utilizas nuestra plataforma.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">GDPR Compliant</Badge>
              <Badge variant="outline">Encriptación SSL</Badge>
              <Badge variant="outline">Sin venta de datos</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Información que recopilamos */}
          <Card>
            <CardHeader>
              <CardTitle>1. Información que Recopilamos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Información personal
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• Nombre completo y apellidos</li>
                  <li>• Dirección de correo electrónico</li>
                  <li>• Número de teléfono</li>
                  <li>• Información de identificación profesional</li>
                  <li>• Dirección física (para propietarios)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4 text-green-600" />
                  Información de uso
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• Historial de reservas y transacciones</li>
                  <li>• Preferencias de búsqueda</li>
                  <li>• Interacciones con la plataforma</li>
                  <li>• Información del dispositivo y navegador</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-purple-600" />
                  Información técnica
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• Dirección IP</li>
                  <li>• Cookies y tecnologías similares</li>
                  <li>• Datos de localización (con tu consentimiento)</li>
                  <li>• Información de rendimiento de la aplicación</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Cómo utilizamos la información */}
          <Card>
            <CardHeader>
              <CardTitle>2. Cómo Utilizamos tu Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Para proporcionar servicios</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Procesar reservas y pagos</li>
                    <li>• Facilitar comunicación entre usuarios</li>
                    <li>• Gestionar tu cuenta y perfil</li>
                    <li>• Proporcionar soporte al cliente</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Para mejorar la plataforma</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Analizar patrones de uso</li>
                    <li>• Desarrollar nuevas funcionalidades</li>
                    <li>• Optimizar el rendimiento</li>
                    <li>• Personalizar la experiencia</li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Para seguridad y cumplimiento</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Verificar identidades y credenciales</li>
                  <li>• Prevenir fraudes y abusos</li>
                  <li>• Cumplir con obligaciones legales</li>
                  <li>• Resolver disputas</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Compartir información */}
          <Card>
            <CardHeader>
              <CardTitle>3. Cuándo Compartimos tu Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Con otros usuarios</h4>
                  <p className="text-sm text-muted-foreground">
                    Compartimos información limitada entre propietarios y profesionales para facilitar las reservas 
                    (nombre, información de contacto, detalles de la reserva).
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Con proveedores de servicios</h4>
                  <p className="text-sm text-muted-foreground">
                    Trabajamos con terceros confiables para procesamiento de pagos, análisis y soporte técnico. 
                    Estos proveedores están obligados a proteger tu información.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Por obligación legal</h4>
                  <p className="text-sm text-muted-foreground">
                    Podemos compartir información cuando sea requerido por ley, orden judicial o para proteger 
                    nuestros derechos y la seguridad de otros usuarios.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Protección de datos */}
          <Card>
            <CardHeader>
              <CardTitle>4. Protección de tus Datos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Encriptación</h4>
                  <p className="text-sm text-muted-foreground">
                    Utilizamos encriptación SSL de 256 bits para proteger todos los datos en tránsito y en reposo.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Acceso limitado</h4>
                  <p className="text-sm text-muted-foreground">
                    Solo el personal autorizado tiene acceso a tu información personal, y solo cuando es necesario.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Monitoreo continuo</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitoreamos constantemente nuestros sistemas para detectar y prevenir amenazas de seguridad.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Copias de seguridad</h4>
                  <p className="text-sm text-muted-foreground">
                    Mantenemos copias de seguridad seguras de tu información para proteger contra pérdida de datos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tus derechos */}
          <Card>
            <CardHeader>
              <CardTitle>5. Tus Derechos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Acceso y corrección</h4>
                  <p className="text-sm text-muted-foreground">
                    Puedes acceder, actualizar o corregir tu información personal en cualquier momento desde tu perfil.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Portabilidad</h4>
                  <p className="text-sm text-muted-foreground">
                    Puedes solicitar una copia de tus datos personales en un formato estructurado y legible.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Eliminación</h4>
                  <p className="text-sm text-muted-foreground">
                    Puedes solicitar la eliminación de tu cuenta y datos personales, sujeto a ciertas limitaciones legales.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Oposición</h4>
                  <p className="text-sm text-muted-foreground">
                    Puedes oponerte al procesamiento de tus datos para ciertos fines, como marketing directo.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>6. Cookies y Tecnologías Similares</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia, analizar el uso de la plataforma 
                y personalizar el contenido.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Cookies esenciales</h4>
                  <p className="text-xs text-muted-foreground">
                    Necesarias para el funcionamiento básico de la plataforma
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Cookies de rendimiento</h4>
                  <p className="text-xs text-muted-foreground">
                    Nos ayudan a entender cómo utilizas la plataforma
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Cookies de funcionalidad</h4>
                  <p className="text-xs text-muted-foreground">
                    Mejoran la funcionalidad y personalización
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Retención de datos */}
          <Card>
            <CardHeader>
              <CardTitle>7. Retención de Datos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Conservamos tu información personal solo durante el tiempo necesario para los fines descritos en esta política:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• <strong>Cuenta activa:</strong> Mientras tu cuenta esté activa</li>
                <li>• <strong>Reservas:</strong> 7 años para fines fiscales y legales</li>
                <li>• <strong>Datos de pago:</strong> Según requerimientos de cumplimiento</li>
                <li>• <strong>Logs de seguridad:</strong> 2 años para auditoría</li>
              </ul>
            </CardContent>
          </Card>

          {/* Menores de edad */}
          <Card>
            <CardHeader>
              <CardTitle>8. Menores de Edad</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente información 
                personal de menores de edad. Si eres padre o tutor y crees que tu hijo nos ha proporcionado información, 
                contáctanos inmediatamente.
              </p>
            </CardContent>
          </Card>

          {/* Cambios en la política */}
          <Card>
            <CardHeader>
              <CardTitle>9. Cambios en esta Política</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos sobre cambios importantes 
                por email o a través de la plataforma.
              </p>
              <p className="text-sm text-muted-foreground">
                Te recomendamos revisar esta política periódicamente para mantenerte informado sobre cómo protegemos tu información.
              </p>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card>
            <CardHeader>
              <CardTitle>10. Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Si tienes preguntas sobre esta política de privacidad o sobre el tratamiento de tus datos personales, contáctanos:
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Email: privacy@medirenta.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>Teléfono: +1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Oficial de Privacidad: privacy@medirenta.com</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Al usar MediRenta, aceptas las prácticas descritas en esta política de privacidad.
          </p>
        </div>
      </div>
    </div>
  );
}
