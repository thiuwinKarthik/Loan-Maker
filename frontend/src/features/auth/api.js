import { get, post } from "../../shared/api/apiClient";

export const authApi = {
  login(credentials) {
    return post("/api/auth/login", credentials);
  },
  register(payload) {
    return post("/api/auth/register", payload);
  },
  profile() {
    return get("/api/users/profile");
  },
};
