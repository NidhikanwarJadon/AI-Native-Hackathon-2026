import { z } from 'zod';
import { enTranslation } from '../../../translations/enTranslation';

export const registerFormSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, enTranslation.validation.required)
      .max(100, enTranslation.validation.tooLong),
    lastName: z
      .string()
      .trim()
      .min(1, enTranslation.validation.required)
      .max(100, enTranslation.validation.tooLong),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, enTranslation.validation.required)
      .max(254, enTranslation.validation.emailTooLong)
      .email(enTranslation.validation.invalidEmail),
    password: z
      .string()
      .min(1, enTranslation.validation.required)
      .min(8, enTranslation.validation.passwordTooShort)
      .max(128, enTranslation.validation.passwordTooLong)
      .regex(/[a-z]/, enTranslation.validation.passwordNeedsLowercase)
      .regex(/[A-Z]/, enTranslation.validation.passwordNeedsUppercase)
      .regex(/[0-9]/, enTranslation.validation.passwordNeedsNumber),
    confirmPassword: z.string().min(1, enTranslation.validation.required),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: enTranslation.validation.passwordsMustMatch,
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const registerFormInitialValues: RegisterFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};
