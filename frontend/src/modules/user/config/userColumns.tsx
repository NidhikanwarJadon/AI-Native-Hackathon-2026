import type { ColumnsType } from 'antd/es/table';
import { enTranslation } from '../../../translations/enTranslation';
import type { UserDto } from '../types/user.types';

// Column builder — read-only list, so there are no row callbacks to accept yet.
export const buildUserColumns = (): ColumnsType<UserDto> => [
  {
    title: enTranslation.labels.userId,
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: enTranslation.labels.userName,
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: enTranslation.labels.userEmail,
    dataIndex: 'email',
    key: 'email',
  },
];
