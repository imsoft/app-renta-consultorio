-- Crear tabla para cuentas conectadas de Stripe
CREATE TABLE IF NOT EXISTS stripe_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  propietario_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_account_id TEXT UNIQUE NOT NULL,
  account_type TEXT DEFAULT 'express' CHECK (account_type IN ('express', 'standard', 'custom')),
  country TEXT DEFAULT 'MX',
  currency TEXT DEFAULT 'mxn',
  
  -- Estado de la cuenta
  details_submitted BOOLEAN DEFAULT FALSE,
  charges_enabled BOOLEAN DEFAULT FALSE,
  payouts_enabled BOOLEAN DEFAULT FALSE,
  
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_url TEXT,
  
  -- Metadata
  email TEXT,
  business_name TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un propietario solo puede tener una cuenta de Stripe
  UNIQUE(propietario_id)
);

-- Crear tabla para pagos de Stripe
CREATE TABLE IF NOT EXISTS stripe_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reserva_id UUID REFERENCES reservas(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_account_id TEXT REFERENCES stripe_accounts(stripe_account_id) NOT NULL,
  
  -- Montos (en centavos para precision)
  amount_total INTEGER NOT NULL, -- Monto total en centavos
  amount_application_fee INTEGER NOT NULL, -- Comisión de la plataforma en centavos
  amount_net INTEGER NOT NULL, -- Monto neto para el propietario en centavos
  currency TEXT DEFAULT 'mxn',
  
  -- Estado del pago
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'requires_payment_method',
    'requires_confirmation', 
    'requires_action',
    'processing',
    'requires_capture',
    'canceled',
    'succeeded'
  )),
  
  -- Metadata del pago
  payment_method_types TEXT[] DEFAULT '{"card"}',
  client_secret TEXT,
  
  -- Timestamps de Stripe
  stripe_created_at TIMESTAMPTZ,
  stripe_updated_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla para webhooks de Stripe (para debugging y logs)
CREATE TABLE IF NOT EXISTS stripe_webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  event_data JSONB NOT NULL,
  processing_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX idx_stripe_accounts_propietario ON stripe_accounts(propietario_id);
CREATE INDEX idx_stripe_accounts_stripe_id ON stripe_accounts(stripe_account_id);
CREATE INDEX idx_stripe_payments_reserva ON stripe_payments(reserva_id);
CREATE INDEX idx_stripe_payments_intent ON stripe_payments(stripe_payment_intent_id);
CREATE INDEX idx_stripe_payments_status ON stripe_payments(payment_status);
CREATE INDEX idx_stripe_webhooks_type ON stripe_webhooks(event_type);
CREATE INDEX idx_stripe_webhooks_processed ON stripe_webhooks(processed);

-- Habilitar RLS
ALTER TABLE stripe_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhooks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para stripe_accounts
CREATE POLICY "Owners can view their own stripe account" ON stripe_accounts
  FOR SELECT USING (propietario_id = auth.uid());

CREATE POLICY "Owners can insert their own stripe account" ON stripe_accounts
  FOR INSERT WITH CHECK (propietario_id = auth.uid());

CREATE POLICY "Owners can update their own stripe account" ON stripe_accounts
  FOR UPDATE USING (propietario_id = auth.uid());

-- Políticas RLS para stripe_payments
CREATE POLICY "Users can view payments for their reservations" ON stripe_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reservas 
      WHERE reservas.id = stripe_payments.reserva_id 
      AND reservas.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Owners can view payments for their consultorios" ON stripe_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reservas 
      JOIN consultorios ON consultorios.id = reservas.consultorio_id
      WHERE reservas.id = stripe_payments.reserva_id 
      AND consultorios.propietario_id = auth.uid()
    )
  );

CREATE POLICY "Service can manage stripe payments" ON stripe_payments
  FOR ALL USING (auth.role() = 'service_role');

-- Políticas RLS para stripe_webhooks (solo service role)
CREATE POLICY "Service can manage webhooks" ON stripe_webhooks
  FOR ALL USING (auth.role() = 'service_role');

-- Triggers para updated_at
CREATE TRIGGER update_stripe_accounts_updated_at 
  BEFORE UPDATE ON stripe_accounts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_payments_updated_at 
  BEFORE UPDATE ON stripe_payments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Función para obtener información de pagos de un propietario
CREATE OR REPLACE FUNCTION get_owner_earnings(owner_id UUID, start_date DATE DEFAULT NULL, end_date DATE DEFAULT NULL)
RETURNS TABLE (
  total_earnings DECIMAL,
  total_transactions INTEGER,
  total_fees DECIMAL,
  avg_transaction DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(sp.amount_net::DECIMAL / 100), 0) as total_earnings,
    COUNT(sp.id)::INTEGER as total_transactions,
    COALESCE(SUM(sp.amount_application_fee::DECIMAL / 100), 0) as total_fees,
    COALESCE(AVG(sp.amount_net::DECIMAL / 100), 0) as avg_transaction
  FROM stripe_payments sp
  JOIN reservas r ON r.id = sp.reserva_id
  JOIN consultorios c ON c.id = r.consultorio_id
  WHERE c.propietario_id = owner_id
    AND sp.payment_status = 'succeeded'
    AND (start_date IS NULL OR r.created_at >= start_date)
    AND (end_date IS NULL OR r.created_at <= end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actualizar tabla reservas para incluir referencia a pago
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS stripe_payment_id UUID REFERENCES stripe_payments(id);
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded'));

-- Índice para la nueva columna
CREATE INDEX IF NOT EXISTS idx_reservas_payment_status ON reservas(payment_status);
