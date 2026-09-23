import { Formik, Form, Field, type FieldProps } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { Link } from 'react-router-dom';
import { Alert, Button, Card, Form as AntForm, Input, Typography } from 'antd';
import {
  forgotPasswordFormSchema,
  forgotPasswordFormInitialValues,
  type ForgotPasswordFormValues,
} from '../schema/forgotPasswordFormSchema';
import useForgotPassword from '../hooks/useForgotPassword';
import { enTranslation } from '../../../translations/enTranslation';
import '../css/authPages.css';

const ForgotPasswordForm = () => {
  const [{ isLoading, successMessage }, { handleForgotPassword }] = useForgotPassword();

  return (
    <div className="authPage-container">
      <Card className="authPage-card">
        <Typography.Title level={3} className="authPage-title">
          {enTranslation.headerTitles.forgotPassword}
        </Typography.Title>
        {successMessage && (
          <Alert type="success" message={successMessage} showIcon className="authPage-alert" />
        )}
        <Formik<ForgotPasswordFormValues>
          initialValues={forgotPasswordFormInitialValues}
          validationSchema={toFormikValidationSchema(forgotPasswordFormSchema)}
          onSubmit={handleForgotPassword}
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
            <AntForm.Item className="authPage-submitItem">
              <Button type="primary" htmlType="submit" block loading={isLoading}>
                {enTranslation.buttons.sendResetLink}
              </Button>
            </AntForm.Item>
            </AntForm>
          </Form>
        </Formik>
        <Typography.Paragraph className="authPage-footerLink">
          <Link to="/login">{enTranslation.buttons.backToLogin}</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
};

export default ForgotPasswordForm;
