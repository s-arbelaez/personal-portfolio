const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const configuredApiUsesLocalhost = /^https?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0)(?::\d+)?(?:\/|$)/i.test(configuredApiBaseUrl ?? '');
const useSameOriginApi = !configuredApiBaseUrl || (import.meta.env.PROD && configuredApiUsesLocalhost);

export const apiBaseUrl = (useSameOriginApi ? '/api' : configuredApiBaseUrl).replace(/\/$/, '');
export const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, '');