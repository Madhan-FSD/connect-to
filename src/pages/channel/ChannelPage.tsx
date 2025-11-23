import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChannelHeader from "./ChannelHeader";
import VideoCard from "@/components/channel/ChannelVideo";
import PostCard from "@/components/channel/PostCard";
import AboutChannelContent from "@/components/channel/AboutChannel";
import UploadModal from "@/components/channel/UploadModel";
import ChannelSettings from "./ChannelSettings";
import ChannelPlaylists from "./ChannelPlaylists";
import ChannelVideoPlayer from "@/components/channel/ChannelVideoPlayer";
import { channelApi } from "@/lib/api";
import { getAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Layout } from "@/components/Layout";
import AccessModal from "@/components/channel/AccessModel";

export default function ChannelPage() {
  const { channelId, handle } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();

  const [channel, setChannel] = useState(null);
  const [activeTab, setActiveTab] = useState("home");

  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const [posts, setPosts] = useState([]);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState("video");

  const [isOwner, setIsOwner] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

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

  const onTabChange = (value) => {
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

  const openUploadFor = (m) => {
    setUploadMode(m);
    setUploadOpen(true);
  };

  const onUploaded = () => {
    if (activeTab === "videos") loadVideos();
    if (activeTab === "posts") loadPosts();
  };

  const isVideoRestricted = (video) => {
    if (video.visibility === "PUBLIC") {
      return false;
    }

    if (isOwner) {
      return false;
    }

    if (video.visibility === "SUBSCRIBERS_ONLY") {
      return !isSubscribed;
    }

    if (video.visibility === "PAID_ONLY") {
      // FIX: Only check if individually paid for (not relying on isSubscribed)
      return !video.isPaidFor;
    }

    return true;
  };

  const handleRestrictedVideoCTA = (video, restrictionType) => {
    let title = "";
    let body = "";
    let ctaLabel = "";
    let ctaAction = () => {};

    if (restrictionType === "SUBSCRIBERS_ONLY") {
      title = `Unlock Subscriber Content`;
      body = `This video is exclusive to channel subscribers. Subscribe to ${
        channel?.name || "this channel"
      } to get full access to all exclusive content.`;
      ctaLabel = "View Subscription Plans";
      ctaAction = () => navigate(`/subscribe/${channelId}`);
    } else if (restrictionType === "PAID_ONLY") {
      title = `Purchase Access: ${video.title}`;
      body =
        "This video requires a one-time purchase. Complete the payment now to start streaming.";
      ctaLabel = "Proceed to Payment";
      ctaAction = () => navigate(`/video/${video._id}/purchase`);
    } else if (restrictionType === "PRIVATE") {
      return;
    } else {
      return;
    }

    setModalContent({ title, body, ctaLabel, ctaAction });
    setIsModalOpen(true);
  };

  const onPlayVideo = (video) => {
    setSelectedVideo(video);
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
                  .map((item) => {
                    const isRestricted = isVideoRestricted(item);

                    return item.contentType === "VIDEO" ||
                      item.type === "VIDEO" ||
                      item.videoStatus ? (
                      <VideoCard
                        key={item._id}
                        video={item}
                        isViewRestricted={isRestricted}
                        onPlay={onPlayVideo}
                        onSubscribeCTA={handleRestrictedVideoCTA}
                      />
                    ) : (
                      <PostCard
                        key={item._id}
                        post={item}
                        isViewRestricted={isRestricted}
                        onOpen={() => {}}
                        onSubscribeCTA={handleRestrictedVideoCTA}
                      />
                    );
                  })}
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
                      isViewRestricted={isVideoRestricted(v)}
                      onPlay={() => setSelectedVideo(v)}
                      onSubscribeCTA={handleRestrictedVideoCTA}
                    />
                  ))}
                </div>

                <div className="w-1/2 sticky top-4 h-full">
                  <ChannelVideoPlayer
                    video={selectedVideo}
                    isViewRestricted={
                      selectedVideo ? isVideoRestricted(selectedVideo) : false
                    }
                    onSubscribeCTA={handleRestrictedVideoCTA}
                  />
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
                    isViewRestricted={isVideoRestricted(p)}
                    onOpen={() => {}}
                    onSubscribeCTA={handleRestrictedVideoCTA}
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

      {isModalOpen && (
        <AccessModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          content={modalContent}
        />
      )}
    </Layout>
  );
}
