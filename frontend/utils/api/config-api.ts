/////////////////////
// IMPORTS SECTION //
/////////////////////


///////////////////////
//  HELPERS SECTION  //
///////////////////////
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function authFetch(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers);

  if (token) {
    headers.set('Authorization', `Token ${token}`);
  }

  // Always send JSON by default (you can override in cases like file uploads)
  if (!headers.has('Content-Type') && !(input.toString().includes('/upload/'))) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(input, { ...init, headers });
}