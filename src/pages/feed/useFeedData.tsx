import { useState, useEffect, useCallback } from "react";
import { feedApi } from "@/lib/api";
import { toast } from "sonner";
import { Post } from "@/utils/post.interface";

type TabType = "personalized" | "subscriptions" | "explore" | "trending";

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
  items: any;
  hasMore: boolean;
}

const fetchTabContent = async (
  tab: TabType,
  token: string
): Promise<FetchResponse> => {
  switch (tab) {
    case "personalized":
      return feedApi.getPersonalizedFeed(token);
    case "subscriptions":
      return feedApi.getSubscriptionsFeed(token);
    case "explore":
      return feedApi.getExploreFeed(token);
    case "trending": {
      const trendingResponse = await feedApi.getTrendingPosts(token);
      return {
        items: {
          videos: trendingResponse.videos || [],
          posts: trendingResponse.posts || [],
        },
        hasMore: false,
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
    subscriptions: { items: [], isLoading: false, hasMore: true },
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

      setFeeds((prev) => ({
        ...prev,
        [tab]: { ...prev[tab], isLoading: true },
      }));

      try {
        const response = await fetchTabContent(tab, userToken);
        setFeeds((prev) => ({
          ...prev,
          [tab]: {
            items: response.items,
            isLoading: false,
            hasMore: response.hasMore,
          },
        }));
      } catch (err) {
        const message = "Failed to load feed.";
        setError(message);
        toast.error(message);
        setFeeds((prev) => ({
          ...prev,
          [tab]: { ...prev[tab], isLoading: false },
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
    subscriptions: feeds.subscriptions,
    explore: feeds.explore,
    trending: feeds.trending,
    activeTab,
    setActiveTab,
    error,
  };
}
