// ════════════════════════════════════════════════════════════════════
// Lumina AI — Auth Helper (Google OAuth + session management)
// ════════════════════════════════════════════════════════════════════

const LuminaAuth = {
  STORAGE_KEY: 'lumina_user_session',

  // Decode Google JWT credential (client-side, no backend needed)
  parseJwt(token) {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch { return null; }
  },

  // Store session after Google sign-in
  saveSession(credential) {
    const payload = this.parseJwt(credential);
    if (!payload) return null;
    const session = {
      name:    payload.name    || 'User',
      email:   payload.email   || '',
      picture: payload.picture || '',
      sub:     payload.sub     || '',
      token:   credential,
      exp:     payload.exp,
      loginAt: Date.now(),
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    return session;
  },

  // Get current session (null if not logged in / expired)
  getSession() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      // Check expiry (Google tokens expire in ~1h, we refresh on re-login)
      if (s.exp && Date.now() / 1000 > s.exp) {
        this.logout();
        return null;
      }
      return s;
    } catch { return null; }
  },

  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    if (window.google?.accounts?.id) google.accounts.id.disableAutoSelect();
  },

  isLoggedIn() { return this.getSession() !== null; },

  // Redirect to login if not authenticated
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  },
};
