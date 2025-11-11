import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { aiApi, userApi } from "@/lib/api";
import { getAuth } from "@/lib/auth";
import {
  Loader2,
  Shield,
  Edit,
  Save,
  User,
  Settings,
  Activity,
  RefreshCw,
} from "lucide-react";
import { permissionLabels } from "@/utils/permissions";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface PermissionSet {
  [key: string]: boolean;
}

interface ChildProfile {
  id: string;
  firstName: string;
  lastName: string;
  gender?: string;
  dob?: string;
  age?: number;
  about?: string;
  addresses?: any[];
  permissions: PermissionSet;
  avatar?: { url?: string; public_id?: string };
}

export default function ChildControlPage() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const user = getAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [permissions, setPermissions] = useState<PermissionSet>({});
  const [insights, setInsights] = useState<any>(null);

  const handlePermissionToggle = (key: string, value: boolean) => {
    setPermissions((prev) => ({ ...prev, [key]: value }));
  };

  const fetchChildDetails = useCallback(async () => {
    if (!childId || !user?.token) return;
    setIsLoading(true);
    try {
      const data = await userApi.getChildDetails(childId, user.token);
      setChildProfile(data.childProfile);
      setPermissions(data.childProfile.permissions || {});
      setActivity(data.activityLog || []);
    } catch {
      toast.error("Failed to load child details.");
    } finally {
      setIsLoading(false);
    }
  }, [childId, user?.token]);

  useEffect(() => {
    fetchChildDetails();
    handleRefreshInsights();
  }, [childId, user?.token]);

  const handleSavePermissions = async () => {
    if (!childId || !user?.token) return;
    setIsSaving(true);
    try {
      await userApi.updateChildPermissions(childId, permissions, user.token);
      toast.success("Permissions updated successfully.");
    } catch {
      toast.error("Failed to update permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshInsights = async () => {
    if (!childId || !user?.token) return;
    try {
      setIsLoading(true);
      const data = await aiApi.getActivityInsights(childId, user.token);
      if (data) {
        setInsights(data);
        toast.success("Fetched latest AI insights.");
      } else {
        toast.info("No new insights available.");
      }
    } catch (error) {
      console.error("Failed to fetch AI insights:", error);
      toast.error("Failed to fetch insights.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-6 w-6 mr-2 animate-spin text-primary" />
          <span>Loading child profile...</span>
        </div>
      </Layout>
    );
  }

  if (!childProfile) {
    return (
      <Layout>
        <div className="text-center py-10 text-red-500 font-semibold">
          Child profile not found.
        </div>
      </Layout>
    );
  }

  const { firstName, lastName, dob, age, gender, avatar, about } = childProfile;

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center">
            <User className="h-6 w-6 mr-2 text-primary" />
            Manage {firstName} {lastName}
          </h1>
          <Button variant="outline" onClick={() => navigate("/")} size="sm">
            Back to Dashboard
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Child Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                {avatar?.url ? (
                  <img
                    src={avatar.url}
                    alt="Child Avatar"
                    className="w-24 h-24 rounded-full mx-auto object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 mx-auto rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-10 w-10 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-lg">
                    {firstName} {lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {gender || "Gender: N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {dob
                      ? new Date(dob).toLocaleDateString()
                      : "DOB: Not provided"}
                  </p>
                  {age && <p className="text-sm text-gray-500">Age: {age}</p>}
                </div>
                <p className="text-sm text-muted-foreground italic">
                  {about || "No bio added yet."}
                </p>
                <Button
                  variant="secondary"
                  className="w-full mt-2"
                  onClick={() => toast.info("Edit form coming soon.")}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activity.length > 0 ? (
                  <ul className="space-y-2">
                    {activity.slice(0, 6).map((log, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">
                        {log.action || "Activity"} on{" "}
                        {new Date(log.timestamp).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-muted-foreground">
                    No recent activity found.
                  </p>
                )}
              </CardContent>
            </Card>

            {insights && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg font-semibold">
                    <Shield className="h-5 w-5 mr-2 text-indigo-600" />
                    AI Insights
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {insights.summary && (
                    <div className="bg-indigo-50/70 border-l-4 border-indigo-500 rounded-md p-4">
                      <p className="text-sm text-gray-700 leading-relaxed text-left">
                        {insights.summary}
                      </p>
                    </div>
                  )}

                  <Accordion type="single" collapsible className="space-y-2">
                    {Array.isArray(insights.patterns) &&
                      insights.patterns.length > 0 && (
                        <AccordionItem value="patterns">
                          <AccordionTrigger className="text-sm font-semibold text-gray-800">
                            Observed Patterns
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid sm:grid-cols-2 gap-3">
                              {insights.patterns.map(
                                (pattern: any, index: number) => (
                                  <div
                                    key={index}
                                    className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-all"
                                  >
                                    <p className="font-medium text-gray-900 text-sm mb-1">
                                      {pattern.name}
                                    </p>
                                    <p className="text-xs text-gray-600 leading-snug">
                                      {pattern.description}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}

                    {Array.isArray(insights.recommendations) &&
                      insights.recommendations.length > 0 && (
                        <AccordionItem value="recommendations">
                          <AccordionTrigger className="text-sm font-semibold text-gray-800">
                            Recommendations
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid sm:grid-cols-2 gap-3">
                              {insights.recommendations.map(
                                (rec: any, index: number) => (
                                  <div
                                    key={index}
                                    className="border rounded-lg p-3 bg-green-50 shadow-sm hover:shadow-md transition-all"
                                  >
                                    <p className="font-medium text-green-800 text-sm mb-1">
                                      {rec.title}
                                    </p>
                                    <p className="text-xs text-gray-600 leading-snug">
                                      {rec.reason}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Permission Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(permissions).map(([key, value]) => {
                    const label = permissionLabels[key] || key;
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between border rounded-xl px-4 py-2.5 bg-white/40 shadow-sm hover:shadow-md transition-all duration-150"
                      >
                        <div className="flex-1 pr-3">
                          <p className="text-[0.875rem] font-medium text-gray-800 leading-snug break-words">
                            {label}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Switch
                            checked={value}
                            onCheckedChange={(v) =>
                              handlePermissionToggle(key, v as boolean)
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  disabled={isSaving}
                  onClick={handleSavePermissions}
                  className="w-full"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Permission Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-gray-600" />
                  Profile Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    toast.info("Feature: Edit child's detailed profile soon")
                  }
                >
                  Update Skills & Interests
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    toast.info(
                      "Feature: Manage certifications and projects soon"
                    )
                  }
                >
                  Manage Certifications & Projects
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    toast.info("Feature: Add education details soon")
                  }
                >
                  Add Education
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
