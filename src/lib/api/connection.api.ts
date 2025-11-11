import { API_BASE_URL, apiFetch } from "./utils";

const CONNECTIONS_BASE_URL = `${API_BASE_URL}/connections`;

export const connectionApi = {
  sendRequest: (recipientId: string, message: string, token: string) =>
    apiFetch(`${CONNECTIONS_BASE_URL}/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ recipientId, message }),
    }),

  getPending: (token: string) =>
    apiFetch(`${CONNECTIONS_BASE_URL}/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  accept: (connectionId: string, token: string) =>
    apiFetch(`${CONNECTIONS_BASE_URL}/${connectionId}/accept`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    }),

  reject: (connectionId: string, token: string) =>
    apiFetch(`${CONNECTIONS_BASE_URL}/${connectionId}/reject`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    }),

  remove: (connectionId: string, token: string) =>
    apiFetch(`${CONNECTIONS_BASE_URL}/${connectionId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),

  getConnections: (userId: string, token: string) =>
    apiFetch(`${CONNECTIONS_BASE_URL}/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getStatus: (userId: string, token: string) =>
    apiFetch(`${CONNECTIONS_BASE_URL}/status/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getSuggestions: (token: string, limit = 10) =>
    apiFetch(`${CONNECTIONS_BASE_URL}/suggestions?limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
