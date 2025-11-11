import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  Plus,
  User,
  Zap,
  Settings,
  BookOpen,
  Link,
  Star,
  Award,
  Heart,
  Activity,
  Loader2,
  PlusCircle,
} from "lucide-react";
import { userApi } from "@/lib/api";
import { CreatePostModal } from "@/components/CreatePostModal";

interface DashboardChild {
  id: string;
  firstName: string;
  lastName: string;
  dob?: string;
  avatar?: { url?: string; public_id?: string } | null;
  headline?: string | null;
}

interface DashboardPost {
  _id?: string;
  title?: string;
  content?: string;
  channelName?: string;
}

interface DashboardChannel {
  _id?: string;
  name?: string;
  postsCount?: number;
}

export interface UserDashboardData {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  dob?: string;
  avatar?: { url?: string; public_id?: string };
  profileHeadline?: string;
  role: "PARENT" | "NORMAL_USER" | "CHILD";
  skillsCount: number;
  certificationsCount: number;
  experiencesCount: number;
  educationsCount: number;
  interestsCount: number;
  achievementsCount: number;
  projectsCount: number;
  recentPosts: DashboardPost[];
  channels: DashboardChannel[];
  children?: DashboardChild[];
}

const AddChildButton = () => {
  const navigate = useNavigate();
  return (
    <Button onClick={() => navigate("/add-child")}>
      <Plus className="h-4 w-4 mr-2" />
      Add Child
    </Button>
  );
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const user = getAuth();
  const hasLoadedRef = useRef(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const fetchDashboard = useCallback(async () => {
    if (!user?.token || hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    setIsLoading(true);
    try {
      const data = await userApi.getDashboard(user.token);
      setDashboardData(data);
    } catch {
      toast.error("Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchDashboard();
  }, [fetchDashboard, navigate, user]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto py-8 flex justify-center items-center">
          <Loader2 className="h-6 w-6 mr-2 animate-spin text-primary" />
          <p>Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto py-8">
          <p className="text-center text-red-500">
            Error: Could not load user data.
          </p>
        </div>
      </Layout>
    );
  }

  const isChild = user.role === "CHILD";
  const isParent = user.role === "PARENT";
  const profileId = dashboardData.id || user.userId;

  const renderProfileSection = (data: UserDashboardData) => {
    const hasProfileDetails =
      data.firstName || data.lastName || data.profileHeadline;
    const profilePath = isChild ? `/profile/${profileId}` : `/profile`;
    const displayName = `${data.firstName || ""} ${data.lastName || ""}`.trim();

    return (
      <Card className="shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl flex items-center">
            <User className="h-5 w-5 mr-3 text-primary" />
            {isChild ? "My Profile" : "Primary Profile"}
          </CardTitle>
          <Button
            variant="outline"
            onClick={() => navigate(profilePath)}
            size="sm"
          >
            {hasProfileDetails ? "Edit Profile" : "Add Details"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {data.avatar?.url && (
            <div className="flex justify-center">
              <img
                src={data.avatar.url}
                alt="Profile Avatar"
                className="w-20 h-20 rounded-full object-cover mb-3"
              />
            </div>
          )}
          <p className="text-lg font-semibold">{displayName}</p>
          <p className="text-sm text-muted-foreground">
            {data.profileHeadline ||
              "Describe yourself by clicking 'Edit Profile'."}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div className="flex items-center space-x-2 justify-center">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">{data.skillsCount} Skills</span>
            </div>
            <div className="flex items-center space-x-2 justify-center">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm">{data.interestsCount} Interests</span>
            </div>
            <div className="flex items-center space-x-2 justify-center">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="text-sm">{data.certificationsCount} Certs</span>
            </div>
            <div className="flex items-center space-x-2 justify-center">
              <Award className="h-4 w-4 text-green-500" />
              <span className="text-sm">{data.achievementsCount} Achievs</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderChildProfiles = (children: DashboardChild[]) => (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Activity className="h-5 w-5 mr-3 text-purple-600" />
          Children
        </CardTitle>
      </CardHeader>
      <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {children.map((child) => (
          <div
            key={child.id}
            className="border rounded-lg p-3 flex flex-col items-center text-center hover:shadow-md transition"
          >
            {child.avatar?.url ? (
              <img
                src={child.avatar.url}
                alt={child.firstName}
                className="w-16 h-16 rounded-full object-cover mb-2"
              />
            ) : (
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-purple-100 mb-2">
                <User className="h-6 w-6 text-purple-600" />
              </div>
            )}
            <p className="font-semibold">{`${child.firstName} ${child.lastName}`}</p>
            <p className="text-sm text-muted-foreground">
              {child.headline || "No headline yet"}
            </p>
            <p className="text-xs text-gray-500">
              {child.dob ? new Date(child.dob).toLocaleDateString() : "N/A"}
            </p>
            <Button
              variant="link"
              size="sm"
              className="mt-2 p-0"
              onClick={() => navigate(`/users/child/${child.id}`)}
            >
              View Profile
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderPostsFeed = (posts: DashboardPost[]) => {
    return (
      <>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-3 text-amber-500" />
              Recent Posts
            </CardTitle>
          </CardHeader>

          <CardContent>
            {posts && posts.length > 0 ? (
              <div className="space-y-3">
                {posts.slice(0, 3).map((post, index) => (
                  <div
                    key={post._id || index}
                    className="border-l-4 border-amber-500 pl-3 py-1 cursor-pointer hover:bg-gray-50 p-1 rounded-md"
                    onClick={() => navigate(`/post/${post._id || "draft"}`)}
                  >
                    <p className="font-medium truncate">
                      {post.title ||
                        post.content?.substring(0, 30) ||
                        "Untitled Post"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Channel: {post.channelName || "General"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3 py-6 text-center text-muted-foreground">
                <p>No posts yet. Start by creating your first one!</p>
                <Button
                  onClick={() => setShowCreatePost(true)}
                  className="flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Create Post
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <CreatePostModal
          open={showCreatePost}
          onOpenChange={setShowCreatePost}
          postTarget="profile"
          onPostCreated={() => {
            setShowCreatePost(false);
            toast.success("Your post has been created!");
          }}
        />
      </>
    );
  };

  const renderChannelOverview = (channels: DashboardChannel[]) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Link className="h-5 w-5 mr-3 text-indigo-500" />
          My Channels
        </CardTitle>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/channels/create")}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Channel
        </Button>
      </CardHeader>
      <CardContent>
        {channels?.length > 0 ? (
          <div className="space-y-3">
            {channels.map((channel, index) => (
              <div
                key={channel._id || index}
                className="flex justify-between items-center border-b pb-2 last:border-b-0 cursor-pointer hover:bg-gray-50 p-1 rounded-md"
                onClick={() => navigate(`/channels/${channel._id || "main"}`)}
              >
                <span className="font-medium truncate">{channel.name}</span>
                <span className="text-sm text-muted-foreground">
                  {channel.postsCount || 0} Posts
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            You haven’t created any channels yet.
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (isParent) {
    const childrenData = dashboardData.children || [];

    return (
      <Layout>
        <div className="container max-w-6xl mx-auto py-8 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Parent Management Dashboard</h1>
            <AddChildButton />
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {renderProfileSection(dashboardData)}
              {renderPostsFeed(dashboardData.recentPosts)}
              {renderChannelOverview(dashboardData.channels)}
            </div>

            <div className="lg:col-span-1 space-y-6">
              {childrenData.length > 0 ? (
                childrenData.map((child) => (
                  <Card
                    key={child.id}
                    className="border-l-4 border-purple-500 shadow-sm"
                  >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="flex items-center space-x-3">
                        {child.avatar?.url ? (
                          <img
                            src={child.avatar.url}
                            alt={child.firstName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-purple-600" />
                          </div>
                        )}
                        <span className="font-semibold text-base">{`${child.firstName} ${child.lastName}`}</span>
                      </CardTitle>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/users/child/${child.id}`)}
                      >
                        View Profile
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {child.headline || "No headline yet"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        DOB:{" "}
                        {child.dob
                          ? new Date(child.dob).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No children profiles linked yet. Click "Add Child" to begin
                    monitoring activity.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isChild) {
    return (
      <Layout>
        <div className="container max-w-6xl mx-auto py-8 space-y-8">
          <h1 className="text-3xl font-bold text-primary">My Creative Space</h1>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {renderProfileSection(dashboardData)}
              {/* {renderPostsFeed(dashboardData.recentPosts)} */}
              {renderChannelOverview(dashboardData.channels)}
            </div>
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-3 text-gray-500" />
                    Account Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/settings")}
                  >
                    Manage Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">User Dashboard</h1>
          <AddChildButton />
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {renderProfileSection(dashboardData)}
            {renderPostsFeed(dashboardData.recentPosts)}
            {renderChannelOverview(dashboardData.channels)}
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-3 text-gray-500" />
                  Account Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/settings")}
                >
                  Manage Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
