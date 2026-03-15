const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6020';

// Remove trailing slashes to avoid double-slash URLs when joining paths.
export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '');

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
