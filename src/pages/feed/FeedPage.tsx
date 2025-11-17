import { useMemo } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { getAuth } from "@/lib/auth";
import { useFeedData } from "./useFeedData";
import { Post } from "@/utils/post.interface";
import { VideoCard } from "@/components/card/VideoCard";
import { PostCard } from "@/components/card/PostCard";

const renderItem = (item: Post) => {
  if (item.contentType === "VIDEO_CHANNEL") {
    return <VideoCard key={item._id} post={item} />;
  }
  return <PostCard key={item._id} post={item} />;
};

export default function FeedPage() {
  const user = getAuth();
  const initialTab = "personalized";

  const { personalized, explore, trending, activeTab, setActiveTab, error } =
    useFeedData(initialTab, user?.token || "");

  const currentFeed = useMemo(() => {
    switch (activeTab) {
      case "personalized":
        return personalized;
      case "explore":
        return explore;
      case "trending":
        return trending;
      default:
        return personalized;
    }
  }, [activeTab, personalized, explore, trending]);

  const normalizedTrendingItems = useMemo(() => {
    if (!Array.isArray(trending.items) && trending.items) {
      const videos = trending.items.videos || [];
      const posts = trending.items.posts || [];

      if (videos.length === 0 && posts.length === 0) {
        return [];
      }

      return [...posts, ...videos];
    }

    return Array.isArray(trending.items) ? trending.items : [];
  }, [trending.items]);

  const currentFeedItemsCount = useMemo(() => {
    if (activeTab === "trending") {
      return normalizedTrendingItems.length;
    }

    return Array.isArray(currentFeed.items) ? currentFeed.items.length : 0;
  }, [activeTab, currentFeed.items, normalizedTrendingItems]);

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen p-4 sm:p-8">
          <div className="bg-card border border-destructive rounded-xl shadow-lg p-6 sm:p-8 text-center max-w-lg w-full">
            <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-bold text-destructive mb-2">
              Error Loading Feed
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              {error}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="destructive"
            >
              Reload Page
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as typeof activeTab)}
            className="w-full"
          >
            <div className="bg-card border border-border rounded-lg mb-4 sticky top-0 z-10 shadow-sm">
              <TabsList className="w-full grid grid-cols-3 h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="personalized"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 sm:py-4 text-xs sm:text-sm font-semibold"
                >
                  For you
                </TabsTrigger>
                <TabsTrigger
                  value="explore"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 sm:py-4 text-xs sm:text-sm font-semibold"
                >
                  Explore
                </TabsTrigger>
                <TabsTrigger
                  value="trending"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 sm:py-4 text-xs sm:text-sm font-semibold"
                >
                  Trending
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="personalized" className="mt-0">
              {personalized.isLoading && currentFeedItemsCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-20">
                  <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary mb-4" />
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Loading your personalized feed...
                  </p>
                </div>
              ) : currentFeedItemsCount === 0 ? (
                <div className="text-center py-12 sm:py-20">
                  <p className="text-base sm:text-lg text-muted-foreground mb-4">
                    No posts to show yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Start following people to see their posts here
                  </p>
                </div>
              ) : (
                <div className="space-y-0">
                  {Array.isArray(personalized.items) &&
                    personalized.items.map((item) => renderItem(item))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="explore" className="mt-0">
              {explore.isLoading && currentFeedItemsCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-20">
                  <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary mb-4" />
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Exploring content...
                  </p>
                </div>
              ) : currentFeedItemsCount === 0 ? (
                <div className="text-center py-12 sm:py-20">
                  <p className="text-base sm:text-lg text-muted-foreground">
                    No posts available to explore
                  </p>
                </div>
              ) : (
                <div className="space-y-0">
                  {Array.isArray(explore.items) &&
                    explore.items.map((item) => renderItem(item))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="trending" className="mt-0">
              {trending.isLoading && normalizedTrendingItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-20">
                  <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary mb-4" />
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Loading trending content...
                  </p>
                </div>
              ) : normalizedTrendingItems.length === 0 ? (
                <div className="text-center py-12 sm:py-20">
                  <p className="text-base sm:text-lg text-muted-foreground">
                    No trending posts at the moment
                  </p>
                </div>
              ) : (
                <div className="space-y-0">
                  {normalizedTrendingItems.map((item) => renderItem(item))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
