import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Globe,
  MessageCircle,
  Repeat,
  Send,
  ThumbsUp,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Post, User } from "@/utils/post.interface";
import { useNavigate } from "react-router-dom";
import { PostCard } from "./PostCard";

const isUserObject = (owner: User | string | undefined): owner is User => {
  return typeof owner === "object" && owner !== null && "_id" in owner;
};

interface VideoCardProps {
  post: Post;
}

export function VideoCard({ post }: VideoCardProps) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  if (post.contentType !== "VIDEO_CHANNEL") {
    return <PostCard post={post} />;
  }

  const owner =
    post.channelId || (isUserObject(post) ? post.ownerId : undefined);
  const channelOrUser = post.channelId || owner;
  const displayName =
    post.channelName ||
    (isUserObject(post)
      ? `${owner?.firstName || ""} ${owner?.lastName || ""}`.trim()
      : "") ||
    "Channel";

  const handleCardClick = () => {
    if (post.channelId && post.channelHandle) {
      navigate(`/channel/${post.channelHandle}/${post.channelId}`);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <Card className="w-full bg-card border border-border hover:shadow-[var(--shadow-hover)] transition-shadow duration-200 rounded-lg overflow-hidden mb-3">
      <div className="p-3 sm:p-4">
        <div
          className="flex items-start gap-2 sm:gap-3 cursor-pointer"
          onClick={handleCardClick}
        >
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
            <AvatarImage src={post.channelAvatar} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {displayName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm sm:text-base text-foreground truncate">
              {displayName}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <span>
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </span>
              <span>•</span>
              <Globe className="h-3 w-3" />
            </div>
          </div>
        </div>

        {post.title && (
          <h3 className="font-semibold text-base sm:text-lg mt-3 mb-2">
            {post.title}
          </h3>
        )}
        {post.content && (
          <p className="text-sm text-foreground mb-3">{post.content}</p>
        )}
      </div>

      {/* Video Player */}
      <div className="relative w-full bg-black">
        <video
          ref={videoRef}
          src={post.secureUrl || post.mediaUrl}
          poster={post.thumbnailUrl}
          className="w-full max-h-[500px] object-contain"
          onClick={togglePlay}
        />
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
          >
            <div className="bg-white/90 rounded-full p-4">
              <Play className="h-8 w-8 text-primary" />
            </div>
          </button>
        )}
        <button
          onClick={toggleMute}
          className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 rounded-full p-2 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-white" />
          ) : (
            <Volume2 className="h-5 w-5 text-white" />
          )}
        </button>
      </div>

      {/* Reaction Summary */}
      {post.totalReactions && post.totalReactions > 0 && (
        <div className="px-3 sm:px-4 py-2 flex items-center justify-between text-xs text-muted-foreground border-b border-border">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-3 w-3 fill-primary text-primary" />
            <span>{post.totalReactions}</span>
          </div>
          <div className="flex items-center gap-3">
            {post.commentsCount && post.commentsCount > 0 && (
              <span>{post.commentsCount} comments</span>
            )}
            {post.viewsCount && post.viewsCount > 0 && (
              <span>{post.viewsCount} views</span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-2 sm:px-3 py-1 border-t border-border">
        <div className="flex items-center justify-around gap-1">
          <Button variant="ghost" size="sm" className="flex-1 hover:bg-muted">
            <ThumbsUp className="h-4 w-4 mr-1" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">
              Like
            </span>
          </Button>

          <Button variant="ghost" size="sm" className="flex-1 hover:bg-muted">
            <MessageCircle className="h-4 w-4 mr-1" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">
              Comment
            </span>
          </Button>

          <Button variant="ghost" size="sm" className="flex-1 hover:bg-muted">
            <Repeat className="h-4 w-4 mr-1" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">
              Repost
            </span>
          </Button>

          <Button variant="ghost" size="sm" className="flex-1 hover:bg-muted">
            <Send className="h-4 w-4 mr-1" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">
              Send
            </span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
