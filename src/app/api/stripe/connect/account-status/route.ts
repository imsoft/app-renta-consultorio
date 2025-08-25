import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
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

    // Obtener la cuenta de Stripe del usuario
    const { data: stripeAccount, error: accountError } = await supabaseClient
      .from('stripe_accounts')
      .select('*')
      .eq('propietario_id', userId)
      .single()

    if (accountError || !stripeAccount) {
      return NextResponse.json({
        hasAccount: false,
        message: 'No tienes una cuenta de Stripe conectada'
      })
    }

    // Obtener información actualizada de Stripe
    const account = await stripe.accounts.retrieve(stripeAccount.stripe_account_id)

    // Actualizar información en la base de datos
    const { error: updateError } = await supabaseClient
      .from('stripe_accounts')
      .update({
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        onboarding_completed: account.details_submitted && account.charges_enabled,
        updated_at: new Date().toISOString()
      })
      .eq('propietario_id', userId)

    if (updateError) {
      console.error('Error updating account status:', updateError)
    }

    // Crear nueva URL de onboarding si es necesario
    let onboardingUrl = stripeAccount.onboarding_url
    if (!account.details_submitted) {
      const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/pagos/conectado`
      const refreshUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/pagos/conectar`

      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        return_url: returnUrl,
        refresh_url: refreshUrl,
        type: 'account_onboarding',
      })
      
      onboardingUrl = accountLink.url

      // Actualizar URL en la base de datos
      await supabaseClient
        .from('stripe_accounts')
        .update({ onboarding_url: onboardingUrl })
        .eq('propietario_id', userId)
    }

    return NextResponse.json({
      hasAccount: true,
      accountId: account.id,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      onboardingCompleted: account.details_submitted && account.charges_enabled,
      onboardingUrl: !account.details_submitted ? onboardingUrl : null,
      country: account.country,
      currency: account.default_currency,
      requirements: {
        currentlyDue: account.requirements?.currently_due || [],
        eventuallyDue: account.requirements?.eventually_due || [],
        pastDue: account.requirements?.past_due || [],
        pendingVerification: account.requirements?.pending_verification || []
      }
    })

  } catch (error) {
    console.error('Error fetching account status:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
