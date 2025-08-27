import { NextRequest, NextResponse } from 'next/server';
import { detectSqlInjection, detectXssAttempt, logSecurityEvent } from '@/lib/security-monitoring';

// ============================================================================
// CONFIGURACIÓN DEL WAF
// ============================================================================

interface WAFRule {
  id: string;
  name: string;
  pattern: RegExp;
  action: 'block' | 'log' | 'challenge';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

interface WAFConfig {
  enabled: boolean;
  blockMode: boolean;
  logMode: boolean;
  challengeMode: boolean;
  whitelist: string[];
  blacklist: string[];
  rateLimit: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
}

// ============================================================================
// REGLAS DEL WAF
// ============================================================================

class WebApplicationFirewall {
  private rules: WAFRule[] = [];
  private config: WAFConfig;
  private requestCounts = new Map<string, { count: number; resetTime: number }>();

  constructor() {
    this.config = {
      enabled: true,
      blockMode: true,
      logMode: true,
      challengeMode: false,
      whitelist: [],
      blacklist: [],
      rateLimit: {
        enabled: true,
        maxRequests: 100,
        windowMs: 15 * 60 * 1000 // 15 minutos
      }
    };

    this.initializeRules();
  }

  private initializeRules() {
    this.rules = [
      // Reglas de inyección SQL
      {
        id: 'sql_injection_1',
        name: 'SQL Injection - UNION',
        pattern: /\bunion\s+select\b/gi,
        action: 'block',
        severity: 'critical',
        enabled: true
      },
      {
        id: 'sql_injection_2',
        name: 'SQL Injection - DROP',
        pattern: /\bdrop\s+table\b/gi,
        action: 'block',
        severity: 'critical',
        enabled: true
      },
      {
        id: 'sql_injection_3',
        name: 'SQL Injection - DELETE',
        pattern: /\bdelete\s+from\b/gi,
        action: 'block',
        severity: 'high',
        enabled: true
      },

      // Reglas de XSS
      {
        id: 'xss_1',
        name: 'XSS - Script Tags',
        pattern: /<script[^>]*>/gi,
        action: 'block',
        severity: 'critical',
        enabled: true
      },
      {
        id: 'xss_2',
        name: 'XSS - JavaScript Protocol',
        pattern: /javascript:/gi,
        action: 'block',
        severity: 'high',
        enabled: true
      },
      {
        id: 'xss_3',
        name: 'XSS - Event Handlers',
        pattern: /on\w+\s*=/gi,
        action: 'block',
        severity: 'high',
        enabled: true
      },

      // Reglas de Path Traversal
      {
        id: 'path_traversal_1',
        name: 'Path Traversal - Directory',
        pattern: /\.\.\//g,
        action: 'block',
        severity: 'high',
        enabled: true
      },
      {
        id: 'path_traversal_2',
        name: 'Path Traversal - Windows',
        pattern: /\.\.\\/g,
        action: 'block',
        severity: 'high',
        enabled: true
      },

      // Reglas de Command Injection
      {
        id: 'command_injection_1',
        name: 'Command Injection - System',
        pattern: /\bsystem\s*\(/gi,
        action: 'block',
        severity: 'critical',
        enabled: true
      },
      {
        id: 'command_injection_2',
        name: 'Command Injection - Exec',
        pattern: /\bexec\s*\(/gi,
        action: 'block',
        severity: 'critical',
        enabled: true
      },

      // Reglas de LFI/RFI
      {
        id: 'file_inclusion_1',
        name: 'File Inclusion - Include',
        pattern: /include\s*\(/gi,
        action: 'block',
        severity: 'high',
        enabled: true
      },
      {
        id: 'file_inclusion_2',
        name: 'File Inclusion - Require',
        pattern: /require\s*\(/gi,
        action: 'block',
        severity: 'high',
        enabled: true
      },

      // Reglas de Headers Maliciosos
      {
        id: 'malicious_headers_1',
        name: 'Malicious Headers - X-Forwarded-For',
        pattern: /x-forwarded-for:\s*[^,\s]+/gi,
        action: 'log',
        severity: 'medium',
        enabled: true
      },

      // Reglas de User Agent Sospechoso
      {
        id: 'suspicious_ua_1',
        name: 'Suspicious User Agent - Scanner',
        pattern: /(nmap|sqlmap|nikto|w3af|burp)/gi,
        action: 'block',
        severity: 'high',
        enabled: true
      }
    ];
  }

  // ============================================================================
  // ANÁLISIS DE REQUEST
  // ============================================================================

  async analyzeRequest(request: NextRequest): Promise<WAFResult> {
    if (!this.config.enabled) {
      return { allowed: true, reason: 'WAF disabled' };
    }

    const ip = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    const url = request.url;
    const method = request.method;

    // Verificar whitelist
    if (this.isWhitelisted(ip)) {
      return { allowed: true, reason: 'IP whitelisted' };
    }

    // Verificar blacklist
    if (this.isBlacklisted(ip)) {
      return { allowed: false, reason: 'IP blacklisted' };
    }

    // Rate limiting
    if (this.config.rateLimit.enabled) {
      const rateLimitResult = this.checkRateLimit(ip);
      if (!rateLimitResult.allowed) {
        return rateLimitResult;
      }
    }

    // Analizar URL
    const urlResult = await this.analyzeURL(url);
    if (!urlResult.allowed) {
      return urlResult;
    }

    // Analizar User Agent
    const uaResult = this.analyzeUserAgent(userAgent);
    if (!uaResult.allowed) {
      return uaResult;
    }

    // Analizar headers
    const headersResult = this.analyzeHeaders(request);
    if (!headersResult.allowed) {
      return headersResult;
    }

    // Analizar body (para POST/PUT requests)
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const bodyResult = await this.analyzeBody(request);
      if (!bodyResult.allowed) {
        return bodyResult;
      }
    }

    return { allowed: true, reason: 'Request passed all checks' };
  }

  // ============================================================================
  // ANÁLISIS ESPECÍFICOS
  // ============================================================================

  private async analyzeURL(url: string): Promise<WAFResult> {
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      if (rule.pattern.test(url)) {
        await this.handleRuleViolation(rule, { url });
        
        if (rule.action === 'block') {
          return {
            allowed: false,
            reason: `Blocked by WAF rule: ${rule.name}`,
            rule: rule
          };
        }
      }
    }

    return { allowed: true, reason: 'URL analysis passed' };
  }

  private analyzeUserAgent(userAgent: string): WAFResult {
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      if (rule.pattern.test(userAgent)) {
        this.handleRuleViolation(rule, { userAgent });
        
        if (rule.action === 'block') {
          return {
            allowed: false,
            reason: `Blocked by WAF rule: ${rule.name}`,
            rule: rule
          };
        }
      }
    }

    return { allowed: true, reason: 'User Agent analysis passed' };
  }

  private analyzeHeaders(request: NextRequest): WAFResult {
    const headers = Object.fromEntries(request.headers.entries());
    const headerString = JSON.stringify(headers);

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      if (rule.pattern.test(headerString)) {
        this.handleRuleViolation(rule, { headers });
        
        if (rule.action === 'block') {
          return {
            allowed: false,
            reason: `Blocked by WAF rule: ${rule.name}`,
            rule: rule
          };
        }
      }
    }

    return { allowed: true, reason: 'Headers analysis passed' };
  }

