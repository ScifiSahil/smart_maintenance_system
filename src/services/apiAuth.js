/**
 * ─── API AUTH ────────────────────────────────────────────────────────
 * apiAuth.get/post/put/patch/delete() — single place for all REST calls.
 * Credentials + env-detect apiConfig.js se aate hain, CSRF csrfService.js
 * se — yahan kuch bhi dubara hardcode/duplicate nahi kiya.
 * ─────────────────────────────────────────────────────────────────────
 */

import { BASE, JSON_HEADERS, REQUIRES_AUTH } from "./apiConfig";
import csrfService from "./csrfService";

class ApiAuth {
  // GET request — headers mein auth already JSON_HEADERS se aata hai
  async get(endpoint) {
    const res = await fetch(`${BASE}${endpoint}`, {
      method: "GET",
      headers: JSON_HEADERS,
      credentials: "include",
    });
    await this._handleResponse(res);
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  }

  // POST — CSRF token csrfService se lekar header mein attach karta hai
  async post(endpoint, data = {}) {
    return this._mutate("POST", endpoint, data);
  }

  async put(endpoint, data = {}) {
    return this._mutate("PUT", endpoint, data);
  }

  async patch(endpoint, data = {}) {
    return this._mutate("PATCH", endpoint, data);
  }

  async delete(endpoint) {
    return this._mutate("DELETE", endpoint);
  }

  // PUT try karta hai, fail hone par PATCH pe fallback — master row updates ke liye
  async putOrPatch(endpoint, data = {}) {
    try {
      return await this.put(endpoint, data);
    } catch (_) {
      return await this.patch(endpoint, data);
    }
  }

  // Common mutating-request logic (POST/PUT/PATCH/DELETE)
  async _mutate(method, endpoint, data) {
    const headers = { ...JSON_HEADERS };

    if (REQUIRES_AUTH) {
      const csrfToken = await csrfService.getCsrfToken();
      if (csrfToken) headers["X-CSRFToken"] = csrfToken;
    }

    const res = await fetch(`${BASE}${endpoint}`, {
      method,
      headers,
      credentials: "include",
      ...(data !== undefined && method !== "DELETE" ? { body: JSON.stringify(data) } : {}),
    });

    await this._handleResponse(res);
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  }

  // Non-2xx response par readable error throw karta hai
  async _handleResponse(response) {
    if (response.ok) return response;

    let msg = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const clone = response.clone();
      const ct = response.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = await clone.json();
        msg = data?.error?.message || data?.message || msg;
      }
    } catch (_) {
      // response body parse nahi ho paya — default msg use hoga
    }

    const err = new Error(msg);
    err.status = response.status;
    throw err;
  }
}

export default new ApiAuth();
