import { z } from 'zod';

// Password validation schema with enhanced security
export const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
    'A senha deve conter pelo menos 1 letra minúscula, 1 maiúscula e 1 número');

// Profile validation
export const profileSchema = z.object({
  display_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  email: z.string().email('Email inválido').optional(),
});

// Process validation
export const processSchema = z.object({
  number: z
    .string()
    .min(1, 'Número do processo é obrigatório')
    .max(50, 'Número muito longo')
    .regex(/^[A-Z0-9\/\s\-\.ªº]+$/i, 'Formato inválido para número do processo'),
  type: z.enum(['IP', 'TC', 'PAAI']),
  status: z.string().min(1, 'Status é obrigatório').max(100, 'Status muito longo'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  forwarding: z.string().min(1, 'Encaminhamento é obrigatório').max(100, 'Encaminhamento muito longo'),
  summary: z.string().max(1000, 'Resumo muito longo').optional(),
  pending_actions: z
    .array(z.string().max(500, 'Ação muito longa'))
    .max(20, 'Máximo 20 ações pendentes'),
});

// Configuration validation
export const configItemSchema = z
  .string()
  .min(1, 'Campo é obrigatório')
  .max(100, 'Texto muito longo')
  .regex(/^[a-zA-ZÀ-ÿ0-9\s\-\.ªº°]+$/, 'Caracteres inválidos detectados');

// Sanitization functions
export const sanitizeText = (text: string): string => {
  return text
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potential XSS characters
    .substring(0, 1000); // Limit length
};

export const sanitizeHtml = (html: string): string => {
  // For chart component - only allow safe CSS color values
  return html.replace(/[<>\"'&]/g, '');
};

// Validation helper
export const validateAndSanitize = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.issues.map(e => e.message).join(', ') 
      };
    }
    return { success: false, error: 'Erro de validação' };
  }
};