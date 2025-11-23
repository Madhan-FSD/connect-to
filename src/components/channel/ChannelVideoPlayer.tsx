import React, { useRef, useEffect } from "react";
import { Lock, DollarSign, Users } from "lucide-react";

const PlayerOverlay = ({ video, isRestricted, onSubscribeCTA }) => {
  if (!isRestricted) return null;

  const isPaidOnly = video.visibility === "PAID_ONLY";
  const isSubscriberOnly = video.visibility === "SUBSCRIBERS_ONLY";

  const Icon = isPaidOnly ? DollarSign : isSubscriberOnly ? Users : Lock;
  const restrictionText = isPaidOnly ? "PAID CONTENT" : "SUBSCRIBER EXCLUSIVE";
  const promptText = isPaidOnly ? "Unlock to Watch" : "Subscribe to Channel";

  return (
    <div
      className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 cursor-pointer z-10"
      onClick={() => onSubscribeCTA(video, video.visibility)}
    >
      <div className="rounded-full w-16 h-16 flex items-center justify-center bg-white/10 backdrop-blur-md shadow-xl mb-3 border-2 border-indigo-400">
        <Icon className="w-8 h-8 text-indigo-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-1">{restrictionText}</h3>
      <p className="text-sm text-gray-300">{promptText}</p>
    </div>
  );
};

export default function ChannelVideoPlayer({
  video,
  isViewRestricted,
  onSubscribeCTA,
}) {
  const videoRef = useRef(null);
  const isRestricted = isViewRestricted;

  useEffect(() => {
    if (videoRef.current && video && !isRestricted) {
      videoRef.current.load();
      videoRef.current.play().catch((error) => {
        console.warn("Autoplay was prevented:", error.name);
      });
    }
  }, [video?._id, isRestricted]);

  if (!video) {
    return (
      <div className="text-gray-400 text-center mt-20">
        Select a video to play
      </div>
    );
  }

  return (
    <div className="bg-black rounded-lg overflow-hidden shadow relative">
      <PlayerOverlay
        video={video}
        isRestricted={isRestricted}
        onSubscribeCTA={onSubscribeCTA}
      />

      <video
        ref={videoRef}
        src={isRestricted ? "" : video.secureUrl}
        controls
        autoPlay={!isRestricted}
        className="w-full h-[350px] object-cover"
        poster={video.thumbnailUrl}
      />
      <div className="p-4">
        <h2 className="text-lg font-bold text-white">{video.title}</h2>
        <p className="text-sm text-gray-400 mt-2">{video.description}</p>
      </div>
    </div>
  );
}
