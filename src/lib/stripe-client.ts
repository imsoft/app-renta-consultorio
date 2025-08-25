import { loadStripe, Stripe } from '@stripe/stripe-js'

// Variable para cachear la instancia de Stripe
let stripePromise: Promise<Stripe | null>

// Función para obtener la instancia de Stripe (se ejecuta en el cliente)
export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
    }
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

// URL para el onboarding de Stripe Connect
export const createConnectAccountURL = (accountId: string, returnUrl: string, refreshUrl: string) => {
  const connectClientId = process.env.NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID
  if (!connectClientId) {
    throw new Error('NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID is not set')
  }

  const params = new URLSearchParams({
    'client_id': connectClientId,
    'account_id': accountId,
    'return_url': returnUrl,
    'refresh_url': refreshUrl,
    'type': 'account_onboarding',
  })

  return `https://connect.stripe.com/express/oauth/authorize?${params.toString()}`
}

// Redirigir al checkout de Stripe
export const redirectToCheckout = async (sessionId: string) => {
  const stripe = await getStripe()
  if (!stripe) {
    throw new Error('Failed to load Stripe')
  }

  const { error } = await stripe.redirectToCheckout({ sessionId })
  if (error) {
    throw error
  }
}

// Confirmar un Payment Intent
export const confirmPayment = async (clientSecret: string) => {
  const stripe = await getStripe()
  if (!stripe) {
    throw new Error('Failed to load Stripe')
  }

  return await stripe.confirmPayment({
    clientSecret,
    confirmParams: {
      return_url: `${window.location.origin}/pagos/confirmacion`,
    },
  })
}
