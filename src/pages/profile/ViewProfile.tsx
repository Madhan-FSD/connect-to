import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MapPin, Briefcase, GraduationCap, Link, Heart } from "lucide-react";
import { CardLoader } from "@/components/CardLoader";
import { userApi } from "@/lib/api";
import { getAuth } from "@/lib/auth";
import { useConversationStore } from "@/store/ConversationStore";

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  profileHeadline?: string;
  about?: string;
  avatar?: { url: string };
  profileBanner?: { url: string };
  connectionCount: number;
  experiences: any[];
  educations: any[];
  skills: any[];
  projects: any[];
  addresses: any[];
  interests: any[];
}

export default function ViewProfile() {
  const openDirect = useConversationStore((s) => s.openDirect);
  const token = getAuth()?.token;
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const safeName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : "User";
  const initials = profile
    ? `${profile.firstName[0]}${profile.lastName[0]}`
    : "??";

  useEffect(() => {
    if (!id) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await userApi.profile.getProfileById(token, id);
        setProfile(res.user);
      } catch (error) {
        toast.error("Failed to load user profile.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <CardLoader message="Loading profile..." />
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="text-center py-20">Profile not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-8 space-y-6">
        {/* === Profile Header Banner (LinkedIn Style) === */}
        <Card className="relative overflow-hidden pt-14 md:pt-20">
          {/* Banner Image */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gray-300">
            {profile.profileBanner?.url && (
              <img
                src={profile.profileBanner.url}
                alt="Profile Banner"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <CardContent className="p-6 pt-16 relative">
            {/* Avatar */}
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg absolute -top-16 left-6">
              {profile.avatar?.url ? (
                <AvatarImage src={profile.avatar.url} alt={safeName} />
              ) : (
                <AvatarFallback className="bg-primary text-white text-4xl font-bold">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="ml-36">
              <h1 className="text-3xl font-extrabold text-gray-900">
                {safeName}
              </h1>
              <p className="text-lg text-gray-700 mt-1">
                {profile.profileHeadline || "No headline provided"}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-3">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />{" "}
                  {profile.addresses?.[0]?.city || "Location Unknown"}
                </span>
                <span className="flex items-center">
                  <Heart className="w-4 h-4 mr-1" />
                  {profile.connectionCount}{" "}
                  {profile.connectionCount === 1 ? "Connection" : "Connections"}
                </span>
              </div>
              <div className="flex space-x-3 mt-4">
                <Button
                  onClick={() => openDirect(id)}
                  className="rounded-full px-6"
                >
                  Message
                </Button>
                <Button variant="secondary" className="rounded-full px-6">
                  Connect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">
                  {profile.about || "No detailed description provided."}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" /> Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.experiences && profile.experiences.length > 0 ? (
                  profile.experiences.map((exp, index) => (
                    <div key={index}>
                      <h3 className="text-lg font-semibold">{exp.title}</h3>
                      <p className="text-md text-gray-700">{exp.company}</p>
                      <p className="text-sm text-gray-500">
                        {exp.startDate} - {exp.endDate || "Present"}
                      </p>
                      <Separator className="mt-4" />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No work experience listed.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2" /> Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.educations && profile.educations.length > 0 ? (
                  profile.educations.map((edu, index) => (
                    <div key={index}>
                      <h3 className="text-lg font-semibold">{edu.degree}</h3>
                      <p className="text-md text-gray-700">{edu.institution}</p>
                      <p className="text-sm text-gray-500">
                        {edu.startDate} - {edu.endDate}
                      </p>
                      <Separator className="mt-4" />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No education listed.</p>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-1 space-y-6">
            {/* Skills Section */}
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {skill.name}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No skills listed.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Interests</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {profile.interests && profile.interests.length > 0 ? (
                  profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {interest.name}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No interests listed.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
