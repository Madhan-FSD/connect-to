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
  Trophy,
  Target,
  Loader2,
} from "lucide-react";
import { childApi, reportsApi, userApi } from "@/lib/api";

interface RecentPost {
  _id: string;
  title?: string;
  content?: string;
  channelName?: string;
}

interface UserChannel {
  _id?: string;
  name: string;
  postsCount?: number;
}

interface CuratedContent {}

interface SocialActivity {
  recentPosts: RecentPost[];
  userChannel: UserChannel | null;
  curatedContent: CuratedContent | null;
}

interface ChildProfileCounts {
  interestsCount: number;
  skillsCount: number;
  certificationsCount: number;
  achievementsCount: number;
  projectsCount: number;
  educationsCount: number;
  activitiesCount: number;
  insightsCount: number;
}

interface ChildProfileSummary {
  _id: string;
  firstName?: string;
  lastName?: string;
  gender?: "Male" | "Female" | "Other" | "Prefer not to say";
  dob?: string;
  about?: string;
  avatar?: { url?: string; public_id?: string };

  profileCounts: ChildProfileCounts;
  permissions: Record<string, boolean>;
}

export interface UserDashboardData {
  _id: string;
  role: "PARENT" | "NORMAL_USER" | "CHILD";
  email: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  about?: string;
  profileHeadline?: string;

  skillsCount: number;
  certificationsCount: number;
  experiencesCount: number;
  educationsCount: number;
  interestsCount: number;
  achievementsCount: number;
  projectsCount: number;

  socialActivity: SocialActivity;

  children?: ChildProfileSummary[];
}

interface SuggestedContent {
  _id: string;
  title: string;
  icon?: string;
}

interface LeaderboardItem {
  id: string;
  name: string;
  score: number;
  rank: number;
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const user = getAuth();

  const hasLoadedRef = useRef(false);

