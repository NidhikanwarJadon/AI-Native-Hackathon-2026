// This module's own endpoint calls — single consumer (UserList), so this stays
// module-local rather than being promoted to src/api/.
import client from '../../../setup/client';
import { ENDPOINTS } from '../../../api/endpoints';
import type { PaginatedResponse } from '../../../types/common.types';
import type { UserDto, UserListParams } from '../types/user.types';

// useFetchAPI inspects the response status itself, so this returns the whole
// response rather than pre-unwrapping it.
export const getUsers = (params: UserListParams) =>
  client.get<PaginatedResponse<UserDto>>(ENDPOINTS.users.list, { params });
