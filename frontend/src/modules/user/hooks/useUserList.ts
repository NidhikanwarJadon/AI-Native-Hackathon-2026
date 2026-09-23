import useFetchAPI from '../../../hooks/useFetchAPI';
import { getUsers } from '../api/userApi';
import type { PaginatedResponse } from '../../../types/common.types';
import type { UserDto, UserListParams } from '../types/user.types';

const defaultUserList: PaginatedResponse<UserDto> = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
};

// List read for the user-list screen. Paging alone re-triggers the call — no
// filters exist yet on this screen.
const useUserList = (params: UserListParams) => {
  const fetchResult = useFetchAPI({
    // useFetchAPI's apiFunction prop is typed against a loose Record<string, any>
    // params bag; this adapts the module's concretely-typed getUsers to it.
    apiFunction: (apiParams) => getUsers(apiParams as UserListParams),
    apiCallCondition: true,
    apiParams: params,
    dependencyArray: [params.page, params.pageSize],
    // useFetchAPI's defaultResponseValue is typed any[]; this screen's response
    // is a single paginated object rather than a raw array, hence the cast.
    defaultResponseValue: defaultUserList as unknown as unknown[],
    showSuccessMessage: false,
    hideErrorMesssage: false,
    successCb: () => {},
    failureCb: () => {},
  });
  const { data, isLoading, hasError } = fetchResult[0] ?? {
    data: [],
    isLoading: false,
    hasError: false,
  };

  const userListData = (data as unknown as PaginatedResponse<UserDto>) ?? defaultUserList;

  return {
    users: userListData?.items ?? [],
    total: userListData?.total ?? 0,
    isLoading,
    hasError,
  };
};

export default useUserList;
