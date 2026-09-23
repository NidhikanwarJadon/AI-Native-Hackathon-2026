/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { showToastError, showToastSuccess } from '../utility/common';
import { useAppSelector } from '../setup/store';
import API_STATUS from '../utility/apiStatus';

interface Props {
  accessPath?: string[];
  // `any`, not `Record<string, any>` — a typed api function like
  // `(payload: LoginRequest) => Promise<...>` isn't assignable to a param
  // type requiring specific named properties, under strictFunctionTypes.
  apiFunction: (params: any) => Promise<any>;
  apiCallCondition: boolean | number | string;
  apiParams?: Record<string, any>;
  dependencyArray: any[];
  defaultResponseValue: any[];
  hideErrorMesssage: boolean;
  showSuccessMessage: boolean;
  successCb: (data: any) => void;
  failureCb: (error: any) => void;
  errorMessage?: string;
  successMessage?: string;
}

// Return type is an explicit 1-tuple: with `noUncheckedIndexedAccess` on, an
// inferred array type would make `useFetchAPI(...)[0]` come back as
// `{...} | undefined`, which this never actually returns.
const useFetchAPI = ({
  apiFunction = () => Promise.resolve({ data: {} }),
  apiCallCondition = false,
  apiParams = {},
  dependencyArray = [],
  defaultResponseValue = [],
  hideErrorMesssage = false,
  showSuccessMessage = true,
  successCb = () => {},
  failureCb = () => {},
  errorMessage,
  successMessage,
}: Props): [{ data: any[]; isLoading: boolean; hasError: boolean }] => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [hasError, setError] = useState<boolean>(false);
  const role = useAppSelector((state) => state?.auth?.role);

  useEffect(() => {
    if (apiCallCondition) {
      setLoading(true);
      apiFunction(apiParams)
        .then((res) => {
          const resData = res?.data;
          // Axios resolves every 2xx into this branch (it rejects anything
          // else into .catch() below), and our API legitimately returns
          // 200/201/202/204 depending on the endpoint — so "success" means
          // any 2xx, not literally 200. A narrower check here silently
          // treated a real 201 Created or 202 Accepted as a failure.
          if (res?.status >= API_STATUS.SUCCESS) {
            setData(resData);
            setLoading(false);
            setError(false);
            successCb?.(resData);
            if (showSuccessMessage) {
              if (successMessage || res?.data?.message) {
                showToastSuccess(successMessage || res?.data?.message);
              }
            }
          } else {
            setLoading(false);
            setError(true);
            setData(defaultResponseValue);
            failureCb?.(defaultResponseValue);
            if (!hideErrorMesssage) {
              showToastError(errorMessage || res?.data?.message);
            }
          }
        })
        .catch((error) => {
          setLoading(false);
          setError(true);
          failureCb?.(error);
          const errorType = error?.response?.data?.error;

          if (!hideErrorMesssage) {
            if (typeof errorType === 'string') {
              showToastError(
                errorMessage ||
                  error?.response?.data?.error?.message ||
                  error?.response?.data?.error['error'] ||
                  error?.response?.data?.error,
              );
            }
            if (typeof errorType === 'object') {
              showToastError(error?.response?.data?.error['error'] || '');
            }
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencyArray, role]);

  return [{ data, isLoading, hasError }];
};

export default useFetchAPI;
