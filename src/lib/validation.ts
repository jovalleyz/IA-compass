import { z } from 'zod';

// Profile validation schema
export const profileSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es requerido").max(100, "El nombre debe tener máximo 100 caracteres"),
  email: z.string().email("Correo electrónico inválido").max(255, "El correo debe tener máximo 255 caracteres"),
  telefono: z.string().regex(/^\+?[0-9\s-]{8,20}$/, "Formato de teléfono inválido").optional().or(z.literal('')),
  empresa: z.string().max(200, "La empresa debe tener máximo 200 caracteres").optional().or(z.literal('')),
  pais: z.string().max(100, "El país debe tener máximo 100 caracteres").optional().or(z.literal('')),
});

// Question answer validation schema
export const questionAnswerSchema = z.object({
  answers: z.record(z.union([
    z.string().max(5000, "La respuesta debe tener máximo 5000 caracteres"),
    z.number().min(1).max(5),
    z.boolean()
  ]))
});

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// Signup validation schema
export const signupSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es requerido").max(100, "El nombre debe tener máximo 100 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
    .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número")
    .regex(/[^A-Za-z0-9]/, "La contraseña debe contener al menos un caracter especial"),
});

// Password change validation schema
export const passwordChangeSchema = z.object({
  newPassword: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
    .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número")
    .regex(/[^A-Za-z0-9]/, "La contraseña debe contener al menos un carácter especial"),
  confirmPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// Password reset request validation schema
export const passwordResetRequestSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
export type PasswordResetRequestFormData = z.infer<typeof passwordResetRequestSchema>;
