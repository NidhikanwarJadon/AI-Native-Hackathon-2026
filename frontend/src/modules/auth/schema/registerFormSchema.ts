import { z } from 'zod';
import { enTranslation } from '../../../translations/enTranslation';

export const registerFormSchema = z
  .object({
    // Single field, matching the backend's UserCreate.full_name exactly —
    // it has no separate first/last name columns, and splitting a name
    // client-side just to recombine it on submit invents a distinction the
    // data model doesn't have (and can't cleanly reverse later, e.g. when
    // displaying a stored full_name back in an edit form).
    fullName: z
      .string()
      .trim()
      .min(1, enTranslation.validation.required)
      .max(255, enTranslation.validation.tooLong),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, enTranslation.validation.required)
      .max(254, enTranslation.validation.emailTooLong)
      .email(enTranslation.validation.invalidEmail),
    // 72 is bcrypt's own byte limit (backend/app/core/security.py) — the
    // backend rejects anything longer, so accepting more here just moves
    // the rejection from this form to a confusing 422 after submit.
    password: z
      .string()
      .min(1, enTranslation.validation.required)
      .min(8, enTranslation.validation.passwordTooShort)
      .max(72, enTranslation.validation.passwordTooLong)
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
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
};
