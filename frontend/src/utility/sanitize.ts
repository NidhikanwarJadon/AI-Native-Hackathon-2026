/* eslint-disable @typescript-eslint/no-explicit-any */
// Applied globally in setup/client.ts's request interceptor — feature module
// code does not need to call this directly.
export const sanitizeInput = (value: any): any => {
  if (typeof value === 'string') {
    return value.trim().replace(/<script.*?>.*?<\/script>/gi, '');
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeInput);
  }

  if (typeof value === 'object' && value !== null) {
    const sanitizedObj: any = {};
    for (const key in value) {
      sanitizedObj[key] = sanitizeInput(value[key]);
    }
    return sanitizedObj;
  }

  return value;
};
