import { z } from 'zod';
import { enTranslation } from '../../../translations/enTranslation';

export const forgotPasswordFormSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, enTranslation.validation.required)
    .max(254, enTranslation.validation.emailTooLong)
    .email(enTranslation.validation.invalidEmail),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export const forgotPasswordFormInitialValues: ForgotPasswordFormValues = {
  email: '',
};
