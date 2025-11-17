import React, { useEffect, useState } from "react";
import { getAuth } from "@/lib/auth";
import VideoCard from "@/components/channel/ChannelVideo";
import PostCard from "@/components/channel/PostCard";
import { Button } from "@/components/ui/button";
import { feedApi } from "@/lib/api";

export default function SubscriptionsPage() {
  const auth = getAuth();
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const resp = await feedApi.getSubscriptions(auth.token, p, limit);
      const fetched = resp.items || [];
      if (p === 1) setItems(fetched);
      else setItems((s) => [...s, ...fetched]);

      const total = resp.pagination?.total || fetched.length;
      setHasMore(p * limit < total);
    } catch (err) {
      console.error("subscriptions load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(next);
  };

  if (!items.length && !loading)
    return (
      <div className="p-8 text-gray-500">
        No content from subscribed channels yet.
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Subscriptions</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) =>
          it.type === "VIDEO" ? (
            <VideoCard
              key={it._id}
              video={it}
              onPlay={() => {
                if (it.restricted) {
                  alert("This video is locked. Subscribe/Pay to view.");
                } else {
                  // open player (implement as needed)
                  console.log("Play", it._id);
                }
              }}
              onSubscribeCTA={() => {
                alert("Subscribe to unlock");
              }}
            />
          ) : (
            <PostCard
              key={it._id}
              post={it}
              onOpen={() => {
                if (it.restricted) {
                  alert("This post is locked. Subscribe/Pay to view.");
                } else {
                  console.log("Open post", it._id);
                }
              }}
              onSubscribeCTA={() => {
                alert("Subscribe to unlock");
              }}
            />
          )
        )}
      </div>

      <div className="mt-6 text-center">
        {hasMore ? (
          <Button onClick={loadMore} disabled={loading}>
            {loading ? "Loading..." : "Load more"}
          </Button>
        ) : (
          <div className="text-sm text-gray-500">No more items</div>
        )}
      </div>
    </div>
  );
}
