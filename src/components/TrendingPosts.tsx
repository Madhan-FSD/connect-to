import { useEffect, useState } from "react";
import { feedApi } from "@/lib/api/feed.api";
import { TrendingPostCard } from "@/components/TrendingPostCard";
import { getAuth } from "@/lib/auth";

export function TrendingPosts() {
  const user = getAuth();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await feedApi.getTrendingPosts(user.token, 5);
      setPosts(data.posts || []);
    })();
  }, []);

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <TrendingPostCard key={post._id} post={post} />
      ))}
    </div>
  );
}
