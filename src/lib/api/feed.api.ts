import { API_BASE_URL, apiFetch } from "./utils";

const FEED_BASE_URL = `${API_BASE_URL}/feeds`;

export const feedApi = {
  getPersonalizedFeed: async (token: string, page = 1, limit = 10) => {
    const response = await fetch(
      `${FEED_BASE_URL}/personalized?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.json();
  },

  getExploreFeed: async (token: string, page = 1, limit = 10) => {
    const response = await fetch(
      `${FEED_BASE_URL}/explore?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.json();
  },

  getTrendingPosts: async (token: string, limit = 10) => {
    const response = await fetch(`${FEED_BASE_URL}/trending?limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getSubscriptionsFeed: (token?: string, page = 1, limit = 20) =>
    apiFetch(
      `${FEED_BASE_URL}/subscriptions?page=${page}&limit=${limit}&refresh=1`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    ),
};
