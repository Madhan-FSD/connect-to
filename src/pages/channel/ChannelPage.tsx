import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChannelHeader from "./ChannelHeader";
import VideoCard from "@/components/channel/ChannelVideo";
import PostCard from "@/components/channel/PostCard";
import AboutChannelContent from "@/components/channel/AboutChannel";
import UploadModal from "@/components/channel/UploadModel";
import ChannelSettings from "./ChannelSettings";
import ChannelPlaylists from "./ChannelPlaylists";
import { channelApi } from "@/lib/api";
import { getAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Layout } from "@/components/Layout";

export default function ChannelPage() {
  const { channelId, handle } = useParams();
  const auth = getAuth();

  const [channel, setChannel] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("home");

  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const [posts, setPosts] = useState<any[]>([]);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"video" | "post">("video");

  const [isOwner, setIsOwner] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const loadChannel = async () => {
    try {
      const resp = await channelApi.getChannelDetails(channelId, auth.token);
      setChannel(resp.channel);
      setIsOwner(resp.channel?.owner === auth.userId);
      setIsSubscribed(resp.isSubscribed);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadChannel();
  }, [handle]);

  const loadVideos = async () => {
    try {
      const resp = await channelApi.getVideosByHandle(
        `${handle}`,
        "",
        auth.token
      );
      setVideos(resp.videos || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPosts = async () => {
    try {
      const resp = await channelApi.getPostsByHandle(
        `${handle}`,
        "",
        auth.token
      );
      setPosts(resp.posts || []);
    } catch (err) {
      console.error(err);
    }
  };

  const onTabChange = (value: string) => {
    setActiveTab(value);
    setUploadOpen(false);
    if (value === "videos") {
      setUploadMode("video");
      loadVideos();
    } else if (value === "posts") {
      setUploadMode("post");
      loadPosts();
    }
  };

  const openUploadFor = (m: "video" | "post") => {
    setUploadMode(m);
    setUploadOpen(true);
  };

  const onUploaded = () => {
    if (activeTab === "videos") loadVideos();
    if (activeTab === "posts") loadPosts();
  };

  if (!channel) return <div className="p-8">Loading channel…</div>;

  return (
    <Layout>
      <div>
        <ChannelHeader
          channel={channel}
          isOwner={isOwner}
          isSubscribed={isSubscribed}
        />

        <div className="container mx-auto px-4 mt-6">
          <Tabs
            value={activeTab}
            onValueChange={onTabChange}
            className="w-full"
          >
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="home">Home</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="playlists">Playlists</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
                {isOwner && (
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                )}
              </TabsList>
            </div>

            <TabsContent value="home">
              <h2 className="text-xl font-bold mt-6 mb-3">What’s New</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...videos.slice(0, 3), ...posts.slice(0, 3)]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 6)
                  .map((item) =>
                    item.contentType === "VIDEO" ||
                    item.type === "VIDEO" ||
                    item.videoStatus ? (
                      <VideoCard
                        key={item._id}
                        video={item}
                        onPlay={() => {}}
                        onSubscribeCTA={() => alert("Subscribe to unlock")}
                      />
                    ) : (
                      <PostCard
                        key={item._id}
                        post={item}
                        onOpen={() => {}}
                        onSubscribeCTA={() => alert("Subscribe to unlock")}
                      />
                    )
                  )}
              </div>
            </TabsContent>

            <TabsContent value="videos">
              <div className="flex gap-6 w-full">
                <div className="w-1/2 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold mt-6">Videos</h2>
                    {isOwner && (
                      <Button onClick={() => openUploadFor("video")}>
                        Upload Video
                      </Button>
                    )}
                  </div>

                  {videos.map((v) => (
                    <VideoCard
                      key={v._id}
                      video={v}
                      onPlay={() => setSelectedVideo(v)}
                      onSubscribeCTA={() => alert("Subscribe to unlock")}
                    />
                  ))}
                </div>

                <div className="w-1/2 sticky top-4 h-full">
                  {selectedVideo ? (
                    <div className="bg-black rounded-lg overflow-hidden shadow">
                      <video
                        src={selectedVideo.secureUrl}
                        controls
                        autoPlay
                        className="w-full h-[350px] object-cover"
                      />
                      <div className="p-4">
                        <h2 className="text-lg font-bold">
                          {selectedVideo.title}
                        </h2>
                        <p className="text-sm text-gray-400 mt-2">
                          {selectedVideo.description}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center mt-20">
                      Select a video to play
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="posts">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold mt-6">Posts</h2>
                {isOwner && (
                  <Button onClick={() => openUploadFor("post")}>
                    Create Post
                  </Button>
                )}
              </div>
              <div className="space-y-4 mt-4">
                {posts.map((p) => (
                  <PostCard
                    key={p._id}
                    post={p}
                    onOpen={() => {}}
                    onSubscribeCTA={() => alert("Subscribe to unlock")}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="playlists">
              <ChannelPlaylists isOwner={isOwner} />
            </TabsContent>

            <AboutChannelContent
              channel={channel}
              isOwner={isOwner}
              updateChannelVisibility={async (vis) => {
                await channelApi.updateVisibility(channel._id, vis, auth.token);
                loadChannel();
              }}
            />

            {isOwner && (
              <TabsContent value="settings">
                <ChannelSettings />
              </TabsContent>
            )}
          </Tabs>
        </div>

        {uploadOpen && (
          <UploadModal
            mode={uploadMode}
            open={uploadOpen}
            onClose={() => setUploadOpen(false)}
            channelId={channel._id}
            authToken={auth.token}
            onUploaded={onUploaded}
          />
        )}
      </div>
    </Layout>
  );
}
