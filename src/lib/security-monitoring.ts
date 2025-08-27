import { createClient } from '@supabase/supabase-js';

// ============================================================================
// CONFIGURACIÓN DE MONITOREO
// ============================================================================

interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: 'login_attempt' | 'failed_auth' | 'suspicious_activity' | 'rate_limit_exceeded' | 'sql_injection_attempt' | 'xss_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, unknown>;
  resolved: boolean;
}

interface AlertRule {
  id: string;
  name: string;
  eventType: SecurityEvent['eventType'];
  threshold: number;
  timeWindow: number; // en minutos
  severity: SecurityEvent['severity'];
  enabled: boolean;
}

// ============================================================================
// CLIENTE DE MONITOREO
// ============================================================================

class SecurityMonitor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private supabase: any;
  private alertRules: AlertRule[] = [];
  private eventBuffer: SecurityEvent[] = [];
  private isMonitoring = false;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    this.initializeAlertRules();
  }

  // ============================================================================
  // INICIALIZACIÓN
  // ============================================================================

  private initializeAlertRules() {
    this.alertRules = [
      {
        id: 'failed_login_threshold',
        name: 'Múltiples intentos de login fallidos',
        eventType: 'failed_auth',
        threshold: 5,
        timeWindow: 15,
        severity: 'high',
        enabled: true
      },
      {
        id: 'rate_limit_violation',
        name: 'Violación de rate limiting',
        eventType: 'rate_limit_exceeded',
        threshold: 1,
        timeWindow: 1,
        severity: 'medium',
        enabled: true
      },
      {
        id: 'suspicious_activity',
        name: 'Actividad sospechosa detectada',
        eventType: 'suspicious_activity',
        threshold: 1,
        timeWindow: 5,
        severity: 'high',
        enabled: true
      },
      {
        id: 'sql_injection_attempt',
        name: 'Intento de inyección SQL',
        eventType: 'sql_injection_attempt',
        threshold: 1,
        timeWindow: 1,
        severity: 'critical',
        enabled: true
      },
      {
        id: 'xss_attempt',
        name: 'Intento de XSS',
        eventType: 'xss_attempt',
        threshold: 1,
        timeWindow: 1,
        severity: 'critical',
        enabled: true
      }
    ];
  }

  // ============================================================================
  // REGISTRO DE EVENTOS
  // ============================================================================

  async logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>): Promise<SecurityEvent> {
    const securityEvent: SecurityEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      resolved: false
    };

    // Agregar al buffer
    this.eventBuffer.push(securityEvent);

    // Guardar en base de datos
    try {
      const { error } = await this.supabase
        .from('security_events')
        .insert(securityEvent);

      if (error) {
        console.error('Error al guardar evento de seguridad:', error);
      }
    } catch (error) {
      console.error('Error al guardar evento de seguridad:', error);
    }

    // Verificar alertas
    await this.checkAlertRules(securityEvent);

    return securityEvent;
  }

  // ============================================================================
  // VERIFICACIÓN DE ALERTAS
  // ============================================================================

  private async checkAlertRules(event: SecurityEvent) {
    const relevantRules = this.alertRules.filter(rule => 
      rule.eventType === event.eventType && rule.enabled
    );

    for (const rule of relevantRules) {
      const recentEvents = this.eventBuffer.filter(e => 
        e.eventType === rule.eventType &&
        new Date(e.timestamp).getTime() > Date.now() - (rule.timeWindow * 60 * 1000)
      );

      if (recentEvents.length >= rule.threshold) {
        await this.triggerAlert(rule, recentEvents);
      }
    }
  }

  // ============================================================================
  // ACTIVACIÓN DE ALERTAS
  // ============================================================================

  private async triggerAlert(rule: AlertRule, events: SecurityEvent[]) {
    const alert = {
      id: crypto.randomUUID(),
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      timestamp: new Date().toISOString(),
      events: events,
      resolved: false
    };

    // Guardar alerta
    try {
      const { error } = await this.supabase
        .from('security_alerts')
        .insert(alert);

      if (error) {
        console.error('Error al guardar alerta:', error);
      }
    } catch (error) {
      console.error('Error al guardar alerta:', error);
    }

    // Enviar notificación
    await this.sendNotification(alert);

    console.log(`🚨 ALERTA DE SEGURIDAD: ${rule.name} (${rule.severity})`);
  }

  // ============================================================================
  // NOTIFICACIONES
  // ============================================================================

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async sendNotification(alert: any) {
    // Aquí puedes integrar con servicios como:
    // - Slack
    // - Discord
    // - Email
    // - SMS
    // - PagerDuty

    const message = {
      text: `🚨 ALERTA DE SEGURIDAD`,
      attachments: [{
        color: this.getSeverityColor(alert.severity),
        fields: [
          {
            title: 'Regla',
            value: alert.ruleName,
            short: true
          },
          {
            title: 'Severidad',
            value: alert.severity.toUpperCase(),
            short: true
          },
          {
            title: 'Eventos',
            value: alert.events.length.toString(),
            short: true
          },
          {
            title: 'Timestamp',
            value: new Date(alert.timestamp).toLocaleString(),
            short: true
          }
        ]
      }]
    };

    // Ejemplo para Slack (requiere configuración)
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        });
      } catch (error) {
        console.error('Error al enviar notificación a Slack:', error);
      }
    }

    // Log local
    console.log('📢 NOTIFICACIÓN ENVIADA:', message);
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff6600';
      case 'medium': return '#ffcc00';
      case 'low': return '#00cc00';
      default: return '#999999';
    }
  }

  // ============================================================================
  // DETECCIÓN DE PATRONES SOSPECHOSOS
  // ============================================================================

  detectSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter)\b)/gi,
      /(\b(or|and)\b\s+\d+\s*=\s*\d+)/gi,
      /(\b(union|select)\b.*\bfrom\b)/gi,
      /(--|\/\*|\*\/)/g,
      /(\b(exec|execute)\b)/gi
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  detectXssAttempt(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  detectSuspiciousActivity(userId: string, action: string): boolean {
    // Detectar patrones sospechosos
    const suspiciousPatterns = [
      /admin/i,
      /password/i,
      /delete/i,
      /drop/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(action));
  }

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  async getRecentEvents(minutes: number = 60): Promise<SecurityEvent[]> {
    const cutoffTime = new Date(Date.now() - (minutes * 60 * 1000)).toISOString();

    try {
      const { data, error } = await this.supabase
        .from('security_events')
        .select('*')
        .gte('timestamp', cutoffTime)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error al obtener eventos recientes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error al obtener eventos recientes:', error);
      return [];
    }
  }

  async getActiveAlerts(): Promise<Record<string, unknown>[]> {
    try {
      const { data, error } = await this.supabase
        .from('security_alerts')
        .select('*')
        .eq('resolved', false)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error al obtener alertas activas:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error al obtener alertas activas:', error);
      return [];
    }
  }

  async resolveAlert(alertId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('security_alerts')
        .update({ resolved: true })
        .eq('id', alertId);

      if (error) {
        console.error('Error al resolver alerta:', error);
      }
    } catch (error) {
      console.error('Error al resolver alerta:', error);
    }
  }

  // ============================================================================
  // INICIO/DETENCIÓN DEL MONITOREO
  // ============================================================================

  startMonitoring(): void {
    this.isMonitoring = true;
    console.log('🔒 Monitoreo de seguridad iniciado');
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('🔒 Monitoreo de seguridad detenido');
  }

  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }
}

// ============================================================================
// INSTANCIA GLOBAL
// ============================================================================

export const securityMonitor = new SecurityMonitor();

// ============================================================================
// FUNCIONES DE CONVENIENCIA
// ============================================================================

export const logSecurityEvent = securityMonitor.logEvent.bind(securityMonitor);
export const detectSqlInjection = securityMonitor.detectSqlInjection.bind(securityMonitor);
export const detectXssAttempt = securityMonitor.detectXssAttempt.bind(securityMonitor);
export const detectSuspiciousActivity = securityMonitor.detectSuspiciousActivity.bind(securityMonitor);
