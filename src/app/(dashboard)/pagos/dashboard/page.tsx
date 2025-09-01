"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Loader2,
  Settings,
  Eye
} from 'lucide-react'

interface StripeAccount {
  id: string
  stripe_account_id: string
  details_submitted: boolean
  charges_enabled: boolean
  payouts_enabled: boolean
  onboarding_completed: boolean
  created_at: string
}

interface Payment {
  id: string
  amount_total: number
  amount_application_fee: number
  amount_net: number
  currency: string
  payment_status: string
  stripe_created_at: string
  reserva: {
    id: string
    fecha_inicio: string
    fecha_fin: string
    consultorio: {
      titulo: string
    }
  }
}

interface Earnings {
  total_earnings: number
  total_transactions: number
  total_fees: number
  avg_transaction: number
}

export default function PaymentsDashboardPage() {
  const [stripeAccount, setStripeAccount] = useState<StripeAccount | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [earnings, setEarnings] = useState<Earnings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {

    try {
      // Obtener cuenta de Stripe
      const { data: accountData, error: accountError } = await supabase
        .from('stripe_accounts')
        .select('*')
        .eq('propietario_id', user?.id)
        .single()

      if (accountError && accountError.code !== 'PGRST116') {
        console.error('Error fetching Stripe account:', accountError)
      } else {
        setStripeAccount(accountData)
      }

      // Obtener pagos si tiene cuenta
      if (accountData) {
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('stripe_payments')
          .select(`
            *,
            reserva:reservas (
              id,
              fecha_inicio,
              fecha_fin,
              consultorio:consultorios (
                titulo
              )
            )
          `)
          .eq('stripe_account_id', accountData.stripe_account_id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (paymentsError) {
          console.error('Error fetching payments:', paymentsError)
        } else {
          setPayments(paymentsData || [])
        }

        // Obtener estadísticas de ganancias
        const { data: earningsData, error: earningsError } = await supabase
          .rpc('get_owner_earnings', { owner_id: user?.id })

        if (earningsError) {
          console.error('Error fetching earnings:', earningsError)
        } else if (earningsData && earningsData.length > 0) {
          setEarnings(earningsData[0])
        }
      }

    } catch (err) {
      console.error('Error in fetchDashboardData:', err)
      setError('Error al cargar los datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  const connectStripeAccount = () => {
    router.push('/pagos/conectar')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <Badge className="bg-green-100 text-green-800">Exitoso</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Procesando</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Fallido</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando dashboard de pagos...</span>
        </div>
      </div>
    )
  }

  // Si no tiene cuenta de Stripe conectada
  if (!stripeAccount) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-blue-800">Conecta tu cuenta de pagos</CardTitle>
            <CardDescription className="text-blue-700">
              Para empezar a recibir pagos de tus reservas, necesitas conectar una cuenta de Stripe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium mb-2">¿Qué puedes hacer con Stripe?</h3>
              <ul className="text-sm space-y-1">
                <li>• Recibir pagos automáticamente</li>
                <li>• Retiros directos a tu cuenta bancaria</li>
                <li>• Seguimiento de todas tus transacciones</li>
                <li>• Soporte para tarjetas internacionales</li>
              </ul>
            </div>

            <Button onClick={connectStripeAccount} className="w-full" size="lg">
              <CreditCard className="mr-2 h-4 w-4" />
              Conectar cuenta de Stripe
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si la cuenta no está completamente configurada
  if (!stripeAccount.onboarding_completed) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-yellow-800">Completar configuración</CardTitle>
            <CardDescription className="text-yellow-700">
              Tu cuenta de Stripe necesita completar algunos pasos antes de poder recibir pagos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium mb-2">Estado actual:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  {stripeAccount.details_submitted ? 
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> : 
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                  }
                  Información enviada
                </li>
                <li className="flex items-center">
                  {stripeAccount.charges_enabled ? 
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> : 
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                  }
                  Pagos habilitados
                </li>
                <li className="flex items-center">
                  {stripeAccount.payouts_enabled ? 
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" /> : 
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                  }
                  Retiros habilitados
                </li>
              </ul>
            </div>

            <Button onClick={connectStripeAccount} className="w-full">
              Continuar configuración
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Pagos</h1>
          <p className="text-muted-foreground">
            Gestiona tus ganancias y transacciones
          </p>
        </div>
        <Button variant="outline" onClick={connectStripeAccount}>
          <Settings className="mr-2 h-4 w-4" />
          Configurar cuenta
        </Button>
      </div>

      {/* Estado de la cuenta */}
      <Card className="mb-8 border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700 font-medium">
              Tu cuenta de Stripe está activa y lista para recibir pagos
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      {earnings && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ganancias Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(earnings.total_earnings)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{earnings.total_transactions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comisiones Pagadas</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(earnings.total_fees)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio por Transacción</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(earnings.avg_transaction)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transacciones recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones Recientes</CardTitle>
          <CardDescription>
            Últimas transacciones de tus consultorios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">No hay transacciones aún</h3>
              <p className="text-muted-foreground mb-4">
                Las transacciones aparecerán aquí cuando recibas tus primeras reservas
              </p>
              <Button onClick={() => router.push('/consultorios/crear')} variant="outline">
                Crear mi primer consultorio
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {payment.reserva?.consultorio?.titulo || 'Consultorio'}
                        </h4>
                        {getStatusBadge(payment.payment_status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(payment.stripe_created_at)}
                      </p>
                      {payment.reserva && (
                        <p className="text-xs text-muted-foreground">
                          Reserva: {formatDate(payment.reserva.fecha_inicio)} - {formatDate(payment.reserva.fecha_fin)}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {formatCurrency(payment.amount_net / 100)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total: {formatCurrency(payment.amount_total / 100)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Comisión: {formatCurrency(payment.amount_application_fee / 100)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="text-center pt-4">
                <Button variant="outline" onClick={() => router.push('/reservas')}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver todas las reservas
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
