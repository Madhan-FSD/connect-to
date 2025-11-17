export interface Owner {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: { url?: string };
  headline?: string;
  handle?: string;
}

export interface Post {
  _id: string;
  ownerId: Owner;
  content: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  videoDuration?: number;
  contentType:
    | "TEXT"
    | "IMAGE"
    | "VIDEO"
    | "POST"
    | "VIDEO_CHANNEL"
    | "VIDEO_PROFILE";
  userReaction?: string | null;
  reactionsCount?: number;
  totalReactions?: number;
  commentsCount?: number;
  createdAt: string;
  channelId: string;
  channelType: "UserChannel";
  playlistIds: string[];
  title: string;
  description: string;
  duration?: number;
  viewsCount?: number;
  likesCount?: number;
  visibility: "PUBLIC" | "PRIVATE" | "SUBSCRIBERS_ONLY" | "PAID_ONLY";
  videoStatus: "PROCESSING" | "LIVE" | "BLOCKED" | "DELETED" | "COURSE_LOCKED";
  score?: number;
  channelName?: string;
  channelHandle?: string;
  channelAvatar?: string;
  channelDescription?: string;
  isSubscribed?: boolean;
  restricted?: boolean;
  secureUrl?: string;
}

export interface Comment {
  _id: string;
  content: string;
  ownerId: Owner;
  createdAt: string;
  parentComment?: string | null;
  replies?: Comment[];
}

export interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  handle?: string;
  avatarUrl?: string;
  avatar?: string;
  email?: string;
  headline?: string;
  token: string;
}
