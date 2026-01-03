// utils/tokenManager.js
export const TokenManager = {
  // Keys for different roles
  KEYS: {
    USER: 'autotrack_user_token',
    CAPTAIN: 'autotrack_captain_token',
    PARENT: 'autotrack_parent_token',
    ROLE: 'autotrack_current_role'
  },

  // Store token with role
  setToken(role, token) {
    localStorage.setItem(this.KEYS[role.toUpperCase()], token);
    localStorage.setItem(this.KEYS.ROLE, role);
  },

  // Get token for current role
  getToken() {
    const role = this.getCurrentRole();
    return role ? localStorage.getItem(this.KEYS[role.toUpperCase()]) : null;
  },

  // Get token by specific role
  getTokenByRole(role) {
    return localStorage.getItem(this.KEYS[role.toUpperCase()]);
  },

  // Get current active role
  getCurrentRole() {
    return localStorage.getItem(this.KEYS.ROLE);
  },

  // Clear all tokens
  clearAll() {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  // Clear specific role token
  clearRoleToken(role) {
    localStorage.removeItem(this.KEYS[role.toUpperCase()]);
    if (this.getCurrentRole() === role) {
      localStorage.removeItem(this.KEYS.ROLE);
    }
  },

  // Check if token exists for role
  hasToken(role) {
    return !!this.getTokenByRole(role);
  }
};