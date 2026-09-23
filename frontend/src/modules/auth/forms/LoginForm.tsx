import { Formik, Form, Field, type FieldProps } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { Link } from 'react-router-dom';
import { Button, Card, Form as AntForm, Input, Typography } from 'antd';
import {
  loginFormSchema,
  loginFormInitialValues,
  type LoginFormValues,
} from '../schema/loginFormSchema';
import useLogin from '../hooks/useLogin';
import { enTranslation } from '../../../translations/enTranslation';
import '../css/authPages.css';

const LoginForm = () => {
  const [{ isLoading }, { handleLogin }] = useLogin();

  return (
    <div className="authPage-container">
      <Card className="authPage-card">
        <Typography.Title level={3} className="authPage-title">
          {enTranslation.headerTitles.login}
        </Typography.Title>
        <Formik<LoginFormValues>
          initialValues={loginFormInitialValues}
          validationSchema={toFormikValidationSchema(loginFormSchema)}
          onSubmit={handleLogin}
        >
          <Form>
            {/* component={false} gives Form.Item the vertical-layout context
                without rendering a second <form> inside Formik's. */}
            <AntForm component={false} layout="vertical">
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
                  <Input.Password {...field} autoComplete="current-password" />
                </AntForm.Item>
              )}
            </Field>
            <AntForm.Item className="authPage-submitItem">
              <Button type="primary" htmlType="submit" block loading={isLoading}>
                {enTranslation.buttons.login}
              </Button>
            </AntForm.Item>
            </AntForm>
          </Form>
        </Formik>
        <Typography.Paragraph className="authPage-footerLink">
          {enTranslation.labels.noAccount} <Link to="/register">{enTranslation.buttons.register}</Link>
        </Typography.Paragraph>
        <Typography.Paragraph className="authPage-footerLink">
          <Link to="/forgot-password">{enTranslation.headerTitles.forgotPassword}</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
};

export default LoginForm;
