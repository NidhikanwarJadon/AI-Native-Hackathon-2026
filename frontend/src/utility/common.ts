import { message as staticMessage } from 'antd';
import type { App } from 'antd';

type MessageApi = ReturnType<typeof App.useApp>['message'];

// antd's static `message` import renders outside ConfigProvider, so it
// ignores the theme. setup/ToastBridge.tsx hands over the themed instance
// from App.useApp() once it mounts; until then these fall back to the static
// API so a toast is never lost. Same shape as injectStore in setup/client.ts.
let messageApi: MessageApi | null = null;

export const injectMessageApi = (instance: MessageApi): void => {
  messageApi = instance;
};

export const showToastSuccess = (text: string): void => {
  void (messageApi ?? staticMessage).success(text);
};

export const showToastError = (text: string): void => {
  void (messageApi ?? staticMessage).error(text);
};
