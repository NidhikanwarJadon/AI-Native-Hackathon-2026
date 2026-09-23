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
  // still accept one created before a complexity rule existed.
  password: z
    .string()
    .min(1, enTranslation.validation.required)
    .max(128, enTranslation.validation.passwordTooLong),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const loginFormInitialValues: LoginFormValues = {
  email: '',
  password: '',
};
