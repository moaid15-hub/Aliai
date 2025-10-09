/**
 * Authentication utilities
 */

export interface TokenData {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export function setTokens(tokens: TokenData) {
  localStorage.setItem('access_token', tokens.access_token);
  localStorage.setItem('refresh_token', tokens.refresh_token);
}

export function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token');
}

export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function setUser(user: any) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function getUser(): any | null {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function clearUser() {
  localStorage.removeItem('user');
}


