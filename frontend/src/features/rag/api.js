import { post } from "../../shared/api/apiClient";

export const ragApi = {
  query(question) {
    return post("/api/rag/query", { question });
  },
};
