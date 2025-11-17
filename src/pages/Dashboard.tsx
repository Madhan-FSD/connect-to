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
  Trophy,
  Gamepad2,
  Rss,
  Users,
} from "lucide-react";
import { reportsApi, userApi } from "@/lib/api";
import { CreatePostModal } from "@/components/CreatePostModal";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  handle: string;
  name?: string;
  subscribersCount?: number;
  avatarUrl: string;
  bannerUrl: string;
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
  channel: DashboardChannel;
  children?: DashboardChild[];
  gamesPlayed?: number;
  totalScore?: number;
  totalCoinsEarned?: number;
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

const CreatePostQuickButton = ({
  onShowCreatePost,
}: {
  onShowCreatePost: () => void;
}) => (
  <Button
    onClick={onShowCreatePost}
    className="w-full justify-start bg-blue-600 hover:bg-blue-700"
  >
    <PlusCircle className="h-5 w-5 mr-3" />
    Create New Post
  </Button>
);

interface ChildDashboardProps {
  data: UserDashboardData;
  profileId: string;
}

const ChildDashboard = ({ data, profileId }: ChildDashboardProps) => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [dailyReport, setDailyReport] = useState<{
    totalCoinsEarned: number;
    totalGamesPlayed: number;
  } | null>(null);
  const auth = getAuth();
  const childId = auth?.userId;

  const fetchChildData = useCallback(async () => {
    if (!childId) return;

    try {
      const { leaderboard } = await reportsApi.getLeaderboard(auth?.token);
      setLeaderboard(leaderboard.slice(0, 5));
    } catch (e) {
      console.error("Failed to fetch leaderboard:", e);
    }

    try {
      const report = await reportsApi.getDailyReport(childId, null, auth.token);
      setDailyReport(report.summary);
    } catch (e) {
      console.error("Failed to fetch daily report:", e);
    }
  }, [childId]);

  useEffect(() => {
    fetchChildData();
  }, [fetchChildData]);

  const displayName =
    `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Young Creator";

  const renderProfileCard = () => (
    <Card className="shadow-2xl border-t-8 border-t-primary/80">
      <CardHeader className="flex flex-col items-center pt-6">
        {data.avatar?.url ? (
          <img
            src={data.avatar.url}
            alt="Child Avatar"
            className="w-24 h-24 rounded-full object-cover mb-3 ring-4 ring-primary"
          />
        ) : (
          <div className="w-24 h-24 flex items-center justify-center rounded-full bg-primary/20 mb-3 ring-4 ring-primary">
            <User className="h-10 w-10 text-primary" />
          </div>
        )}
        <CardTitle className="text-3xl font-extrabold mt-2 text-center">
          {displayName}
        </CardTitle>
        <CardDescription className="text-center">
          {data.profileHeadline || "Your adventure starts here!"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pt-0 space-x-4">
        <Button
          onClick={() => navigate(`/profile/${profileId}`)}
          variant="default"
          size="sm"
        >
          <User className="h-4 w-4 mr-2" />
          View Profile
        </Button>
        <Button
          onClick={() => navigate("/ai-games")}
          variant="secondary"
          size="sm"
        >
          <Gamepad2 className="h-4 w-4 mr-2" />
          Play Games
        </Button>
      </CardContent>
    </Card>
  );

  const renderGameStats = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center text-green-600">
          <Zap className="h-5 w-5 mr-3" />
          Daily Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-3xl font-bold text-green-700">
            {data?.totalCoinsEarned || 0}
          </p>
          <p className="text-sm text-muted-foreground">Coins Earned Today</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-3xl font-bold text-blue-700">
            {data?.gamesPlayed || 0}
          </p>
          <p className="text-sm text-muted-foreground">Games Played Today</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderLeaderboard = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center text-yellow-600">
          <Trophy className="h-5 w-5 mr-3" />
          Top 5 Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {leaderboard.length > 0 ? (
          leaderboard.map((item: any, index: number) => (
            <div
              key={item.childId}
              className={`flex justify-between items-center p-2 rounded-md ${
                index === 0 ? "bg-yellow-100 font-bold" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-2">
                <span
                  className={`w-6 text-center ${
                    index < 3
                      ? "text-lg text-yellow-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {index + 1}.
                </span>
                <span className="truncate">{item.childName}</span>
              </div>
              <span className="font-semibold text-lg text-primary">
                {item.score}
              </span>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground">
            Leaderboard data not available.
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold text-primary">Adventure Dashboard</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left/Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {renderProfileCard()}
          {renderGameStats()}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {renderLeaderboard()}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-3 text-gray-500" />
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/reports")}
              >
                <Activity className="h-4 w-4 mr-2" />
                View Activity Report
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/rewards")}
              >
                <Award className="h-4 w-4 mr-2" />
                Redeem Rewards
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoadedSuccessfully, setDataLoadedSuccessfully] = useState(false);
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
      setDataLoadedSuccessfully(true);
    } catch {
      setDataLoadedSuccessfully(false);
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

  const renderProfileSection = (data: UserDashboardData) => {
    const hasProfileDetails =
      data.firstName || data.lastName || data.profileHeadline;

    const profilePath =
      data.role === "CHILD" ? `/profile/${data.id}` : `/profile`;
    const displayName =
      `${data.firstName || ""} ${data.lastName || ""}`.trim() || data.email;

    return (
      <Card className="shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl flex items-center">
            <User className="h-5 w-5 mr-3 text-primary" />
            {data.role === "PARENT" ? "Primary Profile" : "My Profile"}
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
          {data.avatar?.url ? (
            <div className="flex justify-center">
              <img
                src={data.avatar.url}
                alt="Profile Avatar"
                className="w-20 h-20 rounded-full object-cover mb-3"
              />
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                <User className="h-8 w-8 text-gray-600" />
              </div>
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

  const renderPostsFeed = (posts: DashboardPost[]) => {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-3 text-amber-500" />
            Recent Posts
          </CardTitle>
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowCreatePost(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Post
          </Button>
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
              <CreatePostQuickButton
                onShowCreatePost={() => setShowCreatePost(true)}
              />
            </div>
          )}
        </CardContent>
        <CreatePostModal
          open={showCreatePost}
          onOpenChange={setShowCreatePost}
          postTarget="profile"
          onPostCreated={() => {
            setShowCreatePost(false);
            toast.success("Your post has been created!");
          }}
        />
      </Card>
    );
  };

  const renderChannelOverview = (channel: DashboardChannel | null) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Rss className="h-5 w-5 mr-3 text-indigo-500" />
          My Channel
        </CardTitle>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/create-channel")}
        >
          <Plus className="h-4 w-4 mr-2" />

          {channel && channel._id ? "Edit Channel" : "New Channel"}
        </Button>
      </CardHeader>

      <CardContent>
        {channel && channel._id ? (
          <div className="space-y-4">
            <div className="flex items-end space-x-4">
              <img
                src={channel.avatarUrl || "placeholder-url"}
                alt="Avatar"
                className="h-16 w-16 rounded-full object-cover border-2 border-indigo-500"
              />
              <div>
                <h4 className="text-xl font-bold">{channel.name}</h4>
                <p className="text-sm text-indigo-600 font-mono">
                  {channel.handle}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1 text-indigo-500" />
                <span className="font-semibold text-gray-800 mr-1">
                  {channel.subscribersCount.toLocaleString()}
                </span>
                Subscribers
              </div>
              <a
                href={`/channel/${channel.handle.replace("@", "")}/${
                  channel._id
                }`}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View Page &rarr;
              </a>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Rss className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="font-semibold text-gray-700">
              Ready to share your insights?
            </p>
            <p className="text-sm text-gray-500">
              Create your personal channel to start posting and building a
              community.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderParentChildrenList = (childrenData: DashboardChild[]) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-3 text-purple-600" />
          Linked Children
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {childrenData.length > 0 ? (
          <div className="space-y-4">
            {childrenData.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between border p-3 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center space-x-3">
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
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/users/child/${child.id}`)}
                >
                  View Activity
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            No children profiles linked yet. Click "Add Child" above.
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto py-8 flex flex-col justify-center items-center h-[50vh]">
          <Loader2 className="h-8 w-8 mr-2 animate-spin text-primary" />
          <p className="mt-4 text-lg">Loading your personalized dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (!dashboardData || !dataLoadedSuccessfully) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto py-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-red-500 mb-6">
            We encountered an issue loading your full dashboard data, but you
            can still navigate the platform.
          </p>
          <Button onClick={() => navigate("/settings")}>Go to Settings</Button>
        </div>
      </Layout>
    );
  }

  const { role } = dashboardData;

  if (role === "CHILD") {
    return (
      <Layout>
        <ChildDashboard data={dashboardData} profileId={user.userId} />
      </Layout>
    );
  }

  const isParent = role === "PARENT";
  const childrenData = dashboardData.children || [];

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {isParent ? "Parent Management Dashboard" : "User Dashboard"}
          </h1>
          {isParent && <AddChildButton />}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {renderProfileSection(dashboardData)}
            {/* {renderPostsFeed(dashboardData.recentPosts)} */}
            {renderChannelOverview(dashboardData.channel)}
          </div>

          <div className="lg:col-span-1 space-y-6">
            {isParent &&
              childrenData.length > 0 &&
              renderParentChildrenList(childrenData)}
            {!isParent || childrenData.length === 0 ? (
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
                  {isParent && (
                    <div className="text-center text-muted-foreground pt-2">
                      Link your child profiles to monitor activity.
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </Layout>
  );
}
