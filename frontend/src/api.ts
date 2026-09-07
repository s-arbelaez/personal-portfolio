const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const apiBaseUrl = (configuredApiBaseUrl || '/api').replace(/\/$/, '');
export const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, '');