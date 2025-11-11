import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { toast } from "sonner";

import { getAuth } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Brain, Activity } from "lucide-react";
import { AIInsightsPanel } from "@/components/AllInsights";
import { userApi } from "@/lib/api";

export default function ChildDetails() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [childData, setChildData] = useState<any>(null);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = getAuth();

  useEffect(() => {
    fetchChildDetails();
  }, [childId]);

  const fetchChildDetails = async () => {
    if (!user || !childId) return;
    try {
      const response = await userApi.getChildActivityLog(childId, user.token);
      setChildData(response.childProfile);
      setActivityLog(response.activityLog || []);
    } catch (error) {
      toast.error("Failed to load child details");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionChange = async (
    permissionKey: string,
    value: boolean
  ) => {
    if (!user || !childId) return;
    try {
      await userApi.updateChildPermission(
        childId,
        permissionKey,
        value,
        user.token
      );
      toast.success("Permission updated");
      fetchChildDetails();
    } catch (error) {
      toast.error("Failed to update permission");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto py-8">
          <p className="text-center">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!childData) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto py-8">
          <p className="text-center">Child not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-8 space-y-6">
        <Button variant="ghost" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">
                {childData.name[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{childData.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Age: {childData.age}
              </p>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="permissions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-2" />
              Activity Log
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Brain className="h-4 w-4 mr-2" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="permissions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="canPost">Can Post</Label>
                  <Switch
                    id="canPost"
                    checked={childData.permissions.canPost}
                    onCheckedChange={(checked) =>
                      handlePermissionChange("canPost", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="canComment">Can Comment</Label>
                  <Switch
                    id="canComment"
                    checked={childData.permissions.canComment}
                    onCheckedChange={(checked) =>
                      handlePermissionChange("canComment", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="canLike">Can Like</Label>
                  <Switch
                    id="canLike"
                    checked={childData.permissions.canLike}
                    onCheckedChange={(checked) =>
                      handlePermissionChange("canLike", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="canCreateChannel">Can Create Channel</Label>
                  <Switch
                    id="canCreateChannel"
                    checked={childData.permissions.canCreateChannel}
                    onCheckedChange={(checked) =>
                      handlePermissionChange("canCreateChannel", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activityLog.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No recent activity
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activityLog.map((activity) => (
                      <div
                        key={activity._id}
                        className="border-l-2 border-primary pl-4 py-2"
                      >
                        <p className="font-medium">{activity.activityType}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <AIInsightsPanel childId={childId!} childName={childData.name} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
