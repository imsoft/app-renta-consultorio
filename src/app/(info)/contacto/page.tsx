"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Clock, 
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Send
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Información de contacto
const contactInfo = {
  email: "contacto@medirenta.com",
  whatsapp: "+52 55 1234 5678",
  whatsappLink: "https://wa.me/525512345678",
  horario: "Lunes a Viernes: 9:00 AM - 6:00 PM",
  direccion: "Ciudad de México, México"
};

// Métodos de contacto
const metodosContacto = [
  {
    titulo: "WhatsApp",
    descripcion: "Responde en minutos",
    icono: MessageSquare,
    color: "text-green-600",
    bgColor: "bg-green-50",
    accion: "Chatear ahora",
    link: contactInfo.whatsappLink,
    esExterno: true
  },
  {
    titulo: "Correo Electrónico",
    descripcion: "Respuesta en 24 horas",
    icono: Mail,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    accion: "Enviar email",
    link: `mailto:${contactInfo.email}`,
    esExterno: true
  },
  {
    titulo: "Teléfono",
    descripcion: "Atención directa",
    icono: Phone,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    accion: "Llamar ahora",
    link: `tel:${contactInfo.whatsapp}`,
    esExterno: true
  }
];

// Preguntas frecuentes de contacto
const faqsContacto = [
  {
    pregunta: "¿Cuál es el horario de atención?",
    respuesta: "Nuestro equipo está disponible de lunes a viernes de 9:00 AM a 6:00 PM. Para emergencias fuera de horario, puedes contactarnos por WhatsApp."
  },
  {
    pregunta: "¿Qué información necesito para registrarme?",
    respuesta: "Para profesionales: cédula profesional, especialidad y documentación médica. Para propietarios: documentos del consultorio y fotos del espacio."
  },
  {
    pregunta: "¿Cómo funciona el proceso de verificación?",
    respuesta: "Revisamos toda la documentación en 24-48 horas. Una vez aprobada, podrás comenzar a usar la plataforma inmediatamente."
  },
  {
    pregunta: "¿Hay algún costo por registrarme?",
    respuesta: "El registro es completamente gratuito. Solo pagas cuando haces una reserva o recibes una reserva en tu consultorio."
  }
];

// Equipo de soporte
const equipoSoporte = [
  {
    nombre: "Ana García",
    cargo: "Soporte Técnico",
    especialidad: "Registro y verificación",
    icono: Users
  },
  {
    nombre: "Carlos Mendoza",
    cargo: "Atención al Cliente",
    especialidad: "Reservas y pagos",
    icono: Star
  },
  {
    nombre: "María López",
    cargo: "Coordinadora",
    especialidad: "Consultas generales",
    icono: CheckCircle
  }
];

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-accent/20 to-primary/10 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Contáctanos
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Estamos aquí para ayudarte. Elige el método que prefieras y te responderemos lo antes posible.
            </p>
            
            {/* Información principal de contacto */}
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="bg-background rounded-lg p-6 shadow-sm border border-border">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">WhatsApp</h3>
                <p className="text-2xl font-bold text-primary text-center mb-4">
                  {contactInfo.whatsapp}
                </p>
                <p className="text-muted-foreground text-center mb-6">
                  Responde en minutos • Disponible 24/7
                </p>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Link href={contactInfo.whatsappLink} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chatear en WhatsApp
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="bg-background rounded-lg p-6 shadow-sm border border-border">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                    <Mail className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">Correo Electrónico</h3>
                <p className="text-lg font-semibold text-primary text-center mb-4 break-all">
                  {contactInfo.email}
                </p>
                <p className="text-muted-foreground text-center mb-6">
                  Respuesta en 24 horas • Soporte completo
                </p>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href={`mailto:${contactInfo.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Email
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Métodos de Contacto */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              ¿Cómo prefieres contactarnos?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tenemos múltiples canales para atenderte de la mejor manera
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {metodosContacto.map((metodo, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 ${metodo.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <metodo.icono className={`h-8 w-8 ${metodo.color}`} />
                  </div>
                  <CardTitle className="text-xl">{metodo.titulo}</CardTitle>
                  <p className="text-muted-foreground">{metodo.descripcion}</p>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" variant="outline">
                    <Link href={metodo.link} target={metodo.esExterno ? "_blank" : "_self"} rel={metodo.esExterno ? "noopener noreferrer" : ""}>
                      {metodo.accion}
                      {metodo.esExterno && <ExternalLink className="ml-2 h-4 w-4" />}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Información Adicional */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center mb-4">
                  <Clock className="h-6 w-6 text-primary mr-2" />
                  <CardTitle>Horario de Atención</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-primary mb-2">
                  {contactInfo.horario}
                </p>
                <p className="text-muted-foreground">
                  Para consultas urgentes fuera de horario, puedes contactarnos por WhatsApp y te responderemos lo antes posible.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center mb-4">
                  <MapPin className="h-6 w-6 text-primary mr-2" />
                  <CardTitle>Ubicación</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-primary mb-2">
                  {contactInfo.direccion}
                </p>
                <p className="text-muted-foreground">
                  Nuestro equipo trabaja de forma remota para brindarte el mejor servicio sin importar tu ubicación.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Equipo de Soporte */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Nuestro Equipo de Soporte
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Especialistas dedicados a resolver tus dudas y ayudarte con cualquier consulta
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {equipoSoporte.map((miembro, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <miembro.icono className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{miembro.nombre}</CardTitle>
                  <Badge variant="secondary" className="mx-auto">
                    {miembro.cargo}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Especialista en {miembro.especialidad}
                  </p>
                </CardContent>
              </Card>
            ))}
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
            {faqsContacto.map((faq, index) => (
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
            Si tienes alguna duda, no dudes en contactarnos. Estamos aquí para ayudarte.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="secondary" className="bg-background text-primary hover:bg-background/90">
              <Link href={contactInfo.whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contactar por WhatsApp
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-background text-background bg-background/10 hover:bg-background hover:text-primary">
              <Link href={`mailto:${contactInfo.email}`}>
                <Mail className="mr-2 h-4 w-4" />
                Enviar Email
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
