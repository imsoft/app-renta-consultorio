import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
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
    const { email, country = 'MX', businessName } = await request.json()

    // Verificar que el usuario tiene rol de owner
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role, email, full_name')
      .eq('id', userId)
      .single()

    if (profileError || profile.role !== 'owner') {
      return NextResponse.json(
        { error: 'Solo los propietarios pueden crear cuentas de Stripe' },
        { status: 403 }
      )
    }

    // Verificar si ya tiene una cuenta de Stripe
    const { data: existingAccount } = await supabaseClient
      .from('stripe_accounts')
      .select('stripe_account_id, onboarding_url')
      .eq('propietario_id', userId)
      .single()

    if (existingAccount) {
      return NextResponse.json({
        accountId: existingAccount.stripe_account_id,
        onboardingUrl: existingAccount.onboarding_url,
        message: 'Ya tienes una cuenta de Stripe'
      })
    }

    // Crear cuenta conectada en Stripe
    const account = await stripe.accounts.create({
      type: 'express',
      country: country.toUpperCase(),
      email: email || profile.email,
      business_type: 'individual',
      metadata: {
        userId: userId,
        platform: 'wellpoint'
      }
    })

    // Crear URL de onboarding
    const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/pagos/conectado`
    const refreshUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/pagos/conectar`

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      return_url: returnUrl,
      refresh_url: refreshUrl,
      type: 'account_onboarding',
    })

    // Guardar en la base de datos
    const { error: insertError } = await supabaseClient
      .from('stripe_accounts')
      .insert({
        propietario_id: userId,
        stripe_account_id: account.id,
        account_type: 'express',
        country: country.toUpperCase(),
        currency: country.toUpperCase() === 'MX' ? 'mxn' : 'usd',
        onboarding_url: accountLink.url,
        email: email || profile.email,
        business_name: businessName || profile.full_name
      })

    if (insertError) {
      console.error('Error saving stripe account:', insertError)
      return NextResponse.json(
        { error: 'Error al guardar la cuenta' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
      message: 'Cuenta de Stripe creada exitosamente'
    })

  } catch (error) {
    console.error('Error creating Stripe account:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
