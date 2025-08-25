import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

// Inicializar Stripe con configuración para Connect
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
})

// Configuración para el cliente
export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  connectClientId: process.env.STRIPE_CONNECT_CLIENT_ID!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  applicationFeePercent: 0.03, // 3% de comisión
}

// Tipos para TypeScript
export interface ConnectedAccount {
  id: string
  type: 'express' | 'standard' | 'custom'
  email?: string
  country: string
  default_currency: string
  details_submitted: boolean
  charges_enabled: boolean
  payouts_enabled: boolean
  requirements: {
    currently_due: string[]
    eventually_due: string[]
    past_due: string[]
    pending_verification: string[]
  }
}

export interface PaymentIntentData {
  amount: number
  currency: string
  applicationFeeAmount: number
  connectedAccountId: string
  metadata: {
    reservaId: string
    consultorioId: string
    userId: string
  }
}

// Utilidad para calcular comisión
export const calculateApplicationFee = (amount: number): number => {
  return Math.round(amount * stripeConfig.applicationFeePercent)
}

// Utilidad para formatear cantidad para Stripe (centavos)
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100)
}

// Utilidad para formatear cantidad desde Stripe
export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100
}
