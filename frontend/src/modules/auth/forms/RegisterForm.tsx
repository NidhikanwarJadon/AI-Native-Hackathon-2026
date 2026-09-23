import { Formik, Form, Field, type FieldProps } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { Link } from 'react-router-dom';
import { Button, Card, Form as AntForm, Input, Typography } from 'antd';
import {
  registerFormSchema,
  registerFormInitialValues,
  type RegisterFormValues,
} from '../schema/registerFormSchema';
import useRegister from '../hooks/useRegister';
import { enTranslation } from '../../../translations/enTranslation';
import '../css/authPages.css';

const RegisterForm = () => {
  const [{ isLoading }, { handleRegister }] = useRegister();

  return (
    <div className="authPage-container">
      <Card className="authPage-card">
        <Typography.Title level={3} className="authPage-title">
          {enTranslation.headerTitles.register}
        </Typography.Title>
        <Formik<RegisterFormValues>
          initialValues={registerFormInitialValues}
          validationSchema={toFormikValidationSchema(registerFormSchema)}
          onSubmit={handleRegister}
        >
          <Form>
            {/* component={false} gives Form.Item the vertical-layout context
                without rendering a second <form> inside Formik's. */}
            <AntForm component={false} layout="vertical">
            <Field name="fullName">
              {({ field, meta }: FieldProps<string>) => (
                <AntForm.Item
                  label={enTranslation.labels.fullName}
                  validateStatus={meta.touched && meta.error ? 'error' : ''}
                  help={meta.touched ? meta.error : undefined}
                >
                  <Input {...field} autoComplete="name" />
                </AntForm.Item>
              )}
            </Field>
            <Field name="email">
              {({ field, meta }: FieldProps<string>) => (
                <AntForm.Item
                  label={enTranslation.labels.email}
                  validateStatus={meta.touched && meta.error ? 'error' : ''}
                  help={meta.touched ? meta.error : undefined}
                >
                  <Input {...field} autoComplete="email" />
                </AntForm.Item>
              )}
            </Field>
            <Field name="password">
              {({ field, meta }: FieldProps<string>) => (
                <AntForm.Item
                  label={enTranslation.labels.password}
                  validateStatus={meta.touched && meta.error ? 'error' : ''}
                  help={meta.touched ? meta.error : undefined}
                >
                  <Input.Password {...field} autoComplete="new-password" />
                </AntForm.Item>
              )}
            </Field>
            <Field name="confirmPassword">
              {({ field, meta }: FieldProps<string>) => (
                <AntForm.Item
                  label={enTranslation.labels.confirmPassword}
                  validateStatus={meta.touched && meta.error ? 'error' : ''}
                  help={meta.touched ? meta.error : undefined}
                >
                  <Input.Password {...field} autoComplete="new-password" />
                </AntForm.Item>
              )}
            </Field>
            <AntForm.Item className="authPage-submitItem">
              <Button type="primary" htmlType="submit" block loading={isLoading}>
                {enTranslation.buttons.register}
              </Button>
            </AntForm.Item>
            </AntForm>
          </Form>
        </Formik>
        <Typography.Paragraph className="authPage-footerLink">
          {enTranslation.labels.haveAccount} <Link to="/login">{enTranslation.buttons.login}</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
};

export default RegisterForm;
