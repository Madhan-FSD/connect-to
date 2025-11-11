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

export const saveAuth = (user: User) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
};

export const getAuth = (): User | null => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  return JSON.parse(stored);
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const isAuthenticated = (): boolean => {
  return getAuth() !== null;
};
