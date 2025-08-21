import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield, Users, AlertTriangle } from "lucide-react";

export default function TerminosServicioPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Términos de Servicio</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Última actualización: 15 de enero de 2025
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Información general
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Bienvenido a MediRenta. Al acceder y utilizar nuestra plataforma, aceptas estar sujeto a estos términos de servicio.
              Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestro servicio.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Versión 2.1</Badge>
              <Badge variant="outline">Vigente desde 2025</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Definiciones */}
          <Card>
            <CardHeader>
              <CardTitle>1. Definiciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">&quot;Plataforma&quot;</h4>
                <p className="text-sm text-muted-foreground">
                  Se refiere al sitio web MediRenta.com y todas las aplicaciones móviles asociadas.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">&quot;Usuario&quot;</h4>
                <p className="text-sm text-muted-foreground">
                  Cualquier persona que acceda o utilice la plataforma, ya sea como propietario o profesional.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">&quot;Propietario&quot;</h4>
                <p className="text-sm text-muted-foreground">
                  Usuario que publica y renta espacios médicos a través de la plataforma.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">&quot;Profesional&quot;</h4>
                <p className="text-sm text-muted-foreground">
                  Usuario que reserva y utiliza espacios médicos a través de la plataforma.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Uso del servicio */}
          <Card>
            <CardHeader>
              <CardTitle>2. Uso del Servicio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Elegibilidad</h4>
                  <p className="text-sm text-muted-foreground">
                    Debes tener al menos 18 años y capacidad legal para celebrar contratos. Los profesionales deben tener 
                    credenciales válidas y estar autorizados para ejercer su profesión.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Cuenta de usuario</h4>
                  <p className="text-sm text-muted-foreground">
                    Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. 
                    Todas las actividades realizadas bajo tu cuenta son tu responsabilidad.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold">Uso prohibido</h4>
                  <p className="text-sm text-muted-foreground">
                    No puedes usar la plataforma para actividades ilegales, fraudulentas o que violen derechos de terceros.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reservas y pagos */}
          <Card>
            <CardHeader>
              <CardTitle>3. Reservas y Pagos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Proceso de reserva</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Las reservas se realizan a través de la plataforma y están sujetas a disponibilidad. 
                  El pago se procesa al momento de la confirmación.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Comisiones</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Aplicamos una comisión del 10% para propietarios y del 5% para profesionales sobre el monto total de la reserva.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Cancelaciones</h4>
                <p className="text-sm text-muted-foreground">
                  Las cancelaciones están sujetas a las políticas específicas de cada propietario. 
                  Los reembolsos se procesan según los términos acordados.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Responsabilidades */}
          <Card>
            <CardHeader>
              <CardTitle>4. Responsabilidades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Responsabilidades del propietario</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Mantener el espacio en condiciones adecuadas y seguras</li>
                  <li>• Cumplir con todas las regulaciones sanitarias aplicables</li>
                  <li>• Proporcionar información precisa sobre el espacio</li>
                  <li>• Respetar las reservas confirmadas</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Responsabilidades del profesional</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Utilizar el espacio de manera responsable</li>
                  <li>• Cumplir con los horarios acordados</li>
                  <li>• Mantener la confidencialidad de los pacientes</li>
                  <li>• Respetar las instalaciones y equipamiento</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Seguridad y privacidad */}
          <Card>
            <CardHeader>
              <CardTitle>5. Seguridad y Privacidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Protección de datos</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Protegemos tu información personal según nuestra Política de Privacidad. 
                  Utilizamos encriptación SSL y cumplimos con estándares de seguridad internacionales.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Seguro incluido</h4>
                <p className="text-sm text-muted-foreground">
                  Ofrecemos seguro de responsabilidad civil para cubrir daños durante el uso del espacio. 
                  Los términos específicos están disponibles en tu cuenta.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Limitaciones */}
          <Card>
            <CardHeader>
              <CardTitle>6. Limitaciones de Responsabilidad</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                MediRenta actúa como intermediario entre propietarios y profesionales. No somos responsables por:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• La calidad o condición de los espacios rentados</li>
                <li>• Disputas entre propietarios y profesionales</li>
                <li>• Daños personales o materiales durante el uso</li>
                <li>• Incumplimiento de regulaciones por parte de los usuarios</li>
              </ul>
            </CardContent>
          </Card>

          {/* Modificaciones */}
          <Card>
            <CardHeader>
              <CardTitle>7. Modificaciones de los Términos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                Las modificaciones entrarán en vigor inmediatamente después de su publicación.
              </p>
              <p className="text-sm text-muted-foreground">
                Te notificaremos sobre cambios importantes por email o a través de la plataforma.
              </p>
            </CardContent>
          </Card>

          {/* Terminación */}
          <Card>
            <CardHeader>
              <CardTitle>8. Terminación</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Podemos suspender o terminar tu cuenta en cualquier momento por violación de estos términos, 
                actividades fraudulentas o por cualquier otra razón a nuestra discreción.
              </p>
              <p className="text-sm text-muted-foreground">
                Puedes cancelar tu cuenta en cualquier momento desde la configuración de tu perfil.
              </p>
            </CardContent>
          </Card>

          {/* Ley aplicable */}
          <Card>
            <CardHeader>
              <CardTitle>9. Ley Aplicable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Estos términos se rigen por las leyes del país donde opera MediRenta. 
                Cualquier disputa será resuelta en los tribunales competentes de dicha jurisdicción.
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
                Si tienes preguntas sobre estos términos, contáctanos:
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Email: legal@medirenta.com</p>
                <p>Teléfono: +1 (555) 123-4567</p>
                <p>Dirección: [Dirección de la empresa]</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Al continuar usando MediRenta, confirmas que has leído, entendido y aceptado estos términos de servicio.
          </p>
        </div>
      </div>
    </div>
  );
}
