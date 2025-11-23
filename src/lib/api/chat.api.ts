import { ListUsersResponse } from "@/types";
import { getAuth } from "../auth";
import { API_BASE_URL } from "./utils";

async function request<T = any>(
  path: string,
  {
    method = "GET",
    body,
    params,
  }: {
    method?: string;
    body?: any;
    params?: Record<string, string | number>;
  } = {}
): Promise<T> {
  const token = getAuth()?.token;
  let url = `${API_BASE_URL}/chat${path}`;

  if (params) {
    const query = new URLSearchParams(
      Object.entries(params).reduce(
        (acc, [k, v]) => ({ ...acc, [k]: String(v) }),
        {}
      )
    ).toString();
    url = `${url}?${query}`;
  }

  console.log(`[API] ${method} ${url}`);

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

export const chatApi = {
  registerFcmToken(fcmToken: string, device: "ANDROID" | "IOS" | "WEB") {
    return request("/auth/fcm/register", {
      method: "POST",
      body: { fcmToken, device },
    });
  },

  unregisterFcmToken(fcmToken: string) {
    return request("/auth/fcm/unregister", {
      method: "POST",
      body: { fcmToken },
    });
  },

  createDirectConversation(otherUserId: string) {
    return request<{ conversation: any }>("/direct", {
      method: "POST",
      body: { otherUserId },
    });
  },

  createGroupConversation(name: string, participantIds: string[]) {
    return request<{ conversation: any }>("/group", {
      method: "POST",
      body: { name, participantIds },
    });
  },

  listConversations() {
    return request<{ conversations: any[] }>("/", {
      method: "GET",
    });
  },

  getConversation(conversationId: string) {
    return request<{ conversation: any }>(`/${conversationId}`, {
      method: "GET",
    });
  },

  renameConversation(conversationId: string, title: string) {
    return request(`/${conversationId}/rename`, {
      method: "PATCH",
      body: { title },
    });
  },

  addRemoveGroupMembers(
    groupId: string,
    memberIds: string[],
    action: "add" | "remove"
  ) {
    return request(`/group/members`, {
      method: "POST",
      body: { groupId, memberIds, action },
    });
  },

  leaveGroup(groupId: string) {
    return request("/group/leave", {
      method: "POST",
      body: { groupId },
    });
  },

  sendMessage(body: {
    conversationId: string;
    body: string;
    attachments?: any[];
    parentMessageId?: string;
    mentions?: string[];
  }) {
    return request<{ message: any }>("/messages", {
      method: "POST",
      body,
    });
  },

  getMessages(conversationId: string, cursor?: string | null) {
    const params: Record<string, string> = {};
    if (cursor) params.cursor = cursor;

    return request<{ messages: any[] }>(`/${conversationId}/messages`, {
      method: "GET",
      params,
    });
  },

  markMessageRead(conversationId: string, messageId: string) {
    return request("/message/read", {
      method: "POST",
      body: { conversationId, messageId },
    });
  },

  reactToMessage(messageId: string, reaction: string) {
    return request<{ reactionCounts: Record<string, number> }>(
      "/message/react",
      {
        method: "POST",
        body: { messageId, reaction },
      }
    );
  },

  typingStart(conversationId: string) {
    return request("/typing/start", {
      method: "POST",
      body: { conversationId },
    });
  },

  typingStop(conversationId: string) {
    return request("/typing/stop", {
      method: "POST",
      body: { conversationId },
    });
  },

  setPresence(
    status: "ONLINE" | "OFFLINE" | "AWAY" | "DO_NOT_DISTURB",
    meta: any = {}
  ) {
    return request("/presence", {
      method: "POST",
      body: { status, meta },
    });
  },

  fetchPresence(userId: string) {
    return request(`/presence/${userId}`, {
      method: "GET",
    });
  },

  getPresignedUploadUrl(filename: string, contentType: string) {
    return request<{ uploadUrl: string; path: string; publicPath: string }>(
      "/upload/presign",
      {
        method: "POST",
        body: { filename, contentType },
      }
    );
  },

  listUsers(search?: string, page = 1, limit = 20) {
    const params: Record<string, string | number> = { page, limit };

    if (search) {
      params.search = search;
    }

    return request<ListUsersResponse>("/users", {
      method: "GET",
      params,
    });
  },
};
