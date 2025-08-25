import { NextRequest, NextResponse } from 'next/server'
import { stripe, calculateApplicationFee, formatAmountForStripe } from '@/lib/stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabaseClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    // Verificar autenticación
    const { data: { session }, error: authError } = await supabaseClient.auth.getSession()
    if (authError || !session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { reservaId, amount, currency = 'mxn' } = await request.json()

    // Validar datos requeridos
    if (!reservaId || !amount) {
      return NextResponse.json(
        { error: 'reservaId y amount son requeridos' },
        { status: 400 }
      )
    }

    // Obtener información de la reserva
    const { data: reserva, error: reservaError } = await supabaseClient
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
      .eq('usuario_id', userId)
      .single()

    if (reservaError || !reserva) {
      return NextResponse.json(
        { error: 'Reserva no encontrada o no autorizada' },
        { status: 404 }
      )
    }

    // Verificar que la reserva no esté ya pagada
    if (reserva.payment_status === 'paid') {
      return NextResponse.json(
        { error: 'Esta reserva ya está pagada' },
        { status: 400 }
      )
    }

    // Obtener cuenta de Stripe del propietario
    const { data: stripeAccount, error: accountError } = await supabaseClient
      .from('stripe_accounts')
      .select('stripe_account_id, charges_enabled')
      .eq('propietario_id', reserva.consultorio.propietario_id)
      .single()

    if (accountError || !stripeAccount) {
      return NextResponse.json(
        { error: 'El propietario no tiene configurada una cuenta de pagos' },
        { status: 400 }
      )
    }

    if (!stripeAccount.charges_enabled) {
      return NextResponse.json(
        { error: 'La cuenta del propietario no está habilitada para recibir pagos' },
        { status: 400 }
      )
    }

    // Calcular montos
    const amountInCents = formatAmountForStripe(amount)
    const applicationFeeInCents = calculateApplicationFee(amountInCents)
    const netAmountInCents = amountInCents - applicationFeeInCents

    // Crear Payment Intent con Application Fee
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency,
      application_fee_amount: applicationFeeInCents,
      metadata: {
        reservaId: reservaId,
        consultorioId: reserva.consultorio.id,
        userId: userId,
        platform: 'wellpoint'
      },
      transfer_data: {
        destination: stripeAccount.stripe_account_id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Guardar pago en la base de datos
    const { data: stripePayment, error: paymentError } = await supabaseClient
      .from('stripe_payments')
      .insert({
        reserva_id: reservaId,
        stripe_payment_intent_id: paymentIntent.id,
        stripe_account_id: stripeAccount.stripe_account_id,
        amount_total: amountInCents,
        amount_application_fee: applicationFeeInCents,
        amount_net: netAmountInCents,
        currency: currency,
        payment_status: paymentIntent.status,
        client_secret: paymentIntent.client_secret,
        stripe_created_at: new Date(paymentIntent.created * 1000).toISOString(),
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Error saving payment:', paymentError)
      return NextResponse.json(
        { error: 'Error al crear el pago' },
        { status: 500 }
      )
    }

    // Actualizar reserva con referencia al pago
    await supabaseClient
      .from('reservas')
      .update({
        stripe_payment_id: stripePayment.id,
        payment_status: 'processing'
      })
      .eq('id', reservaId)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      applicationFee: applicationFeeInCents / 100,
      netAmount: netAmountInCents / 100,
      currency: currency
    })

  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
