import axios from "axios";
import { API_BASE_URL } from "../config/env";
import { session } from "../auth/session";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = session.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const unwrap = (payload) => {
  if (payload && typeof payload === "object" && "success" in payload) {
    if (!payload.success) {
      const message = payload.error?.message || "Request failed";
      throw new Error(message);
    }
    return payload.data;
  }
  return payload;
};

export const get = async (url) => unwrap((await apiClient.get(url)).data);
export const post = async (url, body) => unwrap((await apiClient.post(url, body)).data);
export const put = async (url, body) => unwrap((await apiClient.put(url, body)).data);
export const del = async (url) => unwrap((await apiClient.delete(url)).data);
