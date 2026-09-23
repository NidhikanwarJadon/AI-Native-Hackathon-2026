import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetchAPI from '../../../hooks/useFetchAPI';
import { register } from '../api/authApi';
import { showToastSuccess } from '../../../utility/common';
import { enTranslation } from '../../../translations/enTranslation';
import type { RegisterRequest } from '../types/auth.types';
import type { RegisterFormValues } from '../schema/registerFormSchema';

// All state and API-calling logic for the register screen lives here — the
// component only renders.
//
// Registration does not log the user in — POST /api/auth/register only
// creates the account and returns the new profile (no token). Logging in is
// a separate call, so a successful register sends the user to /login rather
// than starting a session here.
const useRegister = () => {
  const navigate = useNavigate();
  const [submitPayload, setSubmitPayload] = useState<Partial<RegisterRequest>>({});

  const handleRegister = (values: RegisterFormValues) => {
    setSubmitPayload({
      email: values.email,
      password: values.password,
      full_name: values.fullName,
    });
  };

  const successCb = (type: string) => {
    switch (type) {
      case 'register': {
        setSubmitPayload({});
        showToastSuccess(enTranslation.messages.registrationSucceeded);
        navigate('/login', { replace: true });
        break;
      }
    }
  };

  const failureCb = (type: string) => {
    switch (type) {
      case 'register': {
        // The hook already toasts the failure (409 if the email is taken);
        // just clear the payload so the next submit re-triggers the call.
        setSubmitPayload({});
        break;
      }
    }
  };

  const [{ isLoading }] = useFetchAPI({
    apiFunction: register,
    apiCallCondition: Object.keys(submitPayload).length,
    apiParams: submitPayload,
    dependencyArray: [submitPayload],
    defaultResponseValue: [],
    showSuccessMessage: false,
    hideErrorMesssage: false,
    successCb: () => successCb('register'),
    failureCb: () => failureCb('register'),
  });

  return [{ isLoading }, { handleRegister }] as const;
};

export default useRegister;
