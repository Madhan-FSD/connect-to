export interface Owner {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: { url?: string };
  headline?: string;
}

export interface Post {
  _id: string;
  ownerId: Owner;
  content: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  videoDuration?: number;
  contentType?:
    | "TEXT"
    | "IMAGE"
    | "VIDEO"
    | "POST"
    | "VIDEO_CHANNEL"
    | "VIDEO_PROFILE";
  totalReactions?: number;
  commentsCount?: number;
  createdAt: string;
  channelId: "691856b6556c0a716cd835c5";
  channelType: "UserChannel";
  playlistIds: [];
  title: "Public Playlist Video";
  description: "First Video On Public Playlist";
  duration: 1;
  viewsCount: 0;
  likesCount: 0;
  visibility: "PUBLIC";
  videoStatus: "LIVE";
  __v: 0;
  score: 0;
  channelName: string;
  channelHandle: string;
  channelAvatar: string;
  channelDescription: string;
  isSubscribed: boolean;
  restricted: boolean;
  secureUrl: string;
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
}
