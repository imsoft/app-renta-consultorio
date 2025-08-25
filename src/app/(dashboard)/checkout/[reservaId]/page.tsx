"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import { ArrowLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-react'

interface Reserva {
  id: string
  fecha_inicio: string
  fecha_fin: string
  total: number
  payment_status: string
  estado: string
  consultorio: {
    id: string
    titulo: string
    propietario_id: string
    precio_por_hora: number
  }
}

export default function CheckoutPage() {
  const [reserva, setReserva] = useState<Reserva | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  const router = useRouter()
  const params = useParams()
  const { user } = useAuthStore()
  
  const reservaId = params.reservaId as string

  useEffect(() => {
    if (user && reservaId) {
      fetchReserva()
    }
  }, [user, reservaId])

  const fetchReserva = async () => {

    try {
      const { data, error } = await supabase
        .from('reservas')
        .select(`
          *,
          consultorio:consultorios (
            id,
            titulo,
            propietario_id,
            precio_por_hora
          )
        `)
        .eq('id', reservaId)
        .eq('usuario_id', user?.id)
        .single()

      if (error) {
        setError('No se pudo cargar la reserva')
        return
      }

      if (!data) {
        setError('Reserva no encontrada')
        return
      }

      setReserva(data)

      // Si ya está pagada, mostrar mensaje de éxito
      if (data.payment_status === 'paid') {
        setPaymentSuccess(true)
      }

    } catch (err) {
      setError('Error al cargar la reserva')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true)
    setPaymentError('')
    
    // Actualizar la reserva para reflejar el nuevo estado
    fetchReserva()
  }

  const handlePaymentError = (errorMessage: string) => {
    setPaymentError(errorMessage)
  }

  const goToReservations = () => {
    router.push('/reservas')
  }

  const goBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando información de pago...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Error</CardTitle>
            <CardDescription className="text-red-700">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={goBack} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!reserva) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p>No se encontró la reserva</p>
          <Button onClick={goBack} variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
      </div>
    )
  }

  // Mostrar mensaje de éxito si el pago ya se completó
  if (paymentSuccess || reserva.payment_status === 'paid') {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-800">¡Pago exitoso!</CardTitle>
            <CardDescription className="text-green-700">
              Tu reserva ha sido confirmada y el pago se procesó correctamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium mb-2">Detalles de la reserva:</h3>
              <div className="text-sm space-y-1">
                <p><strong>Consultorio:</strong> {reserva.consultorio.titulo}</p>
                <p><strong>Fecha:</strong> {new Date(reserva.fecha_inicio).toLocaleDateString('es-MX')} - {new Date(reserva.fecha_fin).toLocaleDateString('es-MX')}</p>
                <p><strong>Total pagado:</strong> ${reserva.total.toFixed(2)} MXN</p>
                <p><strong>Estado:</strong> Confirmada</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2">¿Qué sigue?</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Recibirás un email de confirmación</li>
                <li>• El propietario será notificado</li>
                <li>• Puedes ver todos los detalles en tu área de reservas</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={goToReservations} className="flex-1">
                Ver mis reservas
              </Button>
              <Button variant="outline" onClick={() => router.push('/consultorios')} className="flex-1">
                Buscar más consultorios
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          onClick={goBack}
          variant="ghost"
          size="sm"
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Completar pago</h1>
          <p className="text-muted-foreground">
            Finaliza tu reserva con un pago seguro
          </p>
        </div>
      </div>

      {/* Error de pago */}
      {paymentError && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{paymentError}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulario de checkout */}
      <CheckoutForm
        reservaId={reserva.id}
        amount={reserva.total}
        consultorioTitulo={reserva.consultorio.titulo}
        fechaInicio={reserva.fecha_inicio}
        fechaFin={reserva.fecha_fin}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </div>
  )
}
