/**
 * Turn axios/network failures into actionable messages (CORS, wrong API URL, Vercel 404).
 */
export function describeApiError(error) {
  const url = error.config?.baseURL
    ? `${String(error.config.baseURL).replace(/\/$/, '')}${error.config.url || ''}`
    : error.config?.url;

  if (!error.response && error.request) {
    const isNetwork = error.code === 'ERR_NETWORK' || error.message === 'Network Error';
    if (isNetwork) {
      return [
        'Cannot reach the API (network or CORS).',
        'Check: VITE_API_URL ends with /api, backend CLIENT_URL matches this site, both projects redeployed.',
        url ? `Request: ${url}` : '',
      ]
        .filter(Boolean)
        .join(' ');
    }
    return `No response from server${url ? ` (${url})` : ''}.`;
  }

  const { status, data } = error.response || {};

  if (status === 404) {
    const body = typeof data === 'string' ? data : JSON.stringify(data || {});
    if (body.includes('NOT_FOUND') || body.includes('DEPLOYMENT_NOT_FOUND')) {
      return 'API route missing on Vercel (platform 404). Redeploy the backend project with the latest code.';
    }
    return data?.message || 'Not found.';
  }

  if (status === 403 && data?.message?.toLowerCase?.().includes('cors')) {
    return data.message;
  }

  return data?.message || error.message || 'Request failed';
}

export function attachApiErrorMessage(error) {
  error.userMessage = describeApiError(error);
  return error;
}
