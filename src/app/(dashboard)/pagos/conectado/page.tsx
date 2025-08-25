"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Loader2, CreditCard, ArrowRight } from 'lucide-react'

export default function ConectadoPage() {
  const [accountStatus, setAccountStatus] = useState<{
    hasAccount: boolean
    onboardingCompleted: boolean
    detailsSubmitted: boolean
    chargesEnabled: boolean
    payoutsEnabled: boolean
    onboardingUrl?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAccountStatus()
  }, [])

  const checkAccountStatus = async () => {
    try {
      const response = await fetch('/api/stripe/connect/account-status')
      if (response.ok) {
        const data = await response.json()
        setAccountStatus(data)
      }
    } catch (error) {
      console.error('Error checking account status:', error)
    } finally {
      setLoading(false)
    }
  }

  const goToDashboard = () => {
    router.push('/pagos/dashboard')
  }

  const continueSetup = () => {
    router.push('/pagos/conectar')
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Verificando tu cuenta de Stripe...</span>
        </div>
      </div>
    )
  }

  // Cuenta completamente configurada
  if (accountStatus?.hasAccount && accountStatus?.onboardingCompleted) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-800">¡Cuenta configurada exitosamente!</CardTitle>
            <CardDescription className="text-green-700">
              Tu cuenta de Stripe está lista para recibir pagos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium mb-2">Estado de tu cuenta:</h3>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Información verificada
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Pagos habilitados
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Retiros habilitados
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2">¿Qué sigue?</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Publica tus consultorios</li>
                <li>• Recibe reservas de profesionales</li>
                <li>• Los pagos llegarán automáticamente a tu cuenta</li>
                <li>• Nosotros cobramos solo 3% de comisión</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={goToDashboard} className="flex-1">
                <CreditCard className="mr-2 h-4 w-4" />
                Ver dashboard de pagos
              </Button>
              <Button variant="outline" onClick={() => router.push('/consultorios/crear')} className="flex-1">
                Crear consultorio
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Cuenta incompleta o con problemas
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-yellow-800">Configuración incompleta</CardTitle>
          <CardDescription className="text-yellow-700">
            Tu cuenta de Stripe necesita completar algunos pasos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {accountStatus?.hasAccount ? (
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium mb-2">Estado actual:</h3>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center">
                  {accountStatus.detailsSubmitted ? 
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> : 
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                  }
                  Información enviada
                </li>
                <li className="flex items-center">
                  {accountStatus.chargesEnabled ? 
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> : 
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                  }
                  Pagos habilitados
                </li>
                <li className="flex items-center">
                  {accountStatus.payoutsEnabled ? 
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> : 
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                  }
                  Retiros habilitados
                </li>
              </ul>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm">No se encontró una cuenta de Stripe asociada.</p>
            </div>
          )}

          <Button onClick={continueSetup} className="w-full">
            Continuar configuración
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
