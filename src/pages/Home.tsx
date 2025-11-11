import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CreatePostModal } from "@/components/CreatePostModal";
import { getAuth } from "@/lib/auth";
import { Plus, Users, Award, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { feedApi, userApi } from "@/lib/api";

/**
 * Component to display the AI-selected featured articles (Items).
 * This component has been completely refactored to use the new 'items' array.
 */
const FeaturedContentCard = ({ featuredContent }) => {
  if (
    !featuredContent ||
    !featuredContent.items ||
    featuredContent.items.length === 0
  ) {
    return null;
  }

  const { introHeadline, items, generatedAt } = featuredContent;

  return (
    <Card className="p-4 sm:p-6 bg-red-50 border-red-200 shadow-md">
      <div className="flex items-center space-x-3 mb-4">
        <Award className="h-6 w-6 text-red-600" />
        <h2 className="text-xl font-bold text-red-700 tracking-wide">
          {introHeadline}
        </h2>
        <span className="text-sm text-gray-500 ml-auto whitespace-nowrap">
          Generated: {new Date(generatedAt).toLocaleDateString()}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <div
            key={item._id || index}
            className="group p-4 bg-white rounded-lg border border-red-100 hover:border-red-300 transition-all cursor-pointer shadow-sm"
            onClick={() => console.log("Suggestion clicked:", item.headline)}
          >
            <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full text-red-700 bg-red-100">
              {item.category}
            </span>

            <h3 className="mt-2 text-lg font-bold text-gray-800 group-hover:text-red-600 transition-colors line-clamp-2">
              {item.headline}
            </h3>

            <p className="mt-1 text-sm text-gray-600 line-clamp-3">
              {item.summary}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

/**
 * Component for a single Post Card in the Latest Posts Feed. (NO CHANGE)
 */
const PostCard = ({ post }) => (
  <Card className="p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
      {post.title}
    </h3>
    <p className="text-sm text-gray-500 mt-1 line-clamp-3">{post.content}</p>
    <div className="flex justify-between items-center text-xs text-gray-400 mt-3 border-t pt-2">
      <span className="font-medium">{post.contentType}</span>
      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
    </div>
  </Card>
);

export default function Home() {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [userFullDetails, setUserFullDetails] = useState(null);
  const user = getAuth();
  const navigate = useNavigate();

  const canAddChild = useMemo(
    () => user?.role === "NORMAL_USER" || user?.role === "PARENT",
    [user?.role]
  );

  const personalInfo = userFullDetails?.personalInfo;
  const posts = userFullDetails?.posts || [];

  const featuredContent = personalInfo?.featuredContent;

  const latestPosts = useMemo(() => {
    return [...posts].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [posts]);

  useEffect(() => {
    fetchUserDetails();
    fetchPersonalisedFeed();
  }, []);

  const fetchUserDetails = async () => {
    if (!user) return;
    try {
      const data = await userApi.profile.profile.get(user.token);
      setUserFullDetails(data);
    } catch (error) {
      toast.error("Failed to load dashboard");
    }
  };

  const fetchPersonalisedFeed = async () => {
    if (!user) return;
    try {
      const data = await feedApi.getExploreFeed(user.token, 1);
      // setUserFullDetails(data);
    } catch (error) {
      toast.error("Failed to load dashboard");
    }
  };

  const userNameDisplay =
    personalInfo?.email?.split("@")[0] || user?.name || "User";
  const hasPosts = latestPosts.length > 0;

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <header className="pb-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                Welcome back,{" "}
                <span className="text-red-600">{userNameDisplay}</span>
              </h1>
              <p className="text-md text-gray-500">
                Manage your profile and share your latest creations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {canAddChild && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/add-child")}
                  className="w-full justify-center sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Add Child
                </Button>
              )}

              <Button
                onClick={() => setShowCreatePost(true)}
                className="w-full justify-center sm:w-auto bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </div>
          </div>
        </header>

        <FeaturedContentCard featuredContent={featuredContent} />

        <section className="space-y-4 pt-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Latest Posts ({latestPosts.length})
            </h2>
          </div>

          {hasPosts ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center bg-white shadow-xl">
              <div className="border border-dashed border-gray-300 p-6 rounded-lg bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-700 mb-2">
                  Your Profile Feed is Empty
                </h2>
                <p className="text-md text-gray-500">
                  Click **"Create Post"** above to start sharing your content!
                </p>
              </div>
            </Card>
          )}
        </section>
      </div>

      <CreatePostModal
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        postTarget="profile"
      />
    </Layout>
  );
}
