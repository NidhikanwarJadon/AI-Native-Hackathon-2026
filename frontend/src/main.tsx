import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { store, persistor } from './setup/store';
import { appTheme } from './setup/theme';
import { ToastBridge } from './setup/ToastBridge';
import App from './App';
import './setup/global.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider theme={appTheme}>
          {/* antd scopes its CSS variables to a generated class it puts on
              its own elements, so <body> can't see them. AntApp renders a
              real div carrying that scope, which is what lets global.css
              read var(--ant-*) for the page background. */}
          <AntApp>
            <ToastBridge />
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AntApp>
        </ConfigProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
);