  private async analyzeBody(request: NextRequest): Promise<WAFResult> {
    try {
      const body = await request.text();
      
      // Verificar inyección SQL
      if (detectSqlInjection(body)) {
        await logSecurityEvent({
          eventType: 'sql_injection_attempt',
          severity: 'critical',
          details: { body: body.substring(0, 100) }
        });
        
        return {
          allowed: false,
          reason: 'SQL injection attempt detected in request body'
        };
      }

      // Verificar XSS
      if (detectXssAttempt(body)) {
        await logSecurityEvent({
          eventType: 'xss_attempt',
          severity: 'critical',
          details: { body: body.substring(0, 100) }
        });
        
        return {
          allowed: false,
          reason: 'XSS attempt detected in request body'
        };
      }

      // Verificar reglas del WAF
      for (const rule of this.rules) {
        if (!rule.enabled) continue;

        if (rule.pattern.test(body)) {
          await this.handleRuleViolation(rule, { body: body.substring(0, 100) });
          
          if (rule.action === 'block') {
            return {
              allowed: false,
              reason: `Blocked by WAF rule: ${rule.name}`,
              rule: rule
            };
          }
        }
      }

      return { allowed: true, reason: 'Body analysis passed' };
    } catch (error) {
      // Si no se puede leer el body, permitir la request
      return { allowed: true, reason: 'Body analysis skipped (unreadable)' };
    }
  }

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  private getClientIP(request: NextRequest): string {
    return request.ip || 
           request.headers.get('x-forwarded-for') || 
           request.headers.get('x-real-ip') || 
           'unknown';
  }

