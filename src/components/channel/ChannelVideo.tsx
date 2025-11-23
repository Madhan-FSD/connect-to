import React from "react";
import {
  Lock,
  Play,
  Heart,
  Share2,
  MessageCircle,
  Users,
  Calendar,
  DollarSign,
  Eye,
} from "lucide-react";

const RestrictionOverlay = ({ video }) => {
  const isPaidOnly = video.visibility === "PAID_ONLY";
  const isSubscriberOnly = video.visibility === "SUBSCRIBERS_ONLY";

  const Icon = isPaidOnly ? DollarSign : isSubscriberOnly ? Users : Lock;
  const restrictionText = isPaidOnly
    ? "Paid Access"
    : isSubscriberOnly
    ? "Subscriber Only"
    : "Private Content";
  const blurClass = isPaidOnly ? "blur-md opacity-50" : "blur-sm opacity-70";

  return (
    <>
      <img
        src={video.thumbnailUrl || video.secureUrl}
        className={`w-full h-full object-cover transition ${blurClass}`}
        alt={video.title}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/30"></div>

      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
        <div className="rounded-full w-12 h-12 flex items-center justify-center backdrop-blur bg-white/90 shadow-xl mb-2">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
        <p className="text-white font-bold text-sm uppercase tracking-wider">
          {restrictionText}
        </p>
        <p className="text-white text-xs mt-0.5">
          {isPaidOnly ? "Unlock to View" : "Subscribe to View"}
        </p>
      </div>
    </>
  );
};

export default function VideoCard({
  video,
  onPlay,
  onSubscribeCTA,
  isViewRestricted,
}) {
  const restricted = isViewRestricted;

  const formatDuration = (sec) => {
    if (!sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const handleClick = () => {
    if (restricted) {
      onSubscribeCTA(video, video.visibility);
    } else {
      onPlay(video);
    }
  };

  return (
    <div className="w-full flex gap-4 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md border dark:border-gray-700 transition">
      <div
        className="relative w-60 h-36 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
        onClick={handleClick}
      >
        {restricted ? (
          <RestrictionOverlay video={video} />
        ) : (
          <>
            <img
              src={video.thumbnailUrl || video.secureUrl}
              className="w-full h-full object-cover transition"
              alt={video.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/10"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="rounded-full w-12 h-12 flex items-center justify-center 
                backdrop-blur bg-white/90 shadow-lg transition hover:scale-105"
              >
                <Play className="w-6 h-6 text-gray-800 ml-1" />
              </div>
            </div>
          </>
        )}

        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded-md z-10">
          {formatDuration(video.duration)}
        </div>
      </div>

      <div className="flex flex-col flex-1 justify-between">
        <div className="flex flex-col flex-1">
          <h3
            className="text-lg font-semibold text-left text-gray-900 dark:text-white line-clamp-2 cursor-pointer hover:text-indigo-500 transition"
            onClick={handleClick}
          >
            {video.title}
          </h3>

          {video.description && (
            <p className="text-sm text-left text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 whitespace-normal leading-tight">
              {video.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-5 text-xs text-gray-500 dark:text-gray-400 mt-2">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {video.viewsCount?.toLocaleString() || 0} views
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(video.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <button className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
            <Heart className="w-4 h-4" />
            {video.likesCount || 0}
          </button>

          <button className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
            <MessageCircle className="w-4 h-4" />
            {video.commentsCount || 0}
          </button>

          <button className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
