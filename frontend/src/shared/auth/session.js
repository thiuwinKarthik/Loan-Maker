const TOKEN_KEY = "token";
const USER_KEY = "user";

export const session = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },
  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
};
