/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@supabase/ssr'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found')
      return NextResponse.json({ error: 'No signature found' }, { status: 400 })
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // Verificar el webhook
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err: unknown) {
      console.error('Webhook signature verification failed:', err instanceof Error ? err.message : 'Unknown error')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Crear cliente de Supabase con service role para webhooks
    const supabaseClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get() { return undefined },
        },
      }
    )

    // Log del evento recibido
    console.log('Stripe webhook received:', event.type, event.id)

    // Guardar evento en la tabla de webhooks para debugging
    await supabaseClient
      .from('stripe_webhooks')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        event_data: event.data,
        processed: false
      })

    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object, supabaseClient)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object, supabaseClient)
        break

      case 'account.updated':
        await handleAccountUpdated(event.data.object, supabaseClient)
        break

      case 'account.application.deauthorized':
        await handleAccountDeauthorized(event.data.object, supabaseClient)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Marcar evento como procesado
    await supabaseClient
      .from('stripe_webhooks')
      .update({ processed: true })
      .eq('stripe_event_id', event.id)

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    
    // Intentar guardar el error si es posible
    try {
      const supabaseClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            get() { return undefined },
          },
        }
      )

      await supabaseClient
        .from('stripe_webhooks')
        .update({ 
          processing_error: error instanceof Error ? error.message : 'Unknown error',
          processed: false 
        })
        .eq('stripe_event_id', (error as any)?.eventId)
    } catch (logError) {
      console.error('Failed to log webhook error:', logError)
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Manejar pago exitoso
async function handlePaymentIntentSucceeded(paymentIntent: any, supabase: any) {
  console.log('Processing successful payment:', paymentIntent.id)

  try {
    // Actualizar el estado del pago en nuestra base de datos
    const { data: payment, error: paymentError } = await supabase
      .from('stripe_payments')
      .update({
        payment_status: 'succeeded',
        stripe_updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .select('reserva_id')
      .single()

    if (paymentError) {
      console.error('Error updating payment status:', paymentError)
      return
    }

    if (payment) {
      // Actualizar el estado de la reserva
      await supabase
        .from('reservas')
        .update({
          payment_status: 'paid',
          estado: 'confirmada'
        })
        .eq('id', payment.reserva_id)

      console.log('Payment and reservation updated successfully')
    }
  } catch (error) {
    console.error('Error in handlePaymentIntentSucceeded:', error)
    throw error
  }
}

// Manejar pago fallido
async function handlePaymentIntentFailed(paymentIntent: any, supabase: any) {
  console.log('Processing failed payment:', paymentIntent.id)

  try {
    // Actualizar el estado del pago
    const { data: payment, error: paymentError } = await supabase
      .from('stripe_payments')
      .update({
        payment_status: 'payment_failed',
        stripe_updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .select('reserva_id')
      .single()

    if (paymentError) {
      console.error('Error updating failed payment status:', paymentError)
      return
    }

    if (payment) {
      // Actualizar el estado de la reserva
      await supabase
        .from('reservas')
        .update({
          payment_status: 'failed',
          estado: 'cancelada'
        })
        .eq('id', payment.reserva_id)

      console.log('Failed payment and reservation updated successfully')
    }
  } catch (error) {
    console.error('Error in handlePaymentIntentFailed:', error)
    throw error
  }
}

// Manejar actualizaciones de cuenta conectada
async function handleAccountUpdated(account: any, supabase: any) {
  console.log('Processing account update:', account.id)

  try {
    await supabase
      .from('stripe_accounts')
      .update({
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        onboarding_completed: account.details_submitted && account.charges_enabled,
      })
      .eq('stripe_account_id', account.id)

    console.log('Stripe account updated successfully')
  } catch (error) {
    console.error('Error in handleAccountUpdated:', error)
    throw error
  }
}

// Manejar desconexión de cuenta
async function handleAccountDeauthorized(application: any, supabase: any) {
  console.log('Processing account deauthorization:', application.account)

  try {
    // Marcar la cuenta como deshabilitada
    await supabase
      .from('stripe_accounts')
      .update({
        charges_enabled: false,
        payouts_enabled: false,
        onboarding_completed: false,
      })
      .eq('stripe_account_id', application.account)

    console.log('Account deauthorized successfully')
  } catch (error) {
    console.error('Error in handleAccountDeauthorized:', error)
    throw error
  }
}
