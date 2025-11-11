export interface User {
  userId: string;
  email: string;
  name?: string;
  role: "PARENT" | "NORMAL_USER" | "CHILD";
  token: string;
  children?: Array<{
    id: string;
    name: string;
    age: number;
    permissions: {
      canCreateChannel: boolean;
      canPost: boolean;
      canComment: boolean;
      canLike: boolean;
    };
  }>;
  parentId?: string;
}

export const AUTH_STORAGE_KEY = "user";

let cachedUser: User | null = null;

export const saveAuth = (user: User) => {
  cachedUser = user;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
};

export const getAuth = (): User | null => {
  if (cachedUser) return cachedUser;
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  cachedUser = JSON.parse(stored);
  return cachedUser;
};

export const clearAuth = () => {
  cachedUser = null;
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const isAuthenticated = (): boolean => {
  return getAuth() !== null;
};
