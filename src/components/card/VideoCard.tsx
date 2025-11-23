import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Globe, Play, Volume2, VolumeX, Lock, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Post as PostInterface, User } from "@/utils/post.interface";
import { useNavigate } from "react-router-dom";
import { PostCard } from "./PostCard";
import { ReactionsSummary } from "@/components/reactions/ReactionsSummary";
import { ReactionsBar } from "@/components/reactions/ReactionsBar";
import { getAuth } from "@/lib/auth";
import { channelvideosApi } from "@/lib/api";

export function VideoCard({ post }) {
  const navigate = useNavigate();
  const token = getAuth()?.token;
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [dynamicMediaUrl, setDynamicMediaUrl] = useState(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [errorUrl, setErrorUrl] = useState(null);

  if (
    post.contentType !== "VIDEO_CHANNEL" &&
    post.contentType !== "VIDEO_PROFILE"
  )
    return <PostCard post={post} />;

  const owner = post.ownerId;
  const displayName = post.channelName || owner?.firstName || "Channel";

  const actionButtonText =
    post.contentType === "VIDEO_CHANNEL" ? "Subscribe" : "Follow";

  const go = () => {
    if (post.channelHandle)
      navigate(`/channel/${post.channelHandle}/${post.channelId}`);
    else if (owner?.handle) navigate(`/profile/${owner.handle}`);
  };

  const isPaidOnly = post.visibility === "PAID_ONLY";

  const fetchSecureUrl = async () => {
    if (!token || !post._id || dynamicMediaUrl || isLoadingUrl) return;

    setIsLoadingUrl(true);
    setErrorUrl(null);
    try {
      const response = await channelvideosApi.getPlaybackUrl(post._id, token);
      setDynamicMediaUrl(response.secureUrl);
    } catch (err) {
      setErrorUrl("Access Denied or Failed to load video.");
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const play = () => {
    if (!videoRef.current || isLoadingUrl || errorUrl) return;

    if (isPaidOnly && !dynamicMediaUrl) {
      fetchSecureUrl();
      return;
    }

    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const mute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  let finalMediaUrl = post.secureUrl || post.mediaUrl;

  if (dynamicMediaUrl) {
    finalMediaUrl = dynamicMediaUrl;
  }

  const visibility = post.visibility;
  let visibilityIcon;
  let visibilityText;

  if (visibility === "PUBLIC") {
    visibilityIcon = <Globe className="h-3 w-3" />;
    visibilityText = "Public";
  } else if (visibility === "SUBSCRIBERS_ONLY") {
    visibilityIcon = <Lock className="h-3 w-3" />;
    visibilityText = "Subscribers Only";
  } else if (visibility === "PAID_ONLY") {
    visibilityIcon = <Lock className="h-3 w-3" />;
    visibilityText = "Paid Only";
  } else {
    visibilityIcon = <Lock className="h-3 w-3" />;
    visibilityText = "Private";
  }

  let overlayContent = null;
  if (isPaidOnly && !dynamicMediaUrl) {
    if (isLoadingUrl) {
      overlayContent = (
        <Loader2 className="h-10 w-10 text-white animate-spin" />
      );
    } else if (errorUrl) {
      overlayContent = (
        <span className="text-white bg-red-700/80 p-2 rounded">{errorUrl}</span>
      );
    } else {
      overlayContent = (
        <div className="flex flex-col items-center gap-2">
          <Lock className="h-10 w-10 text-white" />
          <span className="text-white font-semibold text-lg">
            {post.isSubscribed ? "Tap to Play" : "Paid Content"}
          </span>
        </div>
      );
    }
  } else if (!isPlaying) {
    overlayContent = (
      <div className="bg-white/90 rounded-full p-4">
        <Play className="h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <Card className="max-w-[700px] mx-auto w-full bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-border">
          <div
            className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
            onClick={go}
          >
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={post.channelAvatar || owner?.avatar?.url} />
              <AvatarFallback>{displayName[0]}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base text-left text-foreground leading-tight truncate">
                {displayName}
              </p>

              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 text-left">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
                <span>•</span>
                {visibilityIcon}
                <span>{visibilityText}</span>
              </div>
            </div>
          </div>

          {!post.isSubscribed && (
            <Button
              variant="default"
              size="sm"
              className="h-8 flex-shrink-0 ml-4 px-4 rounded-full font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                console.log(`${actionButtonText} clicked for ${displayName}`);
              }}
            >
              {actionButtonText}
            </Button>
          )}
        </div>

        {post.title && (
          <h3 className="font-semibold text-base mt-3 text-left text-foreground leading-snug">
            {post.title}
          </h3>
        )}

        {post.description && (
          <p className="text-sm text-muted-foreground mt-1 mb-3 text-left leading-relaxed">
            {post.description}
          </p>
        )}
      </div>

      {finalMediaUrl && (
        <div className="relative bg-black">
          <video
            ref={videoRef}
            src={finalMediaUrl}
            poster={post.thumbnailUrl}
            className="w-full max-h-[400px] object-contain"
            muted={isMuted}
            loop
            onClick={play}
          />

          {(!isPlaying || (isPaidOnly && !dynamicMediaUrl)) && (
            <button
              className="absolute inset-0 flex items-center justify-center bg-black/50 z-10"
              onClick={play}
            >
              {overlayContent}
            </button>
          )}

          {(!isPaidOnly || dynamicMediaUrl) && (
            <button
              onClick={mute}
              className="absolute bottom-4 right-4 bg-black/60 rounded-full p-2 z-20"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-white" />
              ) : (
                <Volume2 className="h-5 w-5 text-white" />
              )}
            </button>
          )}
        </div>
      )}

      <ReactionsSummary
        reactions={post.totalReactions}
        comments={post.commentsCount}
        views={post.viewsCount}
      />

      <ReactionsBar
        targetType="Video"
        targetId={post._id}
        onReact={(t) => {
          console.log(
            `Successfully reacted with: ${t}. Now update the local state.`
          );
        }}
      />
    </Card>
  );
}
