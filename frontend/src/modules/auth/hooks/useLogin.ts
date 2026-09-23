import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useFetchAPI from '../../../hooks/useFetchAPI';
import { login } from '../api/authApi';
import { useAppDispatch } from '../../../setup/store';
import { sessionStarted } from '../../../reducers/authReducer';
import type { LoginRequest, AuthSessionResponse } from '../types/auth.types';

interface LocationState {
  from?: { pathname: string };
}

const useLogin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitPayload, setSubmitPayload] = useState<Partial<LoginRequest>>({});

  const handleLogin = (values: LoginRequest) => {
    setSubmitPayload({
      email: values.email.toLowerCase(),
      password: values.password,
    });
  };

  const successCb = (type: string, data: AuthSessionResponse) => {
    switch (type) {
      case 'login': {
        setSubmitPayload({});
        dispatch(sessionStarted(data));
        const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? '/';
        navigate(redirectTo, { replace: true });
        break;
      }
    }
  };

  const failureCb = (type: string) => {
    switch (type) {
      case 'login': {
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
    successCb: (data: AuthSessionResponse) => successCb('login', data),
    failureCb: () => failureCb('login'),
  });

  return [{ isLoading }, { handleLogin }] as const;
};

export default useLogin;
