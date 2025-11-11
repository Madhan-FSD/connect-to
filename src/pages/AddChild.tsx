import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { userApi } from "@/lib/api";
import { getAuth } from "@/lib/auth";
import { useState } from "react";
import { toast } from "sonner";

export default function AddChild() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [profileHeadline, setProfileHeadline] = useState("");

  const [permissions, setPermissions] = useState({
    canCreateChannel: true,
    canPost: true,
    canUpdateCoreProfile: false,
    canUpdateAvatar: false,
    canDeleteAvatar: false,
    canAddProfileBanner: false,
    canUpdateProfileBanner: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = getAuth();
  const navigate = (path: string) =>
    console.log(`Attempting to navigate to: ${path}`);

  const handlePermissionChange = (
    key: keyof typeof permissions,
    checked: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !dob.trim() ||
      !accessCode.trim()
    ) {
      toast.error(
        "First Name, Last Name, Date of Birth, and Access Code are required fields."
      );
      return;
    }

    const childData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dob: dob.trim(),
      accessCode: accessCode.trim(),
      profileHeadline: profileHeadline.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      const creationResult = await userApi.addChild(childData, user!.token);
      const newChildId = creationResult?.child?.id;

      if (newChildId) {
        await userApi.updateChildPermissions(
          newChildId,
          permissions,
          user!.token
        );
      }

      toast.success("Child profile created and permissions set successfully.");
      navigate("/");
    } catch (error: any) {
      const errorMessage =
        error?.message || error?.error || "Failed to add child profile.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPermissionCheckbox = (
    key: keyof typeof permissions,
    label: string
  ) => (
    <div className="flex flex-row items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-shadow hover:shadow-md">
      <Label
        htmlFor={key}
        className="text-sm font-semibold leading-snug mb-2 text-gray-700 dark:text-gray-200"
      >
        {label}
      </Label>
      <div className="flex justify-start">
        <Switch
          id={key}
          checked={permissions[key]}
          onCheckedChange={(checked) => handlePermissionChange(key, !!checked)}
        />
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container max-w-lg mx-auto py-8 font-inter">
        <Card className="border-gray-300 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Add New Child Profile</CardTitle>
            <CardDescription>
              Create a new profile and set initial access controls.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="E.g., Alex"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="E.g., Johnson"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accessCode">Access Code *</Label>
                    <Input
                      id="accessCode"
                      type="password"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="Set a 4-6 digit code"
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      This code is for the child's login.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profileHeadline">
                    Profile Headline (Optional)
                  </Label>
                  <Textarea
                    id="profileHeadline"
                    value={profileHeadline}
                    onChange={(e) => setProfileHeadline(e.target.value)}
                    placeholder="A short title for their profile, e.g., 'Future Coder'"
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                  Initial Social & Creation Access
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  {renderPermissionCheckbox(
                    "canCreateChannel",
                    "Channel Creation"
                  )}
                  {renderPermissionCheckbox("canPost", "Post Creation")}
                  {renderPermissionCheckbox("canComment", "Commenting")}
                  {renderPermissionCheckbox("canLike", "Liking/Reacting")}
                </div>

                <h3 className="text-lg font-bold pt-4 text-gray-900 dark:text-gray-50">
                  Profile Identity Control
                </h3>

                <div className="grid grid-cols-1  gap-3">
                  {renderPermissionCheckbox(
                    "canUpdateCoreProfile",
                    "Edit Core Profile"
                  )}
                  {renderPermissionCheckbox(
                    "canAddAvatar",
                    "Add Profile Picture"
                  )}
                  {renderPermissionCheckbox(
                    "canAddProfileBanner",
                    "Add Profile Banner"
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-4 dark:text-gray-400">
                  All other profile sections are **allowed by default**.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Adding Profile..." : "Add Child Profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
