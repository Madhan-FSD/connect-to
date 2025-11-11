import { API_BASE_URL, apiFetch } from "./utils";

const FOLLOWERS_BASE_API = `${API_BASE_URL}/followers`;

export const followerApi = {
  follow: (entityId: string, entityType: string, token: string) =>
    apiFetch(`${FOLLOWERS_BASE_API}/follow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ entityId, entityType }),
    }),

  unfollow: (entityId: string, entityType: string, token: string) =>
    apiFetch(`${FOLLOWERS_BASE_API}/unfollow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ entityId, entityType }),
    }),

  getFollowers: (
    entityId: string,
    entityType: string,
    token: string,
    page = 1,
    limit = 20
  ) =>
    apiFetch(
      `${FOLLOWERS_BASE_API}/${entityType}/${entityId}?page=${page}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ),

  getFollowing: (userId: string, token: string, page = 1, limit = 20) =>
    apiFetch(
      `${FOLLOWERS_BASE_API}/following/${userId}?page=${page}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ),

  checkStatus: (entityId: string, entityType: string, token: string) =>
    apiFetch(`${FOLLOWERS_BASE_API}/status/${entityType}/${entityId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getCount: (entityId: string, entityType: string, token: string) =>
    apiFetch(`${FOLLOWERS_BASE_API}/count/${entityType}/${entityId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
