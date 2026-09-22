/* eslint-disable @typescript-eslint/no-explicit-any */
// The shared data-fetching hook: every read call in the app goes through it.
// `any` is tolerated here because this is a generic utility wrapping arbitrary
// endpoints — the no-any rule still applies to feature module code.
import { useEffect, useState } from 'react';
import { showToastError, showToastSuccess } from '../utility/common';
import API_STATUS from '../utility/apiStatus';
import { useAppSelector } from '../setup/store';

interface Props {
  accessPath?: string[];
  apiFunction: (params: Record<string, any>) => Promise<any>;
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

const useFetchAPI = ({
  // accessPath = [""],
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
}: Props) => {
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
          // const resData =
          //   getDataFromObjectUsingPaths(res?.data, accessPath) ||
          //   defaultResponseValue;
          if (res?.status == API_STATUS.SUCCESS) {
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
          const status = error.response?.status;
          if ([API_STATUS.UNAUTHORIZED, API_STATUS.CONFLICT].includes(status)) return;
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
