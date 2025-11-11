import React, { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Zap,
  Briefcase,
  GraduationCap,
  Award,
  BookOpen,
  Heart,
  Pencil,
  Trash2,
  Check,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { userApi, childApi } from "@/lib/api";
import ProfileSection from "./ProfileSection";
import { Label } from "../ui/label";

export default function ProfileDetailsManager({
  user,
  profileData,
  fetchProfileData,
  childId = null,
}: any) {
  const [editingCore, setEditingCore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [formData, setFormData] = useState(profileData || {});

  const isChildProfile = !!childId || user.role === "CHILD";

  const canEdit =
    !isChildProfile ||
    (profileData?.permissions?.canUpdateCoreProfile && user.role === "CHILD");

  const canChangeBanner = profileData?.permissions?.canAddProfileBanner;
  const canDeleteBanner = profileData?.permissions?.canDeleteProfileBanner;
  const canChangeAvatar = profileData?.permissions?.canAddAvatar;
  const canDeleteAvatar = profileData?.permissions?.canDeleteAvatar;

  const isAdultRole = user.role === "PARENT" || user.role === "NORMAL_USER";
  const isParentViewingChild = !!childId && user.role === "PARENT";
  const isAdultViewingSelf = !isChildProfile && isAdultRole;
  const userCanEditMedia = isParentViewingChild || isAdultViewingSelf;

  const handleChange = (key, value) => {
    if (key.includes(".")) {
      const [outerKey, innerKey] = key.split(".");
      setFormData((prev) => ({
        ...prev,
        [outerKey]: {
          ...(prev[outerKey] || {}),
          [innerKey]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [key]: value }));
    }
  };

  const saveCoreProfile = async () => {
    try {
      setSaving(true);
      const payload: { [key: string]: any } = {};

      if (isChildProfile) {
        if (formData.firstName) payload.firstName = formData.firstName;
        if (formData.lastName) payload.lastName = formData.lastName;
        if (formData.dob) payload.dob = formData.dob;
        if (formData.profileHeadline)
          payload.profileHeadline = formData.profileHeadline;
        if (formData.about) payload.about = formData.about;
      } else {
        if (formData.firstName) payload.firstName = formData.firstName;
        if (formData.lastName) payload.lastName = formData.lastName;
        if (formData.profileHeadline)
          payload.profileHeadline = formData.profileHeadline;
        if (formData.about) payload.about = formData.about;

        if (formData.mobile?.countryCode || formData.mobile?.phoneNumber) {
          payload.mobile = {
            countryCode: formData.mobile.countryCode || "",
            phoneNumber: formData.mobile.phoneNumber || "",
          };
        }
        if (formData.dob) payload.dob = formData.dob;
      }

      if (childId)
        await childApi.profile.updateCore(childId, payload, user.token);
      else await userApi.profile.core.update(payload, user.token);

      toast.success("Profile updated successfully.");
      setEditingCore(false);
      await fetchProfileData();
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleMediaUpload = async (e, type) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const hasPermission =
      type === "avatar"
        ? userCanEditMedia || canChangeAvatar
        : userCanEditMedia || canChangeBanner;

    if (!hasPermission) {
      toast.error("You do not have permission to upload this file.");
      return;
    }

    setUploadingMedia(true);
    try {
      if (childId) {
        const apiCall =
          type === "avatar"
            ? childApi.profile.updateAvatar
            : childApi.profile.updateBanner;
        await apiCall(childId, file, user.token);
      } else {
        const apiCall =
          type === "avatar"
            ? userApi.profile.avatar.update
            : userApi.profile.banner.update;
        await apiCall(file, user.token);
      }

      toast.success(
        `${type === "avatar" ? "Avatar" : "Banner"} updated successfully.`
      );
      await fetchProfileData();
    } catch {
      toast.error(`Failed to upload ${type}.`);
    } finally {
      setUploadingMedia(false);
      e.target.value = "";
    }
  };

  const handleDeleteMedia = async (type) => {
    const hasPermission =
      type === "avatar"
        ? userCanEditMedia || canDeleteAvatar
        : userCanEditMedia || canDeleteBanner;

    if (!hasPermission) {
      toast.error("You do not have permission to delete this file.");
      return;
    }

    setUploadingMedia(true);
    try {
      if (childId) {
        const apiCall =
          type === "avatar"
            ? childApi.profile.deleteAvatar
            : childApi.profile.deleteBanner;
        await apiCall(childId, user.token);
      } else {
        const apiCall =
          type === "avatar"
            ? userApi.profile.avatar.delete
            : userApi.profile.banner.delete;
        await apiCall(user.token);
      }

      toast.success(
        `${type === "avatar" ? "Avatar" : "Banner"} deleted successfully.`
      );
      await fetchProfileData();
    } catch {
      toast.error(`Failed to delete ${type}.`);
    } finally {
      setUploadingMedia(false);
    }
  };

  const CoreInfoDisplay = ({ profileData, isChildProfile }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col pb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Full Name
          </span>
          <span className="text-base font-semibold text-foreground">
            {`${profileData?.firstName || ""} ${profileData?.lastName || ""}`}
          </span>
        </div>

        {profileData?.dob && (
          <div className="flex flex-col pb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Date of Birth
            </span>
            <span className="text-base text-foreground">
              {new Date(profileData.dob).toLocaleDateString()}
            </span>
          </div>
        )}

        {!isChildProfile && (
          <div className="flex flex-col pb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Mobile
            </span>
            {profileData?.mobile?.phoneNumber ? (
              <span className="text-base text-foreground">
                {`${profileData.mobile.countryCode || ""} ${
                  profileData.mobile.phoneNumber
                }`}
              </span>
            ) : (
              <span className="text-base text-gray-500 italic">
                Not provided
              </span>
            )}
          </div>
        )}
      </div>

      {/* Headline */}
      {profileData?.profileHeadline && (
        <div className="flex flex-col pb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Headline
          </span>
          <span className="text-base text-foreground">
            {profileData.profileHeadline}
          </span>
        </div>
      )}

      {/* About */}
      {profileData?.about && (
        <div className="flex flex-col pt-2">
          <span className="text-sm font-medium text-muted-foreground">
            About Me
          </span>
          <p className="text-base text-foreground whitespace-pre-wrap">
            {profileData.about}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <input
        type="file"
        ref={bannerInputRef}
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => handleMediaUpload(e, "banner")}
      />

      <input
        type="file"
        ref={avatarInputRef}
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => handleMediaUpload(e, "avatar")}
      />

      <Card className="overflow-hidden shadow-md border-none relative">
        <div className="relative h-44">
          {profileData?.profileBanner?.url ? (
            <img
              src={profileData.profileBanner.url}
              alt="Profile Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-indigo-500 to-purple-600" />
          )}

          {(userCanEditMedia || canChangeBanner || canDeleteBanner) && (
            <div className="absolute top-4 right-4 flex gap-2">
              {(userCanEditMedia || canChangeBanner) && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={uploadingMedia}
                >
                  <Pencil className="h-4 w-4 mr-2" /> Change
                </Button>
              )}

              {profileData?.profileBanner?.url &&
                (userCanEditMedia || canDeleteBanner) && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteMedia("banner")}
                    disabled={uploadingMedia}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                )}
            </div>
          )}
        </div>

        <CardContent className="relative flex flex-col items-center -mt-14">
          <div className="relative h-28 w-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-white">
            {profileData?.avatar?.url ? (
              <img
                src={profileData.avatar.url}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <Avatar className="h-28 w-28">
                <AvatarFallback className="text-3xl">
                  {(
                    profileData.firstName ||
                    user.email?.[0] ||
                    "?"
                  ).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}

            {(userCanEditMedia || canChangeAvatar || canDeleteAvatar) && (
              <div className="absolute bottom-2 right-2 flex gap-2">
                {(userCanEditMedia || canChangeAvatar) && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-7 w-7 rounded-full"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingMedia}
                  >
                    <Pencil className="h-3.5 w-3.5 text-gray-700" />
                  </Button>
                )}

                {profileData?.avatar?.url &&
                  (userCanEditMedia || canDeleteAvatar) && (
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-7 w-7 rounded-full"
                      onClick={() => handleDeleteMedia("avatar")}
                      disabled={uploadingMedia}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
              </div>
            )}
          </div>

          <h2 className="mt-3 text-2xl font-semibold text-foreground">
            {`${profileData?.firstName || ""} ${profileData?.lastName || ""}`}
          </h2>
          <p className="text-muted-foreground">
            {profileData?.profileHeadline || "No headline"}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-xllue-100 shadow-sm">
        <CardHeader className="flex flex-row justify-between items-center pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-secondary" />
            Core Information
          </CardTitle>
          {canEdit && (
            <Button
              onClick={
                editingCore ? saveCoreProfile : () => setEditingCore(true)
              }
              disabled={saving || uploadingMedia}
              variant={editingCore ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              {editingCore ? (
                <>
                  <Check className="h-4 w-4" /> Save
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4" /> Edit
                </>
              )}
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4 text-left pt-2">
          {editingCore ? (
            isChildProfile ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="core-first-name">First Name</Label>
                    <Input
                      id="core-first-name"
                      value={formData.firstName || ""}
                      onChange={(e) =>
                        handleChange("firstName", e.target.value)
                      }
                      placeholder="First Name"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="core-last-name">Last Name</Label>
                    <Input
                      id="core-last-name"
                      value={formData.lastName || ""}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      placeholder="Last Name"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="core-dob">Date of Birth</Label>
                  <Input
                    id="core-dob"
                    value={
                      formData.dob
                        ? new Date(formData.dob).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => handleChange("dob", e.target.value)}
                    placeholder="Date of Birth"
                    type="date"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="core-headline">Headline</Label>
                  <Input
                    id="core-headline"
                    value={formData.profileHeadline || ""}
                    onChange={(e) =>
                      handleChange("profileHeadline", e.target.value)
                    }
                    placeholder="Headline"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="core-about">About</Label>
                  <Textarea
                    id="core-about"
                    value={formData.about || ""}
                    onChange={(e) => handleChange("about", e.target.value)}
                    placeholder="About"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="core-first-name">First Name</Label>
                    <Input
                      id="core-first-name"
                      value={formData.firstName || ""}
                      onChange={(e) =>
                        handleChange("firstName", e.target.value)
                      }
                      placeholder="First Name"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="core-last-name">Last Name</Label>
                    <Input
                      id="core-last-name"
                      value={formData.lastName || ""}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      placeholder="Last Name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="core-mobile">Mobile</Label>
                    <div className="flex gap-2">
                      <Input
                        id="core-mobile-cc"
                        value={formData.mobile?.countryCode || "+91"}
                        onChange={(e) =>
                          handleChange("mobile.countryCode", e.target.value)
                        }
                        placeholder="+CC"
                        className="w-20 flex-shrink-0 text-center"
                      />
                      <Input
                        id="core-mobile-number"
                        value={formData.mobile?.phoneNumber || ""}
                        onChange={(e) =>
                          handleChange("mobile.phoneNumber", e.target.value)
                        }
                        placeholder="Phone Number"
                        type="tel"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="core-dob">Date of Birth</Label>
                    <Input
                      id="core-dob"
                      value={
                        formData.dob
                          ? new Date(formData.dob).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => handleChange("dob", e.target.value)}
                      placeholder="Date of Birth"
                      type="date"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="core-headline">Headline</Label>
                  <Input
                    id="core-headline"
                    value={formData.profileHeadline || ""}
                    onChange={(e) =>
                      handleChange("profileHeadline", e.target.value)
                    }
                    placeholder="Headline"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="core-about">About</Label>
                  <Textarea
                    id="core-about"
                    value={formData.about || ""}
                    onChange={(e) => handleChange("about", e.target.value)}
                    placeholder="About"
                  />
                </div>
              </div>
            )
          ) : (
            <CoreInfoDisplay
              profileData={profileData}
              isChildProfile={isChildProfile}
            />
          )}
        </CardContent>
      </Card>

      {!isChildProfile && (
        <ProfileSection
          title="Addresses"
          icon={MapPin}
          fields={[
            { label: "Street", key: "street" },
            { label: "City", key: "city" },
            { label: "State", key: "state" },
            { label: "Zip Code", key: "zipCode" },
            { label: "Country", key: "country" },
            {
              label: "Address Type",
              key: "type",
              type: "buttonGroup",
              options: ["HOME", "WORK", "OTHER"],
            },
            {
              label: "Primary Address",
              key: "isPrimary",
              type: "boolean",
            },
          ]}
          data={profileData.addresses || []}
          childId={childId}
          userToken={user.token}
          fetchProfileData={fetchProfileData}
          canEdit={canEdit}
        />
      )}

      <ProfileSection
        title="Skills"
        icon={Zap}
        fields={[{ label: "Skill Name", key: "name" }]}
        data={profileData.skills || []}
        childId={childId}
        userToken={user.token}
        fetchProfileData={fetchProfileData}
        canEdit={canEdit}
      />

      <ProfileSection
        title="Experiences"
        icon={Briefcase}
        fields={[
          { label: "Title", key: "title" },
          { label: "Company", key: "company" },
          { label: "Location", key: "location" },
          { label: "Start Date", key: "startDate", type: "date" },
          { label: "End Date", key: "endDate", type: "date" },
          { label: "Description", key: "description", type: "textarea" },
        ]}
        data={profileData.experiences || []}
        childId={childId}
        userToken={user.token}
        fetchProfileData={fetchProfileData}
        canEdit={canEdit}
      />

      <ProfileSection
        title="Education"
        icon={GraduationCap}
        fields={[
          { label: "Institution", key: "institution" },
          { label: "Degree", key: "degree" },
          { label: "Field of Study", key: "fieldOfStudy" },
          { label: "Start Date", key: "startDate", type: "date" },
          { label: "End Date", key: "endDate", type: "date" },
        ]}
        data={profileData.educations || []}
        childId={childId}
        userToken={user.token}
        fetchProfileData={fetchProfileData}
        canEdit={canEdit}
      />

      <ProfileSection
        title="Projects"
        icon={BookOpen}
        fields={[
          { label: "Name", key: "name" },
          { label: "Role", key: "role" },
          { label: "Start Date", key: "startDate", type: "date" },
          { label: "End Date", key: "endDate", type: "date" },
          { label: "Project URL", key: "projectUrl" },
          { label: "Description", key: "description", type: "textarea" },
        ]}
        data={profileData.projects || []}
        childId={childId}
        userToken={user.token}
        fetchProfileData={fetchProfileData}
        canEdit={canEdit}
      />

      <ProfileSection
        title="Certifications"
        icon={Award}
        fields={[
          { label: "Name", key: "name" },
          { label: "Issuing Organization", key: "issuingOrganization" },
          { label: "Issue Date", key: "issueDate", type: "date" },
          { label: "Expiration Date", key: "expirationDate", type: "date" },
          { label: "Credential URL", key: "credentialUrl" },
        ]}
        data={profileData.certifications || []}
        childId={childId}
        userToken={user.token}
        fetchProfileData={fetchProfileData}
        canEdit={canEdit}
      />

      <ProfileSection
        title="Achievements"
        icon={Award}
        fields={[
          { label: "Name", key: "name" },
          { label: "Issuer", key: "issuer" },
          { label: "Issue Date", key: "issueDate", type: "date" },
          { label: "Description", key: "description", type: "textarea" },
        ]}
        data={profileData.achievements || []}
        childId={childId}
        userToken={user.token}
        fetchProfileData={fetchProfileData}
        canEdit={canEdit}
      />

      <ProfileSection
        title="Interests"
        icon={Heart}
        fields={[
          { label: "Interest Name", key: "name" },
          { label: "Category", key: "category" },
          { label: "Followed Since", key: "followedSince", type: "date" },
        ]}
        data={profileData.interests || []}
        childId={childId}
        userToken={user.token}
        fetchProfileData={fetchProfileData}
        canEdit={canEdit}
      />
    </div>
  );
}
