import { useEffect, useState, useRef } from "react";
import { childApi, userApi } from "@/lib/api";
import { getAuth } from "@/lib/auth";

export const useAvatarUrl = (user: ReturnType<typeof getAuth>) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!user?.userId || !user?.token) {
      setAvatarUrl(null);
      return;
    }

    const cacheKey = `avatar_${user.userId}`;
    const cachedUrl = sessionStorage.getItem(cacheKey);

    if (cachedUrl === "none") {
      setAvatarUrl(null);
      return;
    }

    if (cachedUrl) {
      setAvatarUrl(cachedUrl);
      return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchAvatar = async () => {
      try {
        let response;
        if (user.role === "CHILD") {
          response = await childApi.profile.getAvatar(user.userId, user.token);
        } else {
          response = await userApi.profile.avatar.get(user.token);
        }

        const url = response?.avatar?.url || response?.url || null;

        if (url) {
          setAvatarUrl(url);
          sessionStorage.setItem(cacheKey, url);
        } else {
          setAvatarUrl(null);
          sessionStorage.setItem(cacheKey, "none");
        }
      } catch (error) {
        console.error("Failed to fetch avatar:", error);
        setAvatarUrl(null);
        sessionStorage.setItem(cacheKey, "none");
      }
    };

    fetchAvatar();
  }, [user?.userId, user?.token, user?.role]);

  return avatarUrl;
};
