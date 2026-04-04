import { get } from "../../shared/api/apiClient";

export const userApi = {
  profile() {
    return get("/api/users/profile");
  },
  loanApplications(userId) {
    return get(`/api/loans/applications/${userId}`);
  },
};
