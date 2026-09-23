import { z } from 'zod';
import { enTranslation } from '../../../translations/enTranslation';

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, enTranslation.validation.required)
    .max(254, enTranslation.validation.emailTooLong)
    .email(enTranslation.validation.invalidEmail),
  // No complexity rule here — this validates an existing password, and must
  // still accept one created before a complexity rule existed. 72 is
  // bcrypt's own byte limit (backend/app/core/security.py), not a style
  // choice — the backend never accepted anything longer than this anyway.
  password: z
    .string()
    .min(1, enTranslation.validation.required)
    .max(72, enTranslation.validation.passwordTooLong),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const loginFormInitialValues: LoginFormValues = {
  email: '',
  password: '',
};
