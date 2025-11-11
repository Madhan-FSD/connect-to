import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import { getAuth } from "@/lib/auth";
import { userApi, childApi, aiApi, postApi } from "@/lib/api";
import ProfileDetailsManager from "@/components/profile/ProfileDetailsManager";
import { Card, CardContent } from "@/components/ui/card";
import { CreatePostModal } from "@/components/CreatePostModal";
import { PostCard } from "@/components/PostCard";
import { AIProfileBuilder } from "@/components/AiProfileBuilder";

export default function ProfilePage() {
  const { childId } = useParams<{ childId?: string }>();
  const auth = useMemo(() => getAuth(), []);
  const [profileData, setProfileData] = useState<any>(null);
  const [posts, setPosts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState("details");
  const [showCreatePost, setShowCreatePost] = useState(false);

  const isChildProfile = !!childId || auth.role === "CHILD";
  const viewedChildId = childId || (auth.role === "CHILD" ? auth.userId : null);

  const fetchProfileData = useCallback(async () => {
    try {
      const profile = viewedChildId
        ? await childApi.profile.getFullProfile(viewedChildId, auth.token)
        : await userApi.profile.fullProfile.get(auth.token);
      setProfileData(profile);
    } catch (err) {
      toast.error("Failed to fetch profile data");
    }
  }, [viewedChildId, auth]);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await postApi.getFeed(
        viewedChildId || auth.userId,
        "PROFILE",
        auth.token
      );
      setPosts(res.posts || []);
    } catch {
      toast.error("Failed to load posts");
    }
  }, [viewedChildId, auth]);

  const fetchRecommendations = useCallback(async () => {
    try {
      const res = await aiApi.getSmartRecommendations(
        viewedChildId || auth.userId,
        auth.token
      );
      setRecommendations(res.recommendations || []);
    } catch {
      toast.error("Failed to load recommendations");
    }
  }, [viewedChildId, auth]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData, fetchPosts]);

  useEffect(() => {
    if (activeTab === "recommendations") fetchRecommendations();
  }, [activeTab, fetchRecommendations]);

  if (!profileData) {
    return (
      <Layout>
        <div className="p-10 text-center">Loading profile...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="details">Profile Details</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="ai-builder">
              <Sparkles className="h-4 w-4 mr-2" /> AI Builder
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <Zap className="h-4 w-4 mr-2" /> Smart Recs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <ProfileDetailsManager
              user={auth}
              profileData={profileData}
              fetchProfileData={fetchProfileData}
              setProfileData={setProfileData}
              childId={viewedChildId}
            />
          </TabsContent>

          <TabsContent value="posts">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="py-6 text-center text-muted-foreground">
                  No posts yet.
                </CardContent>
              </Card>
            ) : (
              posts.map((p) => <PostCard key={p._id} post={p} />)
            )}
          </TabsContent>

          <TabsContent value="ai-builder">
            <AIProfileBuilder profileData={profileData} />
          </TabsContent>

          <TabsContent value="recommendations">
            {recommendations.length === 0 ? (
              <Card>
                <CardContent className="py-6 text-center text-muted-foreground">
                  No recommendations available.
                </CardContent>
              </Card>
            ) : (
              recommendations.map((r, i) => (
                <Card
                  key={i}
                  className="p-4 rounded-xl mb-4 bg-white shadow-sm border border-gray-100 
               transition-all duration-200 
               hover:shadow-md hover:bg-gray-50 
               cursor-pointer"
                >
                  <p className="text-base font-bold text-gray-800 leading-snug">
                    {r.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{r.reason}</p>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreatePostModal
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        postTarget="profile"
        onPostCreated={() => {
          fetchPosts();
          setShowCreatePost(false);
        }}
      />
    </Layout>
  );
}
