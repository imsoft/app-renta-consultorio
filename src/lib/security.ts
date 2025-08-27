import { z } from 'zod';

// ============================================================================
// VALIDACIÓN DE UUID
// ============================================================================

export const uuidSchema = z.string().uuid('ID inválido');

export const validateUUID = (id: string): boolean => {
  try {
    uuidSchema.parse(id);
    return true;
  } catch {
    return false;
  }
};

export const validateUUIDOrThrow = (id: string): string => {
  return uuidSchema.parse(id);
};

// ============================================================================
// VALIDACIÓN DE URLs
// ============================================================================

export const validateImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    const allowedProtocols = ['https:', 'http:'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    
    const hasValidProtocol = allowedProtocols.includes(urlObj.protocol);
    const hasValidExtension = allowedExtensions.some(ext => 
      urlObj.pathname.toLowerCase().endsWith(ext)
    );
    
    return hasValidProtocol && hasValidExtension;
  } catch {
    return false;
  }
};

export const sanitizeUrl = (url: string): string | null => {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    // Solo permitir HTTPS en producción
    if (process.env.NODE_ENV === 'production' && urlObj.protocol !== 'https:') {
      return null;
    }
    return urlObj.toString();
  } catch {
    return null;
  }
};

// ============================================================================
// VALIDACIÓN DE ARCHIVOS
// ============================================================================

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ];
  
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, WebP, GIF)' 
    };
  }
  
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'El archivo es demasiado grande. Máximo 5MB' 
    };
  }
  
  return { valid: true };
};

// ============================================================================
// SANITIZACIÓN DE TEXTO
// ============================================================================

export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  // Remover caracteres peligrosos para XSS
  return text
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim();
};

export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  // Lista de tags permitidos (muy restrictiva)
  const allowedTags = ['b', 'i', 'em', 'strong', 'br'];
  
  // Remover todos los tags excepto los permitidos
  let sanitized = html.replace(/<[^>]*>/g, (match) => {
    const tagName = match.replace(/[<>/]/g, '').split(' ')[0].toLowerCase();
    return allowedTags.includes(tagName) ? match : '';
  });
  
  return sanitized;
};

// ============================================================================
// VALIDACIÓN DE EMAIL
// ============================================================================

export const emailSchema = z.string().email('Email inválido');

export const validateEmail = (email: string): boolean => {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
};

// ============================================================================
// VALIDACIÓN DE TELÉFONO
// ============================================================================

export const phoneSchema = z.string()
  .min(10, 'El teléfono debe tener al menos 10 dígitos')
  .max(15, 'El teléfono no puede exceder 15 dígitos')
  .regex(/^[\d\s\-\+\(\)]+$/, 'El teléfono solo puede contener números, espacios, guiones y paréntesis');

export const validatePhone = (phone: string): boolean => {
  try {
    phoneSchema.parse(phone);
    return true;
  } catch {
    return false;
  }
};

// ============================================================================
// LOGGING SEGURO
// ============================================================================

export const secureLog = (message: string, error?: any): void => {
  console.log(`[${new Date().toISOString()}] ${message}`);
  
  if (error) {
    // Solo loggear información no sensible
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    // En desarrollo, loggear más detalles
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error:', error);
    }
  }
};

// ============================================================================
// VALIDACIÓN DE PRECIOS
// ============================================================================

export const priceSchema = z.number()
  .min(0, 'El precio no puede ser negativo')
  .max(100000, 'El precio no puede exceder $100,000');

export const validatePrice = (price: number): boolean => {
  try {
    priceSchema.parse(price);
    return true;
  } catch {
    return false;
  }
};

// ============================================================================
// VALIDACIÓN DE FECHAS
// ============================================================================

export const validateDate = (date: string): boolean => {
  try {
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime()) && dateObj > new Date();
  } catch {
    return false;
  }
};

export const validateTime = (time: string): boolean => {
  try {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  } catch {
    return false;
  }
};

// ============================================================================
// UTILIDADES DE SEGURIDAD
// ============================================================================

export const generateSecureId = (): string => {
  return crypto.randomUUID();
};

export const hashString = async (text: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// ============================================================================
// VALIDACIÓN DE FORMULARIOS
// ============================================================================

export const validateConsultorioData = (data: any) => {
  const schema = z.object({
    titulo: z.string().min(3).max(100),
    descripcion: z.string().min(20).max(1000),
    direccion: z.string().min(10).max(200),
    ciudad: z.string().min(2).max(50),
    estado: z.string().min(2).max(50),
    precio_por_hora: priceSchema,
    especialidades: z.array(z.string()).min(1).max(10),
  });
  
  return schema.safeParse(data);
};

export const validateReservaData = (data: any) => {
  const schema = z.object({
    consultorio_id: uuidSchema,
    fecha_inicio: z.string().refine(validateDate, 'Fecha inválida'),
    hora_inicio: z.string().refine(validateTime, 'Hora inválida'),
    notas: z.string().max(500).optional(),
  });
  
  return schema.safeParse(data);
};
