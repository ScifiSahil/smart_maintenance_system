/**
 * ─── CSRF SERVICE ────────────────────────────────────────────────────
 * Endpoint apiConfig.js se aata hai — hardcode nahi
 * ─────────────────────────────────────────────────────────────────────
 */

import { API_URLS, REQUIRES_AUTH } from "./apiConfig";
import authService from "./authService";

class CsrfService {
  constructor() {
    this.csrfToken  = null;
    this.sessionKey = null;
  }

  _getCsrfFromCookie() {
    try {
      const c = document.cookie.split("; ").find(r => r.startsWith("CSRFToken="));
      return c ? decodeURIComponent(c.split("=")[1]) : null;
    } catch { return null; }
  }

  _getSessionFromCookie() {
    try {
      const c = document.cookie.split("; ").find(r => r.startsWith("contact.sessionkey="));
      return c ? c.split("=")[1] : null;
    } catch { return null; }
  }

  async getCsrfToken() {
    // Local env mein CSRF ki zaroorat nahi
    if (!REQUIRES_AUTH) return null;

    if (this.csrfToken) return this.csrfToken;

    const fromCookie = this._getCsrfFromCookie();
    if (fromCookie) {
      this.csrfToken = fromCookie;
      return this.csrfToken;
    }

    try {
      await fetch(API_URLS.graphql, {
        method:      "GET",
        headers:     { ...authService.getAuthHeaders(), Accept: "application/json" },
        credentials: "include",
      });
      const afterGet = this._getCsrfFromCookie();
      this.csrfToken = afterGet || "";
    } catch (err) {
      console.warn("⚠️ CSRF GET failed:", err.message);
      this.csrfToken = "";
    }

    return this.csrfToken;
  }

  getSessionKey() {
    if (!this.sessionKey) this.sessionKey = this._getSessionFromCookie();
    return this.sessionKey;
  }

  reset() {
    this.csrfToken  = null;
    this.sessionKey = null;
  }
}

export default new CsrfService();
