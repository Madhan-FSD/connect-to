import { API_BASE_URL } from "./utils";

export const apiFetch = async <T>(
  path: string,
  method = "GET",
  body?: any,
  token?: string
): Promise<T> => {
  const headers: Record<string, string> = {};

  if (token) headers["Authorization"] = `Bearer ${token}`;

  if (!(body instanceof FormData) && body !== undefined && body !== null) {
    headers["Content-Type"] = "application/json";
  }

  const requestBody =
    method === "GET" || method === "HEAD"
      ? undefined
      : body instanceof FormData
      ? body
      : body !== undefined && body !== null
      ? JSON.stringify(body)
      : undefined;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: requestBody,
  });

  if (res.status === 204) return null as T;

  let json: any;
  try {
    json = await res.json();
  } catch (e) {
    json = null;
  }

  if (!res.ok) {
    const errorMessage =
      (json && (json.error || json.message)) ||
      res.statusText ||
      `Request failed with status ${res.status}`;

    const err = new Error(errorMessage);
    (err as any).data = json;
    throw err;
  }

  return json as T;
};

export const channelApi = {
  getChannelDetails: (channelId: string, token: string) =>
    apiFetch(`/channel/${channelId}`, "GET", undefined, token),

  getPostsByHandle: (handle: string, query = "", token: string) =>
    apiFetch(
      `/channel/handle/${encodeURIComponent(handle)}/posts${
        query ? `?${query}` : ""
      }`,
      "GET",
      undefined,
      token
    ),

  getVideosByHandle: (handle: string, query = "", token: string) =>
    apiFetch(
      `/channel/handle/${encodeURIComponent(handle)}/videos${
        query ? `?${query}` : ""
      }`,
      "GET",
      undefined,
      token
    ),

  subscribe: (channelId: string, token: string) =>
    apiFetch(`/channel/${channelId}/subscribe`, "POST", undefined, token),

  unsubscribe: (channelId: string, token: string) =>
    apiFetch(`/channel/${channelId}/unsubscribe`, "POST", undefined, token),

  updateVisibility: (channelId: string, visibility: string, token: string) =>
    apiFetch(`/channel/${channelId}/visibility`, "PUT", { visibility }, token),

  updateAvatar: (channelId: string, formData: FormData, token: string) =>
    apiFetch(`/channel/${channelId}/avatar`, "PUT", formData, token),

  updateBanner: (channelId: string, formData: FormData, token: string) =>
    apiFetch(`/channel/${channelId}/banner`, "PUT", formData, token),

  analytics: (channelId: string, token: string) =>
    apiFetch(`/channel/${channelId}/analytics`, "GET", undefined, token),

  createChildChannel: (childId: string, formData: FormData, token: string) =>
    apiFetch(`/channel/child/${childId}/create`, "POST", formData, token),

  createUserChannel: (formData: FormData, token: string) => {
    apiFetch(`/channel/user/create`, "POST", formData, token);
  },

  getDetailsByHandle: (handle: string, token?: string) =>
    apiFetch(
      `/channel/handle/${encodeURIComponent(handle)}/details`,
      "GET",
      undefined,
      token
    ),

  getSubscriberCount: (channelId: string, token: string) =>
    apiFetch(
      `/channel/${channelId}/count/subscribers`,
      "GET",
      undefined,
      token
    ),

  checkSubscriptionStatus: (channelId: string, token: string) =>
    apiFetch(
      `/channel/${channelId}/subscription/status`,
      "GET",
      undefined,
      token
    ),

  getPersonalFeed: (query: string = "", token: string) =>
    apiFetch(
      `/channel/feed${query ? `?${query}` : ""}`,
      "GET",
      undefined,
      token
    ),

  updatePermissions: (
    channelId: string,
    permissions: {
      uploadPermission?: "FULL" | "BLOCKED" | "LIMITED";
      uploadTimeWindow?: string;
      commentModeration?: boolean;
      likeVisibility?: "PUBLIC_COUNT" | "PRIVATE_COUNT" | "DISABLED";
    },
    token: string
  ) => apiFetch(`/channel/${channelId}/permissions`, "PUT", permissions, token),

  updateFeaturedContent: (
    channelId: string,
    contentData: {
      featuredContentType?: "VIDEO" | "POST";
      featuredContentId?: string | null;
    },
    token: string
  ) => apiFetch(`/channel/${channelId}/featured`, "PUT", contentData, token),

  searchChannels: (query: string, token: string) =>
    apiFetch(`/channel/search?${query}`, "GET", undefined, token),

  getUploadHistory: (channelId: string, query: string = "", token: string) =>
    apiFetch(
      `/channel/${channelId}/uploads/history${query ? `?${query}` : ""}`,
      "GET",
      undefined,
      token
    ),

  deleteAvatar: (channelId: string, token: string) =>
    apiFetch(`/channel/${channelId}/avatar`, "DELETE", undefined, token),

  reportChannel: (
    channelId: string,
    reportData: { reason: string; details?: string },
    token: string
  ) => apiFetch(`/channel/${channelId}/report`, "POST", reportData, token),
};

export const channelpostsApi = {
  create: (form: FormData, token: string) =>
    apiFetch(`/posts`, "POST", form, token),
};

export const channelvideosApi = {
  upload: (form: FormData, token: string) =>
    apiFetch(`/videos/upload`, "POST", form, token),
  watch: (videoId: string, token: string) =>
    apiFetch(`/videos/${videoId}/watch`, "POST", undefined, token),
  getPlaybackUrl: (videoId: string, token: string) =>
    apiFetch<{ secureUrl: string }>(
      `/videos/${videoId}/play`,
      "GET",
      null,
      token
    ),
};

export const channelplaylistApi = {
  create: (payload: any, token: string) =>
    apiFetch(`/playlists/create`, "POST", payload, token),

  getMyPlaylists: (token: string) =>
    apiFetch(`/playlists/get-playlists`, "GET", undefined, token),

  get: (playlistId: string, token: string) =>
    apiFetch(`/playlists/${playlistId}`, "GET", undefined, token),

  update: (playlistId: string, payload: any, token: string) =>
    apiFetch(`/playlists/${playlistId}`, "PUT", payload, token),

  addVideo: (playlistId: string, videoId: string, token: string) =>
    apiFetch(`/playlists/${playlistId}/add`, "POST", { videoId }, token),

  removeVideo: (playlistId: string, videoId: string, token: string) =>
    apiFetch(`/playlists/${playlistId}/remove`, "POST", { videoId }, token),

  delete: (playlistId: string, token: string) =>
    apiFetch(`/playlists/${playlistId}`, "DELETE", undefined, token),
};

export const channelfeedApi = {
  subscriptions: (token: string, query = "") =>
    apiFetch(
      `/feed/subscriptions${query ? `?${query}` : ""}`,
      "GET",
      undefined,
      token
    ),
};
