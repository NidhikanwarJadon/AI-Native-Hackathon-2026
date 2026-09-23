import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetchAPI from '../../../hooks/useFetchAPI';
import { register } from '../api/authApi';
import { useAppDispatch } from '../../../setup/store';
import { sessionStarted } from '../../../reducers/authReducer';
import type { RegisterRequest, AuthSessionResponse } from '../types/auth.types';
import type { RegisterFormValues } from '../schema/registerFormSchema';

const useRegister = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [submitPayload, setSubmitPayload] = useState<Partial<RegisterRequest>>({});

  const handleRegister = (values: RegisterFormValues) => {
    setSubmitPayload({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email.toLowerCase(),
      password: values.password,
    });
  };

  const successCb = (type: string, data: AuthSessionResponse) => {
    switch (type) {
      case 'register': {
        setSubmitPayload({});
        dispatch(sessionStarted(data));
        navigate('/', { replace: true });
        break;
      }
    }
  };

  const failureCb = (type: string) => {
    switch (type) {
      case 'register': {
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
    successCb: (data: AuthSessionResponse) => successCb('register', data),
    failureCb: () => failureCb('register'),
  });

  return [{ isLoading }, { handleRegister }] as const;
};

export default useRegister;
