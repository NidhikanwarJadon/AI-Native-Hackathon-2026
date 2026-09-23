import { useMemo, useState } from 'react';
import { Table } from 'antd';
import { enTranslation } from '../../../translations/enTranslation';
import { buildUserColumns } from '../config/userColumns';
import useUserList from '../hooks/useUserList';
import type { UserListParams } from '../types/user.types';
import '../css/userList.css';

const DEFAULT_PAGE_SIZE = 10;

// Read-only placeholder screen — points at GET /users per plan.md, not yet
// verified against a running backend.
function UserList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const params = useMemo<UserListParams>(() => ({ page, pageSize }), [page, pageSize]);

  const { users, total, isLoading } = useUserList(params);

  const columns = useMemo(() => buildUserColumns(), []);

  return (
    <div className="userList-container">
      <h1 className="userList-title">{enTranslation.headerTitles.users}</h1>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={isLoading}
        locale={{ emptyText: enTranslation.messages.usersEmpty }}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          },
        }}
      />
    </div>
  );
}

export default UserList;
