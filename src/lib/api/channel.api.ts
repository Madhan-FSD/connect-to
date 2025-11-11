import { API_BASE_URL, apiFetch } from "./utils";

const CHANNELS_BASE = `${API_BASE_URL}/channels`;

export const channelApi = {
  createChildChannel: (formData: FormData, token: string) =>
    apiFetch(`${CHANNELS_BASE}/child/create`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }),

  createUserChannel: (formData: FormData, token: string) =>
    apiFetch(`${CHANNELS_BASE}/user/create`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }),

  getUserChannel: (token: string) =>
    apiFetch(`${CHANNELS_BASE}/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getChildChannel: (childId: string, token: string) =>
    apiFetch(`${CHANNELS_BASE}/child/${childId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getByHandle: (handle: string, token: string) =>
    apiFetch(`${CHANNELS_BASE}/handle/${handle}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getPosts: (handle: string, token: string, page = 1, limit = 10) =>
    apiFetch(
      `${CHANNELS_BASE}/handle/${handle}/posts?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ),

  getVideos: (handle: string, token: string, page = 1, limit = 10) =>
    apiFetch(
      `${CHANNELS_BASE}/handle/${handle}/videos?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ),

  updateDetails: (channelId: string, data: any, token: string) =>
    apiFetch(`${CHANNELS_BASE}/${channelId}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),

  updateAvatar: (channelId: string, file: File, token: string) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiFetch(`${CHANNELS_BASE}/${channelId}/avatar`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  },

  updateBanner: (channelId: string, file: File, token: string) => {
    const formData = new FormData();
    formData.append("banner", file);
    return apiFetch(`${CHANNELS_BASE}/${channelId}/banner`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  },

  delete: (channelId: string, token: string) =>
    apiFetch(`${CHANNELS_BASE}/${channelId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),

  getAnalytics: (token: string) =>
    apiFetch(`${CHANNELS_BASE}/analytics/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  search: (query: string, token: string, page = 1, limit = 10) =>
    apiFetch(
      `${CHANNELS_BASE}/search?query=${encodeURIComponent(
        query
      )}&page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ),
};
