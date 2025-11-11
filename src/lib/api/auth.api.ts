import { API_BASE_URL, apiFetch } from "./utils";

export const authApi = {
  register: (email: string) =>
    apiFetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }),

  verifyOtp: (email: string, otp: string) =>
    apiFetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    }),

  login: (email: string, otp: string) =>
    apiFetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    }),

  loginChild: (email: string, childName: string, accessCode: string) =>
    apiFetch(`${API_BASE_URL}/auth/login-child`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, childName, accessCode }),
    }),

  loginEmailCheck: async (email: string) =>
    await apiFetch(`${API_BASE_URL}/auth/login-email-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }),

  sendOtp: async (email: string) =>
    apiFetch(`${API_BASE_URL}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }),
};
