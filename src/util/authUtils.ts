// src/util/authUtils.ts
import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  userId?: number;
  username?: string;
  [key: string]: any;
}

function safeBase64Decode(str: string): string {
  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(str);
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  const cleaned = String(str).replace(/=+$/, '');
  let buffer = 0;
  let bits = 0;

  for (let i = 0; i < cleaned.length; i++) {
    const charIndex = chars.indexOf(cleaned.charAt(i));
    if (charIndex === -1) continue;
    buffer = (buffer << 6) | charIndex;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return output;
}

/**
 * Decodes a JWT token client-side and checks if the "exp" claim has passed.
 * Returns true if the token is missing, null, empty, malformed, or if exp has passed.
 */
export function isTokenExpired(token?: string | null): boolean {
  if (!token || typeof token !== 'string') {
    return true;
  }

  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
  if (!cleanToken) {
    return true;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(cleanToken);
    if (!decoded || typeof decoded.exp !== 'number') {
      return false;
    }

    // Convert exp (seconds) to milliseconds (with 5-second buffer)
    const expirationTimeMs = decoded.exp * 1000;
    return Date.now() >= expirationTimeMs - 5000;
  } catch {
    // Manual fallback parsing if jwtDecode throws an error
    try {
      const parts = cleanToken.split('.');
      if (parts.length !== 3) return true;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedString = safeBase64Decode(base64);
      const jsonPayload = decodeURIComponent(
        decodedString
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload: JwtPayload = JSON.parse(jsonPayload);
      if (payload && typeof payload.exp === 'number') {
        return Date.now() >= payload.exp * 1000 - 5000;
      }
      return false;
    } catch {
      return true;
    }
  }
}
