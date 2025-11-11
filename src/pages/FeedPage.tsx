import React, { useState, useEffect, useCallback, useRef } from "react";
import { Zap, Compass, User, Loader2, RefreshCw } from "lucide-react";
import { feedApi } from "@/lib/api";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getAuth } from "@/lib/auth";
import { Layout } from "@/components/Layout";

interface Owner {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar?: {
    url?: string;
    public_id?: string;
  };
}
interface Post {
  _id: string;
  ownerId: Owner;
  title?: string;
  content: string;
  mediaUrl?: string;
  contentType: "TEXT" | "IMAGE" | "VIDEO";
  likeCount: number;
  commentsCount: number;
  createdAt: string;
}

type FeedState = {
  posts: Post[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
};

const useFeed = (feedType: "personalized" | "explore", userToken: string) => {
  const [feed, setFeed] = useState<FeedState>({
    posts: [],
    page: 1,
    hasMore: true,
    isLoading: false,
    error: null,
  });

  const fetchPosts = useCallback(
    async (pageToFetch: number, isInitialLoad: boolean = false) => {
      setFeed((prev) => {
        if (
          (prev.isLoading && !isInitialLoad) ||
          (!prev.hasMore && !isInitialLoad)
        )
          return prev;
        return { ...prev, isLoading: true, error: null };
      });

      try {
        let data;
        if (feedType === "personalized") {
          data = await feedApi.getPersonalizedFeed(userToken, pageToFetch);
        } else {
          data = await feedApi.getExploreFeed(userToken, pageToFetch);
        }

        const newPosts = Array.isArray(data.posts) ? data.posts : [];
        const limit = data.limit || 10;

        setFeed((prev) => ({
          ...prev,
          posts: pageToFetch === 1 ? newPosts : [...prev.posts, ...newPosts],
          page: pageToFetch + 1,
          hasMore: newPosts.length === limit,
          isLoading: false,
        }));
      } catch (e: any) {
        console.error(`Error fetching ${feedType} feed:`, e);
        setFeed((prev) => ({
          ...prev,
          error: `Failed to load ${feedType} feed.`,
          isLoading: false,
        }));
      }
    },
    [feedType, userToken]
  );

  const removePost = (postId: string) => {
    setFeed((prev) => ({
      ...prev,
      posts: prev.posts.filter((post) => post._id !== postId),
    }));
  };

  const refreshFeed = useCallback(() => {
    setFeed({
      posts: [],
      page: 1,
      hasMore: true,
      isLoading: false,
      error: null,
    });
    fetchPosts(1, true);
  }, [fetchPosts]);

  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  return { feed, fetchPosts, refreshFeed, removePost };
};

const useTrending = (userToken: string) => {
  const [trending, setTrending] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await feedApi.getTrendingPosts(userToken, 10);
      const posts = data.posts || [];
      setTrending(Array.isArray(posts) ? posts : []);
    } catch (e: any) {
      console.error("Error fetching trending posts:", e);
      setError("Failed to load trending topics.");
    } finally {
      setIsLoading(false);
    }
  }, [userToken]);

  const removePost = (postId: string) => {
    setTrending((prev) => prev.filter((post) => post._id !== postId));
  };

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return { trending, isLoading, error, fetchTrending, removePost };
};

export default function FeedPage() {
  const auth = getAuth();
  const [activeTab, setActiveTab] = useState<"personalized" | "explore">(
    "personalized"
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    feed: personalizedFeed,
    fetchPosts: fetchPersonalizedPosts,
    refreshFeed: refreshPersonalizedFeed,
    removePost: removePersonalizedPost,
  } = useFeed("personalized", auth.token);

  const {
    feed: exploreFeed,
    fetchPosts: fetchExplorePosts,
    refreshFeed: refreshExploreFeed,
    removePost: removeExplorePost,
  } = useFeed("explore", auth.token);

  const {
    trending,
    isLoading: isTrendingLoading,
    error: trendingError,
    fetchTrending,
    removePost: removeTrendingPost,
  } = useTrending(auth.token);

  const currentFeed =
    activeTab === "personalized" ? personalizedFeed : exploreFeed;
  const currentFetcher =
    activeTab === "personalized" ? fetchPersonalizedPosts : fetchExplorePosts;
  const currentRefresher =
    activeTab === "personalized" ? refreshPersonalizedFeed : refreshExploreFeed;

  const handlePostDeleted = (postId: string) => {
    removePersonalizedPost(postId);
    removeExplorePost(postId);
    removeTrendingPost(postId);
  };

  useEffect(() => {
    const scrollElement = scrollContainerRef.current;
    if (!scrollElement) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const { scrollTop, scrollHeight, clientHeight } = scrollElement;
        if (
          scrollHeight - scrollTop < clientHeight + 300 &&
          !currentFeed.isLoading &&
          currentFeed.hasMore
        ) {
          currentFetcher(currentFeed.page);
        }
        ticking = false;
      });
    };

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [
    activeTab,
    currentFetcher,
    currentFeed.hasMore,
    currentFeed.isLoading,
    currentFeed.page,
  ]);

  const LoadingSpinner = () => (
    <div className="flex justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  const renderFeedContent = (feed: FeedState) => {
    if (feed.error && feed.posts.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-red-500">{feed.error}</p>
          <Button onClick={currentRefresher} className="mt-4" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" /> Try Again
          </Button>
        </div>
      );
    }

    if (feed.posts.length === 0 && feed.isLoading) {
      return <LoadingSpinner />;
    }

    return (
      <>
        {feed.posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onDelete={() => handlePostDeleted(post._id)}
          />
        ))}

        {feed.isLoading && <LoadingSpinner />}

        {!feed.isLoading && !feed.hasMore && feed.posts.length > 0 && (
          <p className="text-center text-muted-foreground py-4">
            You've reached the end of the {activeTab} feed.
          </p>
        )}
      </>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-7xl px-4 py-8 h-screen">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <Compass className="h-8 w-8 text-primary" /> Global Feed
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)]">
          <div
            className="lg:col-span-2 overflow-y-scroll"
            ref={scrollContainerRef}
          >
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as any)}
            >
              <TabsList className="grid w-full grid-cols-2 mb-4 sticky top-0 bg-white z-10 shadow-sm">
                <TabsTrigger
                  value="personalized"
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" /> Personalized
                </TabsTrigger>
                <TabsTrigger
                  value="explore"
                  className="flex items-center gap-2"
                >
                  <Compass className="h-4 w-4" /> Explore
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personalized" className="mt-0">
                {renderFeedContent(personalizedFeed)}
              </TabsContent>

              <TabsContent value="explore" className="mt-0">
                {renderFeedContent(exploreFeed)}
              </TabsContent>
            </Tabs>
          </div>

          <div className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-yellow-500" /> Trending Posts
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={fetchTrending}
                  disabled={isTrendingLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      isTrendingLoading ? "animate-spin" : ""
                    }`}
                  />
                </Button>
              </CardHeader>
              <CardContent>
                {isTrendingLoading && trending.length === 0 ? (
                  <p className="text-center py-4 text-sm text-muted-foreground">
                    Loading trending...
                  </p>
                ) : trendingError ? (
                  <p className="text-sm text-red-500">{trendingError}</p>
                ) : trending.length > 0 ? (
                  <div className="space-y-3">
                    {trending.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        onDelete={() => handlePostDeleted(post._id)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No trending posts right now.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
