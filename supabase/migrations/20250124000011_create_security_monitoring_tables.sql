-- ============================================================================
-- TABLAS PARA MONITOREO DE SEGURIDAD
-- ============================================================================

-- Tabla para eventos de seguridad
CREATE TABLE IF NOT EXISTS security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'login_attempt',
    'failed_auth',
    'suspicious_activity',
    'rate_limit_exceeded',
    'sql_injection_attempt',
    'xss_attempt'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID REFERENCES profiles(id),
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para alertas de seguridad
CREATE TABLE IF NOT EXISTS security_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id TEXT NOT NULL,
  rule_name TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  events JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para configuración del WAF
CREATE TABLE IF NOT EXISTS waf_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Tabla para logs del WAF
CREATE TABLE IF NOT EXISTS waf_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET NOT NULL,
  user_agent TEXT,
  request_url TEXT,
  request_method TEXT,
  rule_id TEXT,
  rule_name TEXT,
  action TEXT CHECK (action IN ('block', 'log', 'challenge')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================================

-- Índices para security_events
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address ON security_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(resolved);

-- Índices para security_alerts
CREATE INDEX IF NOT EXISTS idx_security_alerts_timestamp ON security_alerts(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_resolved ON security_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_security_alerts_rule_id ON security_alerts(rule_id);

-- Índices para waf_logs
CREATE INDEX IF NOT EXISTS idx_waf_logs_timestamp ON waf_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_waf_logs_ip_address ON waf_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_waf_logs_action ON waf_logs(action);
CREATE INDEX IF NOT EXISTS idx_waf_logs_severity ON waf_logs(severity);

-- ============================================================================
-- POLÍTICAS RLS
-- ============================================================================

-- Políticas para security_events
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage security events" ON security_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own security events" ON security_events
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas para security_alerts
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage security alerts" ON security_alerts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view security alerts" ON security_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Políticas para waf_config
ALTER TABLE waf_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage WAF config" ON waf_config
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view WAF config" ON waf_config
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Políticas para waf_logs
ALTER TABLE waf_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage WAF logs" ON waf_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view WAF logs" ON waf_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- FUNCIONES ÚTILES
-- ============================================================================

-- Función para limpiar eventos antiguos
CREATE OR REPLACE FUNCTION cleanup_old_security_events(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM security_events 
  WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas de seguridad
CREATE OR REPLACE FUNCTION get_security_stats(hours_back INTEGER DEFAULT 24)
RETURNS TABLE(
  total_events BIGINT,
  critical_events BIGINT,
  high_events BIGINT,
  medium_events BIGINT,
  low_events BIGINT,
  active_alerts BIGINT,
  blocked_requests BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE se.timestamp > NOW() - INTERVAL '1 hour' * hours_back) as total_events,
    COUNT(*) FILTER (WHERE se.timestamp > NOW() - INTERVAL '1 hour' * hours_back AND se.severity = 'critical') as critical_events,
    COUNT(*) FILTER (WHERE se.timestamp > NOW() - INTERVAL '1 hour' * hours_back AND se.severity = 'high') as high_events,
    COUNT(*) FILTER (WHERE se.timestamp > NOW() - INTERVAL '1 hour' * hours_back AND se.severity = 'medium') as medium_events,
    COUNT(*) FILTER (WHERE se.timestamp > NOW() - INTERVAL '1 hour' * hours_back AND se.severity = 'low') as low_events,
    COUNT(*) FILTER (WHERE sa.resolved = FALSE) as active_alerts,
    COUNT(*) FILTER (WHERE wl.action = 'block' AND wl.timestamp > NOW() - INTERVAL '1 hour' * hours_back) as blocked_requests
  FROM security_events se
  FULL OUTER JOIN security_alerts sa ON TRUE
  FULL OUTER JOIN waf_logs wl ON TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DATOS INICIALES
-- ============================================================================

-- Configuración inicial del WAF
INSERT INTO waf_config (config_key, config_value, description) VALUES
(
  'waf_settings',
  '{
    "enabled": true,
    "blockMode": true,
    "logMode": true,
    "challengeMode": false,
    "rateLimit": {
      "enabled": true,
      "maxRequests": 100,
      "windowMs": 900000
    }
  }',
  'Configuración principal del WAF'
),
(
  'alert_rules',
  '[
    {
      "id": "failed_login_threshold",
      "name": "Múltiples intentos de login fallidos",
      "eventType": "failed_auth",
      "threshold": 5,
      "timeWindow": 15,
      "severity": "high",
      "enabled": true
    },
    {
      "id": "rate_limit_violation",
      "name": "Violación de rate limiting",
      "eventType": "rate_limit_exceeded",
      "threshold": 1,
      "timeWindow": 1,
      "severity": "medium",
      "enabled": true
    }
  ]',
  'Reglas de alerta de seguridad'
) ON CONFLICT (config_key) DO NOTHING;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger para actualizar updated_at en waf_config
CREATE OR REPLACE FUNCTION update_waf_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_waf_config_updated_at
  BEFORE UPDATE ON waf_config
  FOR EACH ROW
  EXECUTE FUNCTION update_waf_config_updated_at();

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON TABLE security_events IS 'Registro de eventos de seguridad del sistema';
COMMENT ON TABLE security_alerts IS 'Alertas generadas por el sistema de monitoreo de seguridad';
COMMENT ON TABLE waf_config IS 'Configuración del Web Application Firewall';
COMMENT ON TABLE waf_logs IS 'Logs de actividad del WAF';

COMMENT ON FUNCTION cleanup_old_security_events IS 'Limpia eventos de seguridad antiguos';
COMMENT ON FUNCTION get_security_stats IS 'Obtiene estadísticas de seguridad del sistema';
