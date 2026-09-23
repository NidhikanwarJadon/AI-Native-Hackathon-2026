// HTTP response codes. Not the same as setup/apiStatus.ts's ApiStatus enum,
// which is the idle/loading/succeeded/failed lifecycle Redux slices use.
const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  SERVER_ERROR: 500,
};

export default API_STATUS;
