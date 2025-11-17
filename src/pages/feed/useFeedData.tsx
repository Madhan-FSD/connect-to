import { useState, useEffect, useCallback } from "react";
import { feedApi } from "@/lib/api";
import { toast } from "sonner";
import { Post } from "@/utils/post.interface";

type TabType = "personalized" | "explore" | "trending";

export interface TrendingItems {
  videos: Post[];
  posts: Post[];
}

export interface FeedState {
  items: Post[] | TrendingItems;
  isLoading: boolean;
  hasMore: boolean;
}

interface FetchResponse {
  items: Post[] | TrendingItems;
  hasMore: boolean;
}

const fetchTabContent = async (
  tab: TabType,
  token: string
): Promise<FetchResponse> => {
  switch (tab) {
    case "personalized":
      return feedApi.getPersonalizedFeed(token);
    case "explore":
      return feedApi.getExploreFeed(token);
    case "trending": {
      const trendingResponse = await feedApi.getTrendingPosts(token);
      return {
        items: {
          videos: trendingResponse.videos || [],
          posts: trendingResponse.posts || [],
        },
        hasMore: trendingResponse.hasMore,
      };
    }
    default:
      return { items: [], hasMore: false };
  }
};

export function useFeedData(initialActiveTab: TabType, userToken: string) {
  const [activeTab, setActiveTab] = useState<TabType>(initialActiveTab);
  const [feeds, setFeeds] = useState<{ [key in TabType]: FeedState }>({
    personalized: { items: [], isLoading: false, hasMore: true },
    explore: { items: [], isLoading: false, hasMore: true },
    trending: {
      items: { videos: [], posts: [] },
      isLoading: false,
      hasMore: true,
    },
  });
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(
    async (tab: TabType) => {
      if (!userToken) {
        setError("Authentication required to load feed.");
        return;
      }

      setFeeds((prevFeeds) => {
        const currentData = prevFeeds[tab];
        if (!currentData.items) return prevFeeds;

        let contentCount = 0;

        if (Array.isArray(currentData.items)) {
          contentCount = currentData.items.length;
        } else if (typeof currentData.items === "object") {
          contentCount =
            (currentData.items.videos?.length || 0) +
            (currentData.items.posts?.length || 0);
        }

        if (contentCount > 0 && !currentData.hasMore) {
          return prevFeeds;
        }

        setError(null);
        return {
          ...prevFeeds,
          [tab]: { ...prevFeeds[tab], isLoading: true },
        };
      });

      try {
        const response = await fetchTabContent(tab, userToken);
        setFeeds((prevFeeds) => ({
          ...prevFeeds,
          [tab]: {
            items: response.items,
            isLoading: false,
            hasMore: response.hasMore,
          },
        }));
      } catch (err) {
        const errorMessage = "Failed to fetch feed content. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);

        setFeeds((prevFeeds) => ({
          ...prevFeeds,
          [tab]: { ...prevFeeds[tab], isLoading: false },
        }));
      }
    },
    [userToken]
  );

  useEffect(() => {
    loadFeed(activeTab);
  }, [activeTab, loadFeed]);

  return {
    personalized: feeds.personalized,
    explore: feeds.explore,
    trending: feeds.trending,
    activeTab,
    setActiveTab,
    error,
  };
}
