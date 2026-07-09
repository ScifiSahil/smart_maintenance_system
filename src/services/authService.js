/**
 * ─── AUTH SERVICE ────────────────────────────────────────────────────
 * Credentials apiConfig.js se aate hain — yahan hardcode mat karo
 * ─────────────────────────────────────────────────────────────────────
 */

import { API_USERNAME, API_PASSWORD, REQUIRES_AUTH } from "./apiConfig";

class AuthService {
  constructor() {
    this.username = API_USERNAME;
    this.password = API_PASSWORD;
  }

  // Returns { Authorization: "Basic xxxx" } header
  // Local env mein empty object return karta hai
  getAuthHeaders() {
    if (!REQUIRES_AUTH) return {};
    if (!this.username || !this.password) {
      console.error("❌ Auth: credentials not configured!");
      throw new Error("Authentication credentials not configured");
    }
    const encoded = btoa(`${this.username}:${this.password}`);
    return { Authorization: `Basic ${encoded}` };
  }

  getCredentials() {
    return { username: this.username, password: this.password };
  }
}

export default new AuthService();
