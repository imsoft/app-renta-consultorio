"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { 
  CalendarDays, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  User,
  AlertCircle
} from "lucide-react";
import { format, isToday, isTomorrow, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

interface TimeSlot {
  hora_slot: string;
  disponible: boolean;
  reserva_id?: string;
}

interface HourlyBookingSelectorProps {
  consultorioId: string;
  consultorioTitulo: string;
  precioPorHora: number;
  diasDisponibles: string[];
  onBookingConfirm: (fecha: Date, hora: string, total: number) => void;
  className?: string;
}

export default function HourlyBookingSelector({
  consultorioId,
  consultorioTitulo,
  precioPorHora,
  diasDisponibles,
  onBookingConfirm,
  className = ""
}: HourlyBookingSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const { user } = useAuthStore();

  // Mapeo de días de la semana (constante)
  const dayMap = useCallback(() => ({
    'lunes': 'monday',
    'martes': 'tuesday', 
    'miercoles': 'wednesday',
    'jueves': 'thursday',
    'viernes': 'friday',
    'sabado': 'saturday',
    'domingo': 'sunday'
  }), []);

  // Verificar si una fecha está disponible
  const isDateAvailable = useCallback((date: Date) => {
    const dayOfWeek = format(date, 'EEEE', { locale: es }).toLowerCase();
    const dayMapping = dayMap();
    const spanishDay = Object.keys(dayMapping).find(key => dayMapping[key as keyof typeof dayMapping] === dayOfWeek);
    return spanishDay ? diasDisponibles.includes(spanishDay) : false;
  }, [diasDisponibles, dayMap]);

  // Cargar slots disponibles para la fecha seleccionada
  const loadAvailableSlots = useCallback(async (date: Date) => {
    if (!date) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_available_slots', {
        p_consultorio_id: consultorioId,
        p_fecha: format(date, 'yyyy-MM-dd')
      });

      if (error) {
        console.error('Error al cargar slots:', error);
        setAvailableSlots([]);
        return;
      }

      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Error al cargar slots:', error);
      setAvailableSlots([]);
    } finally {
      setIsLoading(false);
    }
  }, [consultorioId]);

  // Efecto para cargar slots cuando cambia la fecha
  useEffect(() => {
    if (selectedDate && isDateAvailable(selectedDate)) {
      loadAvailableSlots(selectedDate);
    } else {
      setAvailableSlots([]);
    }
    setSelectedTime(""); // Limpiar selección de hora
  }, [selectedDate, consultorioId, isDateAvailable, loadAvailableSlots]);

  // Manejar confirmación de reserva
  const handleBookingConfirm = async () => {
    if (!selectedDate || !selectedTime || !user) return;

    setIsBooking(true);
    try {
      const { data, error } = await supabase.rpc('create_hourly_reservation', {
        p_consultorio_id: consultorioId,
        p_usuario_id: user.id,
        p_fecha: format(selectedDate, 'yyyy-MM-dd'),
        p_hora_inicio: selectedTime,
        p_notas_usuario: null
      });

      if (error) {
        console.error('Error al crear reserva:', error);
        return;
      }

      const result = data[0];
      if (result.success) {
        onBookingConfirm(selectedDate, selectedTime, precioPorHora);
        // Recargar slots para actualizar disponibilidad
        await loadAvailableSlots(selectedDate);
        setSelectedTime("");
      } else {
        console.error('Error:', result.message);
      }
    } catch (error) {
      console.error('Error al crear reserva:', error);
    } finally {
      setIsBooking(false);
    }
  };

  // Formatear tiempo para mostrar
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  // Obtener texto del día seleccionado
  const getSelectedDateText = () => {
    if (!selectedDate) return "";
    
    if (isToday(selectedDate)) {
      return "Hoy";
    } else if (isTomorrow(selectedDate)) {
      return "Mañana";
    } else {
      return format(selectedDate, "EEEE d 'de' MMMM", { locale: es });
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Calendario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="h-5 w-5 mr-2" />
            Selecciona una fecha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => 
              date < startOfDay(new Date()) || !isDateAvailable(date)
            }
            className="rounded-md border w-full"
            locale={es}
            initialFocus
          />
          
          {selectedDate && !isDateAvailable(selectedDate) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
              <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">
                Este consultorio no está disponible los días seleccionados.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Horarios disponibles */}
      {selectedDate && isDateAvailable(selectedDate) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Horarios disponibles - {getSelectedDateText()}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Selecciona un horario de 1 hora para tu consulta
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Cargando horarios disponibles...</span>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.hora_slot}
                    variant={selectedTime === slot.hora_slot ? "default" : "outline"}
                    disabled={!slot.disponible}
                    onClick={() => setSelectedTime(slot.hora_slot)}
                    className="h-12 flex flex-col items-center justify-center relative"
                  >
                    <span className="font-medium">
                      {formatTime(slot.hora_slot)}
                    </span>
                    <span className="text-xs opacity-75">
                      {formatTime(slot.hora_slot.split(':').map((part, i) => 
                        i === 0 ? String(parseInt(part) + 1).padStart(2, '0') : part
                      ).join(':'))}
                    </span>
                    
                    {!slot.disponible && (
                      <div className="absolute inset-0 bg-red-100 bg-opacity-75 rounded flex items-center justify-center">
                        <XCircle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No hay horarios disponibles para esta fecha
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resumen y confirmación */}
      {selectedDate && selectedTime && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <CheckCircle className="h-5 w-5 mr-2" />
              Confirmar reserva
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consultorio:</span>
                <span className="font-medium">{consultorioTitulo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha:</span>
                <span className="font-medium">{getSelectedDateText()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Horario:</span>
                <span className="font-medium">
                  {formatTime(selectedTime)} - {formatTime(selectedTime.split(':').map((part, i) => 
                    i === 0 ? String(parseInt(part) + 1).padStart(2, '0') : part
                  ).join(':'))}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-primary">${precioPorHora.toLocaleString()}</span>
              </div>
            </div>

            <Button 
              onClick={handleBookingConfirm}
              disabled={isBooking || !user}
              className="w-full"
              size="lg"
            >
              {isBooking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Procesando reserva...
                </>
              ) : !user ? (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Inicia sesión para reservar
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar reserva por ${precioPorHora.toLocaleString()}
                </>
              )}
            </Button>

            {!user && (
              <p className="text-xs text-muted-foreground text-center">
                Necesitas iniciar sesión para poder hacer una reserva
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
