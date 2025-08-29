"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Copy, CheckCircle } from "lucide-react";

interface HorarioDia {
  abierto: boolean;
  inicio?: string;
  fin?: string;
}

interface Horarios {
  lunes: HorarioDia;
  martes: HorarioDia;
  miercoles: HorarioDia;
  jueves: HorarioDia;
  viernes: HorarioDia;
  sabado: HorarioDia;
  domingo: HorarioDia;
}

interface HorariosManagerProps {
  horarios: Horarios;
  onHorariosChange: (horarios: Horarios) => void;
}

const diasSemana = [
  { key: 'lunes', nombre: 'Lunes', short: 'Lun' },
  { key: 'martes', nombre: 'Martes', short: 'Mar' },
  { key: 'miercoles', nombre: 'Miércoles', short: 'Mié' },
  { key: 'jueves', nombre: 'Jueves', short: 'Jue' },
  { key: 'viernes', nombre: 'Viernes', short: 'Vie' },
  { key: 'sabado', nombre: 'Sábado', short: 'Sáb' },
  { key: 'domingo', nombre: 'Domingo', short: 'Dom' }
];

export default function HorariosManager({ horarios, onHorariosChange }: HorariosManagerProps) {
  const [copiedDay, setCopiedDay] = useState<string | null>(null);

  const updateHorario = (dia: string, campo: keyof HorarioDia, valor: string | boolean) => {
    const nuevosHorarios = {
      ...horarios,
      [dia]: {
        ...horarios[dia as keyof Horarios],
        [campo]: valor
      }
    };
    onHorariosChange(nuevosHorarios);
  };

  const toggleDia = (dia: string) => {
    const actual = horarios[dia as keyof Horarios];
    updateHorario(dia, 'abierto', !actual.abierto);
  };

  const copiarHorario = (diaOrigen: string) => {
    const horarioOrigen = horarios[diaOrigen as keyof Horarios];
    const nuevosHorarios = { ...horarios };
    
    Object.keys(horarios).forEach(dia => {
      if (dia !== diaOrigen) {
        nuevosHorarios[dia as keyof Horarios] = { ...horarioOrigen };
      }
    });
    
    onHorariosChange(nuevosHorarios);
    setCopiedDay(diaOrigen);
    setTimeout(() => setCopiedDay(null), 2000);
  };

  const getHorarioResumen = () => {
    const diasAbiertos = Object.entries(horarios).filter(([, horario]) => horario.abierto);
    if (diasAbiertos.length === 0) return "No hay días configurados";
    
    const grupos = new Map<string, string[]>();
    
    diasAbiertos.forEach(([dia, horario]) => {
      const horarioStr = `${horario.inicio} - ${horario.fin}`;
      if (!grupos.has(horarioStr)) {
        grupos.set(horarioStr, []);
      }
      grupos.get(horarioStr)!.push(dia);
    });
    
    return Array.from(grupos.entries()).map(([horario, dias]) => {
      const diasNombres = dias.map(d => diasSemana.find(ds => ds.key === d)?.short).join(', ');
      return `${diasNombres}: ${horario}`;
    }).join(' | ');
  };

  return (
    <div className="space-y-6">
      {/* Resumen de horarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Horarios de Disponibilidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <span className="font-medium">Resumen:</span>
              <span className="ml-2 text-sm text-muted-foreground">
                {getHorarioResumen()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración por día */}
      <div className="grid gap-4">
        {diasSemana.map(({ key, nombre }) => {
          const horario = horarios[key as keyof Horarios];
          const isCopied = copiedDay === key;
          
          return (
            <Card key={key} className={horario.abierto ? 'border-primary/20' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={horario.abierto}
                      onCheckedChange={() => toggleDia(key)}
                    />
                    <Label className="font-medium">{nombre}</Label>
                    {horario.abierto && (
                      <Badge variant="secondary" className="text-xs">
                        Abierto
                      </Badge>
                    )}
                  </div>
                  
                  {horario.abierto && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copiarHorario(key)}
                      className={isCopied ? 'text-green-600 border-green-200' : ''}
                    >
                      {isCopied ? (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      ) : (
                        <Copy className="h-4 w-4 mr-1" />
                      )}
                      {isCopied ? 'Copiado' : 'Copiar'}
                    </Button>
                  )}
                </div>

                {horario.abierto && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Hora de apertura</Label>
                      <Input
                        type="time"
                        value={horario.inicio || ""}
                        onChange={(e) => updateHorario(key, 'inicio', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Hora de cierre</Label>
                      <Input
                        type="time"
                        value={horario.fin || ""}
                        onChange={(e) => updateHorario(key, 'fin', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {!horario.abierto && (
                  <div className="text-sm text-muted-foreground italic">
                    Cerrado
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                const horarioComercial = {
                  lunes: { abierto: true, inicio: "09:00", fin: "18:00" },
                  martes: { abierto: true, inicio: "09:00", fin: "18:00" },
                  miercoles: { abierto: true, inicio: "09:00", fin: "18:00" },
                  jueves: { abierto: true, inicio: "09:00", fin: "18:00" },
                  viernes: { abierto: true, inicio: "09:00", fin: "18:00" },
                  sabado: { abierto: false, inicio: "", fin: "" },
                  domingo: { abierto: false, inicio: "", fin: "" }
                };
                onHorariosChange(horarioComercial);
              }}
            >
              Horario Comercial
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const horarioExtendido = {
                  lunes: { abierto: true, inicio: "08:00", fin: "20:00" },
                  martes: { abierto: true, inicio: "08:00", fin: "20:00" },
                  miercoles: { abierto: true, inicio: "08:00", fin: "20:00" },
                  jueves: { abierto: true, inicio: "08:00", fin: "20:00" },
                  viernes: { abierto: true, inicio: "08:00", fin: "20:00" },
                  sabado: { abierto: true, inicio: "09:00", fin: "17:00" },
                  domingo: { abierto: false, inicio: "", fin: "" }
                };
                onHorariosChange(horarioExtendido);
              }}
            >
              Horario Extendido
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const horarioCompleto = {
                  lunes: { abierto: true, inicio: "00:00", fin: "23:59" },
                  martes: { abierto: true, inicio: "00:00", fin: "23:59" },
                  miercoles: { abierto: true, inicio: "00:00", fin: "23:59" },
                  jueves: { abierto: true, inicio: "00:00", fin: "23:59" },
                  viernes: { abierto: true, inicio: "00:00", fin: "23:59" },
                  sabado: { abierto: true, inicio: "00:00", fin: "23:59" },
                  domingo: { abierto: true, inicio: "00:00", fin: "23:59" }
                };
                onHorariosChange(horarioCompleto);
              }}
            >
              24/7
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const horarioCerrado = {
                  lunes: { abierto: false, inicio: "", fin: "" },
                  martes: { abierto: false, inicio: "", fin: "" },
                  miercoles: { abierto: false, inicio: "", fin: "" },
                  jueves: { abierto: false, inicio: "", fin: "" },
                  viernes: { abierto: false, inicio: "", fin: "" },
                  sabado: { abierto: false, inicio: "", fin: "" },
                  domingo: { abierto: false, inicio: "", fin: "" }
                };
                onHorariosChange(horarioCerrado);
              }}
            >
              Cerrar Todo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
