import axiosInstance from "./axiosInstance";

export const loginUser = async (credentials) => {
  // credentials = { email, password }
  try {
    const response = await axiosInstance.post("/auth/login", credentials);
    return response.data; // typically returns token + user info
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

export const registerUser = async (userData) => {
  // userData = { name, email, password }
  try {
    const response = await axiosInstance.post("api/auth/register", userData);
    return response.data; // user created info
  } catch (error) {
    throw error.response?.data || { message: "Registration failed" };
  }
};