  private isWhitelisted(ip: string): boolean {
    return this.config.whitelist.includes(ip);
  }

  private isBlacklisted(ip: string): boolean {
    return this.config.blacklist.includes(ip);
  }

  private checkRateLimit(ip: string): WAFResult {
    const now = Date.now();
    const record = this.requestCounts.get(ip) || { 
      count: 0, 
      resetTime: now + this.config.rateLimit.windowMs 
    };

    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + this.config.rateLimit.windowMs;
    }

    record.count++;
    this.requestCounts.set(ip, record);

    if (record.count > this.config.rateLimit.maxRequests) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded'
      };
    }

    return { allowed: true, reason: 'Rate limit check passed' };
  }

  private async handleRuleViolation(rule: WAFRule, context: any) {
    if (this.config.logMode) {
      await logSecurityEvent({
        eventType: 'suspicious_activity',
        severity: rule.severity,
        details: {
          rule: rule.name,
          pattern: rule.pattern.toString(),
          context
        }
      });
    }
  }

  // ============================================================================
  // CONFIGURACIÓN
  // ============================================================================

  enable(): void {
    this.config.enabled = true;
  }

  disable(): void {
    this.config.enabled = false;
  }

  addToWhitelist(ip: string): void {
    if (!this.config.whitelist.includes(ip)) {
      this.config.whitelist.push(ip);
    }
  }

  addToBlacklist(ip: string): void {
    if (!this.config.blacklist.includes(ip)) {
      this.config.blacklist.push(ip);
    }
  }

  removeFromWhitelist(ip: string): void {
    this.config.whitelist = this.config.whitelist.filter(ip => ip !== ip);
  }

  removeFromBlacklist(ip: string): void {
    this.config.blacklist = this.config.blacklist.filter(ip => ip !== ip);
  }

  getStats(): WAFStats {
    return {
      enabled: this.config.enabled,
      rulesCount: this.rules.length,
      enabledRules: this.rules.filter(r => r.enabled).length,
      whitelistCount: this.config.whitelist.length,
      blacklistCount: this.config.blacklist.length,
      requestCounts: Object.fromEntries(this.requestCounts)
    };
  }
}

// ============================================================================
// TIPOS
// ============================================================================

interface WAFResult {
  allowed: boolean;
  reason: string;
  rule?: WAFRule;
}

interface WAFStats {
  enabled: boolean;
  rulesCount: number;
  enabledRules: number;
  whitelistCount: number;
  blacklistCount: number;
  requestCounts: Record<string, any>;
}

// ============================================================================
// INSTANCIA GLOBAL
// ============================================================================

export const waf = new WebApplicationFirewall();

// ============================================================================
// MIDDLEWARE DE WAF
// ============================================================================

export async function wafMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const result = await waf.analyzeRequest(request);

  if (!result.allowed) {
    console.log(`🚨 WAF BLOCKED: ${result.reason}`);
    
    return NextResponse.json(
      { 
        error: 'Access denied',
        reason: result.reason,
        timestamp: new Date().toISOString()
      },
      { status: 403 }
    );
  }

  return null;
}
