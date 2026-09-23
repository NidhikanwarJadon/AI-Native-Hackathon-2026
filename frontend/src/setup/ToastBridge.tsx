import { useEffect } from 'react';
import { App } from 'antd';
import { injectMessageApi } from '../utility/common';

// Renders nothing. It exists to pull the theme-aware message instance out of
// App.useApp() — which is a hook, so it can only be read inside a component —
// and hand it to utility/common.ts, keeping showToastSuccess/showToastError
// plain functions that non-component code (useFetchAPI) can call.
//
// Must be rendered inside antd's <App>.
export const ToastBridge = () => {
  const { message } = App.useApp();

  useEffect(() => {
    injectMessageApi(message);
  }, [message]);

  return null;
};
