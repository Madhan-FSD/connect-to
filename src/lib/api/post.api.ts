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

  getFeed: (
    targetId: string,
    targetType: "USER" | "PROFILE" | "CHANNEL",
    token: string,
    page = 1,
    limit = 10
  ) =>
    apiFetch(
      `${API_BASE_URL}/posts/feed/${targetId}?targetType=${targetType}&page=${page}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    ),

  getDetails: (postId: string, token: string) =>
    apiFetch(`${API_BASE_URL}/posts/${postId}`, {
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

  getComments: (postId: string, token: string) =>
    apiFetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  deleteComment: (commentId: string, token: string) =>
    apiFetch(`${API_BASE_URL}/posts/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),

  update: (
    postId: string,
    body: { title?: string; content?: string },
    token: string
  ) =>
    apiFetch(`${API_BASE_URL}/posts/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }),

  delete: (postId: string, token: string) =>
    apiFetch(`${API_BASE_URL}/posts/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
};
