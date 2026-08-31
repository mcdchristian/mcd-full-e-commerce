import axios from 'axios';

/**
 * Pull the API's own message out of a failed request.
 * Falls back to the supplied text for network errors and unexpected shapes.
 */
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  return fallback;
};

/**
 * Accept a post-login redirect only when it is a path on this site.
 * A caller-supplied "//evil.example" or "https://evil.example" would otherwise
 * turn the login form into an open redirect.
 */
export const safeRedirectPath = (value: string | null, fallback: string = '/'): string => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return fallback;
  }

  return value;
};
