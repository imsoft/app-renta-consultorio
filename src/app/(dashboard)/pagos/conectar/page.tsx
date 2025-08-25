"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useAuthStore } from '@/stores/authStore'
import { 
  CreditCard, 
  ArrowRight, 
  Shield, 
  DollarSign, 
  Globe, 
  CheckCircle, 
  AlertCircle,
  Loader2 
} from 'lucide-react'

export default function ConectarStripePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [accountStatus, setAccountStatus] = useState<{
    hasAccount: boolean
    onboardingCompleted: boolean
    detailsSubmitted: boolean
    chargesEnabled: boolean
    payoutsEnabled: boolean
    onboardingUrl?: string
  } | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(true)
  
  const router = useRouter()
  const { user } = useAuthStore()

  // Verificar que el usuario sea owner
  useEffect(() => {
    if (user && user.role !== 'owner') {
      router.push('/dashboard')
      return
    }
    
    if (user) {
      setEmail(user.email)
      setBusinessName(`${user.nombre} ${user.apellidos}`)
      checkAccountStatus()
    }
  }, [user, router])

  const checkAccountStatus = async () => {
    try {
      const response = await fetch('/api/stripe/connect/account-status')
      if (response.ok) {
        const data = await response.json()
        setAccountStatus(data)
        
        // Si ya tiene cuenta y está completada, redirigir al dashboard
        if (data.hasAccount && data.onboardingCompleted) {
          router.push('/pagos/dashboard')
        }
      }
    } catch (error) {
      console.error('Error checking account status:', error)
    } finally {
      setCheckingStatus(false)
    }
  }

  const createStripeAccount = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/stripe/connect/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          businessName,
          country: 'MX'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirigir al onboarding de Stripe
        window.location.href = data.onboardingUrl
      } else {
        setError(data.error || 'Error al crear la cuenta')
      }
    } catch (error) {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const continueOnboarding = () => {
    if (accountStatus?.onboardingUrl) {
      window.location.href = accountStatus.onboardingUrl
    }
  }

  if (checkingStatus) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Verificando estado de tu cuenta...</span>
        </div>
      </div>
    )
  }

  // Si ya tiene cuenta pero no está completa
  if (accountStatus?.hasAccount && !accountStatus.onboardingCompleted) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-6 w-6 text-yellow-500 mr-2" />
              Completar configuración de Stripe
            </CardTitle>
            <CardDescription>
              Tu cuenta de Stripe está creada pero necesita completar la configuración
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-medium text-yellow-800 mb-2">Estado actual:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Información enviada: {accountStatus.detailsSubmitted ? '✅' : '❌'}</li>
                <li>• Pagos habilitados: {accountStatus.chargesEnabled ? '✅' : '❌'}</li>
                <li>• Retiros habilitados: {accountStatus.payoutsEnabled ? '✅' : '❌'}</li>
              </ul>
            </div>
            
            <Button 
              onClick={continueOnboarding}
              className="w-full"
              size="lg"
            >
              Continuar configuración en Stripe
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Conectar con Stripe</h1>
        <p className="text-muted-foreground">
          Configura tu cuenta de pagos para empezar a recibir dinero de tus reservas
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Beneficios */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 text-green-500 mr-2" />
                ¿Por qué Stripe?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <DollarSign className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Recibe el 97% de cada pago</h4>
                  <p className="text-sm text-muted-foreground">
                    Solo cobramos 3% de comisión por el uso de la plataforma
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Globe className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Pagos internacionales</h4>
                  <p className="text-sm text-muted-foreground">
                    Acepta tarjetas de todo el mundo de forma segura
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Transferencias automáticas</h4>
                  <p className="text-sm text-muted-foreground">
                    El dinero llega directamente a tu cuenta bancaria
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Crear cuenta de Stripe
            </CardTitle>
            <CardDescription>
              Te redirigiremos a Stripe para completar la configuración de forma segura
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <Label htmlFor="businessName">Nombre del negocio</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Tu nombre o nombre del negocio"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Nota:</strong> Serás redirigido a Stripe para completar la verificación 
                  de identidad y configurar tu cuenta bancaria de forma segura.
                </p>
              </div>

              <Button 
                onClick={createStripeAccount}
                disabled={loading || !email || !businessName}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    Continuar con Stripe
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
