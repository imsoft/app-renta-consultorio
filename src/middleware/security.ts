import { NextRequest, NextResponse } from 'next/server';
import { validateUUID } from '@/lib/security';

// ============================================================================
// MIDDLEWARE DE SEGURIDAD
// ============================================================================

// Cache simple para rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Configuración de rate limiting
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos
const RATE_LIMIT_MAX_REQUESTS = 100; // máximo 100 requests por ventana

export function rateLimitMiddleware(request: NextRequest): NextResponse | null {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  
  // Obtener o crear registro para este IP
  const record = requestCounts.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  // Si la ventana de tiempo ha expirado, resetear
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + RATE_LIMIT_WINDOW;
  }
  
  // Incrementar contador
  record.count++;
  requestCounts.set(ip, record);
  
  // Verificar si excede el límite
  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' },
      { status: 429 }
    );
  }
  
  return null;
}

// ============================================================================
// VALIDACIÓN DE PARÁMETROS
// ============================================================================

export function validateParamsMiddleware(request: NextRequest): NextResponse | null {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Validar UUIDs en rutas dinámicas
  const uuidPattern = /\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/;
  const matches = pathname.match(uuidPattern);
  
  if (matches) {
    const uuid = matches[0].substring(1); // Remover el slash inicial
    if (!validateUUID(uuid)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
  }
  
  return null;
}

// ============================================================================
// HEADERS DE SEGURIDAD
// ============================================================================

export function securityHeadersMiddleware(request: NextRequest): NextResponse | null {
  const response = NextResponse.next();
  
  // Headers de seguridad
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self'",
    "connect-src 'self' https://api.stripe.com https://*.supabase.co",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  return null;
}

// ============================================================================
// VALIDACIÓN DE CONTENIDO
// ============================================================================

export function validateContentMiddleware(request: NextRequest): NextResponse | null {
  // Solo validar en POST/PUT/PATCH requests
  if (!['POST', 'PUT', 'PATCH'].includes(request.method)) {
    return null;
  }
  
  const contentType = request.headers.get('content-type');
  
  // Validar que sea JSON
  if (contentType && !contentType.includes('application/json')) {
    return NextResponse.json(
      { error: 'Content-Type debe ser application/json' },
      { status: 400 }
    );
  }
  
  return null;
}

// ============================================================================
// MIDDLEWARE PRINCIPAL
// ============================================================================

export function securityMiddleware(request: NextRequest): NextResponse | null {
  // Aplicar rate limiting
  const rateLimitResult = rateLimitMiddleware(request);
  if (rateLimitResult) return rateLimitResult;
  
  // Validar parámetros
  const paramsResult = validateParamsMiddleware(request);
  if (paramsResult) return paramsResult;
  
  // Validar contenido
  const contentResult = validateContentMiddleware(request);
  if (contentResult) return contentResult;
  
  // Aplicar headers de seguridad
  const headersResult = securityHeadersMiddleware(request);
  if (headersResult) return headersResult;
  
  return null;
}

// ============================================================================
// UTILIDADES
// ============================================================================

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
  return phoneRegex.test(phone);
}

// ============================================================================
// LOGGING SEGURO
// ============================================================================

export function logSecurityEvent(event: string, details: any = {}): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details: {
      ...details,
      // Remover información sensible
      password: undefined,
      token: undefined,
      secret: undefined
    }
  };
  
  console.log('[SECURITY]', JSON.stringify(logEntry));
}
