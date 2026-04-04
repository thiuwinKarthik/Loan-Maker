import { post } from "../../shared/api/apiClient";

export const offersApi = {
  predictAndRecommend(payload) {
    return post("/api/ai/predict-and-recommend", payload);
  },
};
