import { useState } from 'react';
import useFetchAPI from '../../../hooks/useFetchAPI';
import { forgotPassword } from '../api/authApi';
import type { ForgotPasswordRequest, ForgotPasswordResponse } from '../types/auth.types';

const useForgotPassword = () => {
  const [submitPayload, setSubmitPayload] = useState<Partial<ForgotPasswordRequest>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleForgotPassword = (values: ForgotPasswordRequest) => {
    setSubmitPayload({ email: values.email.toLowerCase() });
  };

  const successCb = (type: string, data: ForgotPasswordResponse) => {
    switch (type) {
      case 'forgotPassword': {
        setSubmitPayload({});
        setSuccessMessage(data.message);
        break;
      }
    }
  };

  const failureCb = (type: string) => {
    switch (type) {
      case 'forgotPassword': {
        setSubmitPayload({});
        break;
      }
    }
  };

  const [{ isLoading }] = useFetchAPI({
    apiFunction: forgotPassword,
    apiCallCondition: Object.keys(submitPayload).length,
    apiParams: submitPayload,
    dependencyArray: [submitPayload],
    defaultResponseValue: [],
    showSuccessMessage: false,
    hideErrorMesssage: false,
    successCb: (data: ForgotPasswordResponse) => successCb('forgotPassword', data),
    failureCb: () => failureCb('forgotPassword'),
  });

  return [{ isLoading, successMessage }, { handleForgotPassword }] as const;
};

export default useForgotPassword;
