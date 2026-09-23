import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useFetchAPI from '../../../hooks/useFetchAPI';
import { login } from '../api/authApi';
import { useAppDispatch } from '../../../setup/store';
import { sessionStarted } from '../../../reducers/authReducer';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

interface LocationState {
  from?: { pathname: string };
}

// All state and API-calling logic for the login screen lives here — the
// component only renders.
const useLogin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitPayload, setSubmitPayload] = useState<Partial<LoginRequest>>({});

  const handleLogin = (values: LoginRequest) => {
    setSubmitPayload({ ...values });
  };

  const successCb = (type: string, data: LoginResponse) => {
    switch (type) {
      case 'login': {
        setSubmitPayload({});
        dispatch(sessionStarted({ accessToken: data.access_token }));
        const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? '/';
        navigate(redirectTo, { replace: true });
        break;
      }
    }
  };

  const failureCb = (type: string) => {
    switch (type) {
      case 'login': {
        // The hook already toasts the failure (401 "Incorrect email or
        // password", 403 "Inactive user"); just clear the payload so the
        // next submit re-triggers the call.
        setSubmitPayload({});
        break;
      }
    }
  };

  const [{ isLoading }] = useFetchAPI({
    apiFunction: login,
    apiCallCondition: Object.keys(submitPayload).length,
    apiParams: submitPayload,
    dependencyArray: [submitPayload],
    defaultResponseValue: [],
    showSuccessMessage: false,
    hideErrorMesssage: false,
    successCb: (data: LoginResponse) => successCb('login', data),
    failureCb: () => failureCb('login'),
  });

  return [{ isLoading }, { handleLogin }] as const;
};

export default useLogin;
