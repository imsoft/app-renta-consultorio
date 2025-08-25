"use client"

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CreditCard, Shield, CheckCircle } from 'lucide-react'

// Cargar Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutFormProps {
  reservaId: string
  amount: number
  consultorioTitulo: string
  fechaInicio: string
  fechaFin: string
  onSuccess: () => void
  onError: (error: string) => void
}

// Opciones para el CardElement
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: true,
}

// Componente interno que usa los hooks de Stripe
function PaymentForm({ 
  reservaId, 
  amount, 
  consultorioTitulo, 
  fechaInicio, 
  fechaFin, 
  onSuccess, 
  onError 
}: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState('')
  const [error, setError] = useState('')

  // Crear Payment Intent cuando se monta el componente
  useEffect(() => {
    createPaymentIntent()
  }, [])

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/stripe/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservaId,
          amount,
          currency: 'mxn'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setClientSecret(data.clientSecret)
      } else {
        setError(data.error || 'Error al crear el pago')
        onError(data.error || 'Error al crear el pago')
      }
    } catch (err) {
      const errorMsg = 'Error de conexión al crear el pago'
      setError(errorMsg)
      onError(errorMsg)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setLoading(true)
    setError('')

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setError('Error al cargar el formulario de pago')
      setLoading(false)
      return
    }

    // Confirmar el pago
    const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          // Aquí podrías agregar más detalles de facturación si los tienes
        },
      }
    })

    setLoading(false)

    if (paymentError) {
      const errorMsg = paymentError.message || 'Error en el pago'
      setError(errorMsg)
      onError(errorMsg)
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const commissionAmount = amount * 0.03
  const netAmount = amount - commissionAmount

  return (
    <div className="space-y-6">
      {/* Resumen de la reserva */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Resumen de pago
          </CardTitle>
          <CardDescription>
            Verifica los detalles de tu reserva antes de proceder
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">{consultorioTitulo}</h3>
            <p className="text-sm text-muted-foreground">
              {formatDate(fechaInicio)} - {formatDate(fechaFin)}
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${amount.toFixed(2)} MXN</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Comisión de servicio (3%)</span>
              <span>${commissionAmount.toFixed(2)} MXN</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium text-lg">
              <span>Total</span>
              <span>${amount.toFixed(2)} MXN</span>
            </div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center text-sm text-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              El propietario recibirá ${netAmount.toFixed(2)} MXN
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de pago */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Información de pago
          </CardTitle>
          <CardDescription>
            Tus datos están protegidos con cifrado de nivel bancario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="card-element" className="text-sm font-medium">
                Información de la tarjeta
              </label>
              <div className="border rounded-md p-3 bg-background">
                <CardElement 
                  id="card-element"
                  options={cardElementOptions}
                />
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700">
                <strong>Seguro:</strong> Esta transacción está protegida por Stripe. 
                No almacenamos tu información de tarjeta.
              </p>
            </div>

            <Button
              type="submit"
              disabled={!stripe || !clientSecret || loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando pago...
                </>
              ) : (
                <>
                  Pagar ${amount.toFixed(2)} MXN
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente principal que envuelve con Elements
export default function CheckoutForm(props: CheckoutFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  )
}
