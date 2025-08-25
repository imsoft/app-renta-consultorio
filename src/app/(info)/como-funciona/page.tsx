"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { 
  Search, 
  Calendar, 
  Star, 
  Users, 
  Shield, 
  Clock,
  CheckCircle,
  ArrowRight,
  FileText,
  CreditCard,
  MessageSquare,
  Phone,
  Mail,
  Building,
  UserCheck,
  Settings,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Datos simulados de estadísticas
const estadisticas = [
  { numero: "500+", descripcion: "Profesionales registrados" },
  { numero: "150+", descripcion: "Consultorios disponibles" },
  { numero: "1000+", descripcion: "Reservas exitosas" },
  { numero: "4.8", descripcion: "Calificación promedio" }
];

// Pasos para profesionales
const pasosProfesionales = [
  {
    paso: 1,
    titulo: "Regístrate y verifica tu perfil",
    descripcion: "Crea tu cuenta profesional y sube tu documentación médica para verificación.",
    icono: UserCheck,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    paso: 2,
    titulo: "Busca consultorios disponibles",
    descripcion: "Filtra por ubicación, especialidad, precio y horarios que se adapten a tus necesidades.",
    icono: Search,
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    paso: 3,
    titulo: "Reserva tu espacio",
    descripcion: "Selecciona fecha y hora, revisa los detalles y confirma tu reserva de forma segura.",
    icono: Calendar,
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    paso: 4,
    titulo: "Atiende a tus pacientes",
    descripcion: "Llega al consultorio en la fecha acordada y comienza a atender a tus pacientes.",
    icono: Users,
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  }
];

// Pasos para propietarios
const pasosPropietarios = [
  {
    paso: 1,
    titulo: "Registra tu consultorio",
    descripcion: "Completa el formulario con los detalles de tu espacio médico y sube fotos.",
    icono: Building,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  },
  {
    paso: 2,
    titulo: "Configura horarios y precios",
    descripcion: "Define tu disponibilidad, tarifas por hora y políticas de cancelación.",
    icono: Settings,
    color: "text-pink-600",
    bgColor: "bg-pink-50"
  },
  {
    paso: 3,
    titulo: "Recibe solicitudes",
    descripcion: "Los profesionales te contactarán para reservar tu espacio en las fechas disponibles.",
    icono: MessageSquare,
    color: "text-teal-600",
    bgColor: "bg-teal-50"
  },
  {
    paso: 4,
    titulo: "Gana ingresos",
    descripcion: "Recibe pagos seguros por cada reserva y maximiza el uso de tu consultorio.",
    icono: BarChart3,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50"
  }
];

// Preguntas frecuentes
const faqs = [
  {
    pregunta: "¿Cómo funciona el proceso de verificación?",
    respuesta: "Verificamos la documentación médica de todos los profesionales antes de permitir reservas. Esto incluye cédula profesional, especialidad y antecedentes."
  },
  {
    pregunta: "¿Qué pasa si necesito cancelar una reserva?",
    respuesta: "Puedes cancelar hasta 24 horas antes sin costo. Las cancelaciones tardías pueden tener cargos según las políticas del consultorio."
  },
  {
    pregunta: "¿Cómo se manejan los pagos?",
    respuesta: "Los pagos se procesan de forma segura a través de nuestra plataforma. El propietario recibe el pago después de confirmar la visita."
  },
  {
    pregunta: "¿Puedo rentar mi consultorio por períodos largos?",
    respuesta: "Sí, ofrecemos opciones de renta por hora, día, semana o mes según tus necesidades y la disponibilidad del consultorio."
  },
  {
    pregunta: "¿Qué equipamiento incluyen los consultorios?",
    respuesta: "Cada consultorio tiene equipamiento básico. Los detalles específicos se muestran en el perfil de cada espacio."
  },
  {
    pregunta: "¿Hay soporte disponible si tengo problemas?",
    respuesta: "Sí, nuestro equipo de soporte está disponible 24/7 para ayudarte con cualquier consulta o problema."
  }
];

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-accent/20 to-primary/10 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              ¿Cómo funciona WellPoint?
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Conectamos profesionales de la salud con espacios médicos de calidad. 
              Un proceso simple y seguro para ambos lados.
            </p>
            
            {/* Estadísticas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {estadisticas.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                    {stat.numero}
                  </div>
                  <div className="text-sm sm:text-base text-muted-foreground">
                    {stat.descripcion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Para Profesionales */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Para Profesionales de la Salud
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Encuentra y reserva el consultorio perfecto para tu práctica médica en solo 4 pasos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pasosProfesionales.map((paso) => (
              <Card key={paso.paso} className="relative overflow-hidden">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 ${paso.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <paso.icono className={`h-8 w-8 ${paso.color}`} />
                  </div>
                  <Badge variant="outline" className="mb-2">Paso {paso.paso}</Badge>
                  <CardTitle className="text-lg font-semibold">{paso.titulo}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground text-sm">
                    {paso.descripcion}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/consultorios">
                Buscar consultorios
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Para Propietarios */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Para Propietarios de Consultorios
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Maximiza el uso de tu espacio médico y genera ingresos adicionales
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pasosPropietarios.map((paso) => (
              <Card key={paso.paso} className="relative overflow-hidden">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 ${paso.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <paso.icono className={`h-8 w-8 ${paso.color}`} />
                  </div>
                  <Badge variant="outline" className="mb-2">Paso {paso.paso}</Badge>
                  <CardTitle className="text-lg font-semibold">{paso.titulo}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground text-sm">
                    {paso.descripcion}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link href="/registrar-consultorio">
                Registrar mi consultorio
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              ¿Por qué elegir WellPoint?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              La plataforma más confiable y segura para rentar espacios médicos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Verificación de Profesionales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Todos los profesionales son verificados antes de poder hacer reservas, 
                  garantizando la seguridad y confiabilidad.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Pagos Seguros</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Procesamos todos los pagos de forma segura y transparente, 
                  con protección para ambas partes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Disponibilidad 24/7</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Reserva consultorios en cualquier momento del día, 
                  con confirmación inmediata y soporte disponible.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Documentación Digital</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Gestiona contratos, facturas y documentación de forma digital, 
                  todo en un solo lugar.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Comunicación Directa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comunícate directamente con propietarios o profesionales 
                  a través de nuestra plataforma integrada.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Sistema de Calificaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Califica y reseña consultorios y profesionales para 
                  ayudar a otros usuarios a tomar decisiones informadas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="text-lg text-muted-foreground">
              Resolvemos las dudas más comunes sobre nuestro servicio
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-2" />
                    {faq.pregunta}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {faq.respuesta}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Únete a nuestra comunidad y descubre cómo WellPoint puede ayudarte
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="secondary" className="bg-background text-primary hover:bg-background/90">
              <Link href="/consultorios">
                Soy Profesional de la Salud
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-background text-background bg-background/10 hover:bg-background hover:text-primary">
              <Link href="/registrar-consultorio">
                Tengo un Consultorio
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            ¿Necesitas ayuda?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Nuestro equipo está aquí para ayudarte con cualquier consulta
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Llámanos</h3>
              <p className="text-muted-foreground text-sm">+52 55 1234 5678</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Escríbenos</h3>
                              <p className="text-muted-foreground text-sm">soporte@wellpoint.com</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Chat en vivo</h3>
              <p className="text-muted-foreground text-sm">Disponible 24/7</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
