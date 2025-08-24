"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Search, HelpCircle, CreditCard, Building2, Users, Shield } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Cuentas y perfiles
  {
    id: "1",
    question: "¿Cómo creo una cuenta en WellPoint?",
    answer: "Para crear una cuenta, ve a la página de registro y completa el formulario con tu información personal. Necesitarás verificar tu email y completar tu perfil profesional.",
    category: "Cuentas"
  },
  {
    id: "2",
    question: "¿Puedo tener múltiples perfiles?",
    answer: "Sí, puedes crear perfiles separados si eres tanto propietario como profesional de la salud. Cada perfil tendrá sus propias configuraciones y funcionalidades.",
    category: "Cuentas"
  },
  {
    id: "3",
    question: "¿Cómo verifico mi identidad profesional?",
    answer: "Para verificar tu identidad, necesitas subir tu cédula profesional, título universitario y otros documentos que certifiquen tu práctica médica.",
    category: "Cuentas"
  },

  // Reservas
  {
    id: "4",
    question: "¿Cómo hago una reserva?",
    answer: "Busca consultorios disponibles, selecciona el que te interese, elige fecha y horario, y completa el proceso de pago. Recibirás confirmación por email.",
    category: "Reservas"
  },
  {
    id: "5",
    question: "¿Puedo cancelar una reserva?",
    answer: "Sí, puedes cancelar hasta 24 horas antes de la reserva sin cargo. Las cancelaciones con menos tiempo pueden tener cargos según la política del propietario.",
    category: "Reservas"
  },
  {
    id: "6",
    question: "¿Qué pasa si el propietario cancela mi reserva?",
    answer: "Si el propietario cancela, recibirás un reembolso completo y podrás buscar otro consultorio disponible. Te notificaremos por email.",
    category: "Reservas"
  },

  // Pagos
  {
    id: "7",
    question: "¿Qué métodos de pago aceptan?",
    answer: "Aceptamos tarjetas de crédito/débito (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay y transferencias bancarias.",
    category: "Pagos"
  },
  {
    id: "8",
    question: "¿Cuáles son las comisiones?",
    answer: "La comisión es del 10% para propietarios y del 5% para profesionales. Estas tarifas se aplican sobre el monto total de la reserva.",
    category: "Pagos"
  },
  {
    id: "9",
    question: "¿Cuándo recibo mi pago como propietario?",
    answer: "Los pagos se procesan automáticamente 24 horas después de completada la reserva. El dinero se transfiere a tu cuenta bancaria registrada.",
    category: "Pagos"
  },

  // Publicar espacios
  {
    id: "10",
    question: "¿Qué necesito para publicar mi consultorio?",
    answer: "Necesitas documentación legal del espacio, equipamiento básico médico, acceso a internet y cumplir con las regulaciones sanitarias locales.",
    category: "Publicar"
  },
  {
    id: "11",
    question: "¿Cómo establezco mis precios?",
    answer: "Puedes establecer precios por hora, día o mes. Te recomendamos investigar precios del mercado en tu área para ser competitivo.",
    category: "Publicar"
  },
  {
    id: "12",
    question: "¿Puedo gestionar mi disponibilidad?",
    answer: "Sí, puedes establecer horarios disponibles, bloquear fechas específicas y actualizar tu calendario en tiempo real desde tu panel de control.",
    category: "Publicar"
  },

  // Seguridad
  {
    id: "13",
    question: "¿Mis datos están seguros?",
    answer: "Sí, utilizamos encriptación SSL de 256 bits y cumplimos con estándares PCI DSS para proteger toda la información personal y financiera.",
    category: "Seguridad"
  },
  {
    id: "14",
    question: "¿Hay seguro incluido?",
    answer: "Sí, ofrecemos seguro de responsabilidad civil para propietarios y profesionales. La cobertura incluye daños al consultorio y protección legal.",
    category: "Seguridad"
  },
  {
    id: "15",
    question: "¿Qué pasa si hay un problema durante la reserva?",
    answer: "Nuestro equipo de soporte está disponible 24/7 para resolver cualquier problema. También tenemos un sistema de disputas para casos complejos.",
    category: "Seguridad"
  }
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  const categories = ["Todos", "Cuentas", "Reservas", "Pagos", "Publicar", "Seguridad"];

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-3">Preguntas Frecuentes</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encuentra respuestas rápidas a las preguntas más comunes sobre WellPoint
          </p>
        </div>

        {/* Buscador */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar en las preguntas frecuentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        {/* Filtros por categoría */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-2 mb-8">
          {filteredFAQs.map((faq) => (
            <Card key={faq.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div
                  className="p-4"
                  onClick={() => toggleItem(faq.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-left text-sm">{faq.question}</h3>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {faq.category}
                      </Badge>
                    </div>
                    <div className="ml-3">
                      {openItems.includes(faq.id) ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
                {openItems.includes(faq.id) && (
                  <div className="px-4 pb-4 border-t bg-muted/30">
                    <p className="pt-3 text-muted-foreground leading-relaxed text-sm">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron resultados</h3>
              <p className="text-muted-foreground mb-4">
                Intenta con otros términos de búsqueda o contacta a nuestro equipo de soporte
              </p>
              <Button asChild>
                <a href="/contacto">Contactar soporte</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Categorías de ayuda */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-sm">Cuentas y perfiles</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Todo sobre registro, verificación y gestión de cuentas
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-sm">Reservas y pagos</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Proceso de reservas, cancelaciones y métodos de pago
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-sm">Publicar espacios</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Guías para propietarios que quieren rentar sus consultorios
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="h-5 w-5 text-orange-600" />
              </div>
              <CardTitle className="text-sm">Seguridad y protección</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Información sobre seguridad, seguros y protección de datos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contacto */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle>¿No encontraste tu respuesta?</CardTitle>
            <CardDescription>
              Nuestro equipo de soporte está aquí para ayudarte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <a href="/centro-ayuda">Ir al centro de ayuda</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/contacto">Contactar soporte</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
