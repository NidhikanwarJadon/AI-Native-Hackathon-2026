import { message } from 'antd';

export const showToastSuccess = (text: string): void => {
  void message.success(text);
};

export const showToastError = (text: string): void => {
  void message.error(text);
};
