import { API_BASE_URL, apiFetch } from "./utils";

const FOLLOWING_BASE_API = `${API_BASE_URL}/following`;

export const followerApi = {
  getFollowing: (userId: string, token: string, page = 1, limit = 20) =>
    apiFetch(`${FOLLOWING_BASE_API}/${userId}?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
