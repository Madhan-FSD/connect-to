export interface User {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  avatar?: { url: string };
  username?: string;
  isOnline?: boolean;
  firebaseTokens?: Array<{ token: string; device: string }>;
}

export interface Participant {
  userId: string | User;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: string;
}

export interface Conversation {
  _id: string;
  type: "DIRECT" | "GROUP";
  title?: string;
  participants: Participant[];
  adminIds?: string[];
  createdBy?: string;
  lastMessageId?: string;
  lastMessageAt?: string;
  messageCount: number;
  unreadCounts?: Record<string, number>;
  unread?: number;
  otherUser?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: User;
  body: string;
  attachments?: Attachment[];
  parentMessageId?: string;
  mentions?: string[];
  messageType: "TEXT" | "FILE";
  reactionCounts?: Record<string, number>;
  delivery: DeliveryInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryInfo {
  userId: string;
  deliveredAt?: string;
  readAt?: string;
}

export interface Attachment {
  id?: string;
  name: string;
  size?: number;
  type?: string;
  url?: string;
}

export interface Reaction {
  _id: string;
  messageId: string;
  userId: string;
  emoji: string;
  conversationId: string;
  createdAt: string;
}

export interface ListUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}
