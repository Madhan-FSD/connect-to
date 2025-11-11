import { API_BASE_URL, apiFetch } from "./utils";

export const postApi = {
  create: (
    formData: FormData,
    token: string,
    endpoint: "profile" | "channel"
  ) =>
    apiFetch(`${API_BASE_URL}/posts/${endpoint}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }),

  toggleLike: (postId: string, token: string) =>
    apiFetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }),

  addComment: (postId: string, content: string, token: string) =>
    apiFetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    }),

  delete: (postId: string, token: string) =>
    apiFetch(`${API_BASE_URL}/posts/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),

  getFeed: (
    targetId: string,
    targetType: string,
    token: string,
    page = 1,
    limit = 10
  ) =>
    apiFetch(
      `${API_BASE_URL}/posts/feed/${targetId}?targetType=${targetType}&page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ),
};