  const fetchDashboard = useCallback(async () => {
    if (!user?.token || hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    setIsLoading(true);
    try {
      let data: UserDashboardData;
      if (
        user.role === "PARENT" ||
        user.role === "NORMAL_USER" ||
        user.role === "CHILD"
      ) {
        data = await userApi.getDashboard(user.token);
      } else {
        throw new Error("Role not supported by dashboard fetch.");
      }

      setDashboardData(data);
    } catch (error) {
      console.error(error);
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
        <div className="container max-w-4xl mx-auto py-8">
          <p className="text-center flex items-center justify-center">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Loading
            dashboard...
          </p>
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
  const isNormalUser = user.role === "NORMAL_USER";

  const profileId = dashboardData._id || user.userId;

  const renderProfileSection = (data: UserDashboardData) => {
    const hasProfileDetails =
      data.firstName || data.lastName || data.about || data?.profileHeadline;

    const profilePath = isChild ? `/profile/${profileId}` : `/profile`;

    const hasPortfolioData =
      data?.about ||
      data?.interestsCount ||
      data?.certificationsCount ||
      data?.profileHeadline ||
      data?.achievementsCount ||
      data?.certificationsCount ||
      data?.educationsCount ||
      data?.experiencesCount ||
      data?.projectsCount;

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

        <CardContent className="space-y-4">
          <p className="text-lg font-semibold">{displayName}</p>
          <p className="text-sm">
            {data.about || "Describe yourself by clicking 'Edit Profile'."}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">{data.skillsCount} Skills</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm">{data.interestsCount} Interests</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="text-sm">{data.certificationsCount} Certs</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-green-500" />
              <span className="text-sm">{data.achievementsCount} Achievs</span>
            </div>
          </div>

          {!hasPortfolioData && (
            <p className="text-center text-sm text-muted-foreground pt-4">
              Complete your profile by adding Skills and Achievements.
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderChannelOverview = (socialActivity: SocialActivity) => {
    const channels: UserChannel[] = socialActivity.userChannel
      ? [socialActivity.userChannel]
      : [];

    return (
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
          {channels.length > 0 ? (
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
              You haven't created any channels yet.
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderPostsFeed = (socialActivity: SocialActivity) => {
    const posts = socialActivity.recentPosts;

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-3 text-amber-500" />
            Recent Posts
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/feed")}>
            View Feed
          </Button>
        </CardHeader>
        <CardContent>
          {posts.length > 0 ? (
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
            <p className="text-center text-muted-foreground">
              Time to make your first post!
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderChildGamification = (childId: string, token: string) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchGamificationData = async () => {
        setLoading(true);
        try {
          const leaderboardData = await reportsApi.getLeaderboard(token);

          setLeaderboard(leaderboardData.leaderboard || []);
        } catch (error) {
          console.error(error);
          toast.error("Failed to load gamification data.");
        } finally {
          setLoading(false);
        }
      };
      fetchGamificationData();
    }, [childId, token]);

    if (loading) {
      return (
        <Card>
          <CardContent className="py-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          </CardContent>
        </Card>
      );
    }

    const content: SuggestedContent[] = [
      { _id: "1", title: "Start Python Basics Quiz" },
      { _id: "2", title: "Complete HTML Fundamentals Module" },
    ];

    return (
      <div className="space-y-6">
        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Trophy className="h-5 w-5 mr-3 text-yellow-600" />
              Global Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.map((item) => (
                  <div
                    key={item.id}
                    className={`flex justify-between items-center p-2 rounded-lg ${"text-muted-foreground"}`}
                  >
                    <span>
                      {item.rank}. {item.name}
                    </span>
                    <span className="text-lg">{item.score} pts</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center">
                No current rankings available.
              </p>
            )}
            <Button variant="link" size="sm" className="mt-2 p-0">
              View Full Rankings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Target className="h-5 w-5 mr-3 text-green-600" />
              AI Suggested Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {content.length > 0 ? (
              content.map((item) => (
                <Button
                  key={item._id}
                  variant="outline"
                  className="w-full justify-start border-l-4 border-green-500"
                  onClick={() => navigate(`/content/${item._id}`)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {item.title}
                </Button>
              ))
            ) : (
              <p className="text-muted-foreground text-center">
                No new content suggestions right now.
              </p>
            )}
            <Button variant="link" size="sm" className="mt-2 p-0">
              Explore Learning Paths
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderChildInsights = (children: ChildProfileSummary[]) => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold flex items-center">
        <Activity className="h-5 w-5 mr-3 text-purple-600" />
        Child Activity & Insights
      </h2>

      {children.map((child) => (
        <Card key={child._id} className="border-l-4 border-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-xl">
              {`${child.firstName || ""} ${child.lastName || ""}`.trim() ||
                "Unnamed Child"}
            </CardTitle>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/users/child/${child._id}`)}
            >
              View Full Report
            </Button>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-purple-600">
                  Total Skills
                </p>
                {/* Fix 5: Use existing profileCounts from the interface */}
                <p className="text-2xl font-bold">
                  {child.profileCounts.skillsCount}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-purple-600">
                  Total Projects
                </p>
                {/* Fix 6: Use existing profileCounts from the interface */}
                <p className="text-2xl font-bold">
                  {child.profileCounts.projectsCount}
                </p>
              </div>
            </div>

            <CardDescription className="pt-4 border-t mt-4">
              **Profile Summary:**{" "}
              {child.about ||
                "No profile description available. Encourage them to complete their details."}
            </CardDescription>

            <Button
              variant="link"
              className="p-0 mt-3"
              onClick={() => navigate(`/users/child/${child._id}`)}
            >
              See Recent Activity Log
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const socialActivity = dashboardData.socialActivity;

  if (isChild) {
    return (
      <Layout>
        <div className="container max-w-6xl mx-auto py-8 space-y-8">
          <h1 className="text-3xl font-bold text-primary">My Creative Space</h1>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {renderProfileSection(dashboardData)}
              {renderPostsFeed(socialActivity)}
              {renderChannelOverview(socialActivity)}
            </div>

            <div className="lg:col-span-1 space-y-6">
              {renderChildGamification(profileId, user.token)}
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

  if (isParent) {
    const childrenData = dashboardData.children || [];

    return (
      <Layout>
        <div className="container max-w-6xl mx-auto py-8 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Parent Management Dashboard</h1>
            <div className="space-x-4">
              <Button onClick={() => navigate("/add-child")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Child
              </Button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {childrenData.length > 0 ? (
                renderChildInsights(childrenData)
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No children profiles are linked yet. Click **"Add Child"**
                    to begin monitoring activity.
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              {renderProfileSection(dashboardData)}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-3 text-gray-500" />
                    Management & Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/settings")}
                  >
                    Manage Account
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/controls")}
                  >
                    Manage Permissions
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
        <h1 className="text-3xl font-bold">User Dashboard</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {" "}
          <div className="lg:col-span-2 space-y-6">
            {renderProfileSection(dashboardData)}

            {renderPostsFeed(socialActivity)}

            {renderChannelOverview(socialActivity)}
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
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => toast.info("Logout function not implemented.")}
                >
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
