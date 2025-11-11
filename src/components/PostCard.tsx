import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MoreVertical,
  MessageCircle,
  Repeat,
  Send,
  Globe,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getAuth } from "@/lib/auth";
import { toast } from "sonner";
import { postApi } from "@/lib/api";
import { reactionApi } from "@/lib/api/reaction.api";
import { motion, AnimatePresence } from "framer-motion";

const REACTIONS = [
  { type: "LIKE", emoji: "👍", label: "Like" },
  { type: "LOVE", emoji: "❤️", label: "Love" },
  { type: "CELEBRATE", emoji: "🎉", label: "Celebrate" },
  { type: "INSIGHTFUL", emoji: "💡", label: "Insightful" },
  { type: "SAD", emoji: "😢", label: "Sad" },
  { type: "ANGRY", emoji: "😡", label: "Angry" },
];

interface Owner {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: { url?: string };
  headline?: string;
}

interface Comment {
  _id: string;
  content: string;
  ownerId: Owner;
  createdAt: string;
}

interface Post {
  _id: string;
  ownerId: Owner;
  content: string;
  mediaUrl?: string;
  contentType?: "TEXT" | "IMAGE" | "VIDEO";
  totalReactions?: number;
  commentsCount?: number;
  createdAt: string;
}

export function PostCard({ post }: { post: Post }) {
  const user = getAuth();
  const [expanded, setExpanded] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [reactionCount, setReactionCount] = useState(post.totalReactions || 0);
  const [showPicker, setShowPicker] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  const displayName =
    `${post.ownerId.firstName || ""} ${post.ownerId.lastName || ""}`.trim() ||
    post.ownerId.email ||
    "User";

  const isOwnPost = user?.userId === post.ownerId._id;

  const truncated =
    post.content.length > 180 && !expanded
      ? post.content.slice(0, 180) + "..."
      : post.content;

  const handleReaction = async (reactionType: string) => {
    try {
      const response = await reactionApi.toggleReaction(
        "Post",
        post._id,
        reactionType,
        user!.token
      );
      setSelectedReaction(response.userReaction || reactionType);
      setReactionCount(response.totalReactions ?? reactionCount);
      setShowPicker(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to react");
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const data = await postApi.getComments(post._id, user!.token);
      setComments(data.comments || []);
    } catch {
      toast.error("Failed to load comments");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await postApi.addComment(
        post._id,
        newComment.trim(),
        user!.token
      );
      setComments((prev) => [response.comment, ...prev]);
      setNewComment("");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await postApi.deleteComment(commentId, user!.token);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const toggleComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0) await fetchComments();
  };

  return (
    <Card className="max-w-xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all overflow-visible">
      {/* Header */}
      <div className="flex items-start justify-between p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-11 w-11">
            {post.ownerId.avatar?.url ? (
              <AvatarImage src={post.ownerId.avatar.url} />
            ) : (
              <AvatarFallback className="bg-gray-300 text-white font-semibold">
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex flex-col text-left leading-tight">
            <p className="font-semibold text-sm text-gray-900">{displayName}</p>
            {post.ownerId.headline && (
              <p className="text-xs text-gray-500">{post.ownerId.headline}</p>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <span>
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </span>
              <span>•</span>
              <Globe className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isOwnPost && (
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 font-semibold hover:bg-blue-50"
            >
              + Follow
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700 rounded-full"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2 text-sm text-gray-800 text-left">
        <p>
          {truncated}
          {post.content.length > 180 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-gray-500 font-medium hover:underline ml-1"
            >
              ...more
            </button>
          )}
        </p>

        {post.mediaUrl && (
          <div className="mt-3 rounded-lg overflow-hidden">
            <img
              src={post.mediaUrl}
              alt="Post media"
              className="w-full h-auto object-cover max-h-[400px]"
            />
          </div>
        )}
      </div>

      {/* Reactions summary */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 border-t border-gray-100">
        <div className="flex items-center gap-1">
          {REACTIONS.slice(0, 3).map((r) => (
            <span key={r.type} className="text-lg">
              {r.emoji}
            </span>
          ))}
          <span className="ml-1">{reactionCount}</span>
        </div>
        <span className="cursor-pointer" onClick={toggleComments}>
          {post.commentsCount || 0} comments
        </span>
      </div>

      {/* Footer actions */}
      <div className="flex justify-around items-center py-1.5 border-t border-gray-100 text-sm text-gray-600 relative overflow-visible">
        {/* Like + Hover Picker */}
        <div
          className="relative flex flex-col items-center"
          onMouseEnter={() => {
            if (hideTimeout.current) clearTimeout(hideTimeout.current);
            setShowPicker(true);
          }}
          onMouseLeave={() => {
            hideTimeout.current = setTimeout(() => setShowPicker(false), 200);
          }}
        >
          <button
            onClick={() => handleReaction(selectedReaction || "LIKE")}
            className={`flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100 transition ${
              selectedReaction ? "text-blue-600 font-semibold" : ""
            }`}
          >
            <ThumbsUp
              className={`h-5 w-5 ${
                selectedReaction
                  ? "fill-blue-600 text-blue-600"
                  : "text-gray-500"
              }`}
            />
            <span>{selectedReaction || "Like"}</span>
          </button>

          <AnimatePresence>
            {showPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-10 bg-white border border-gray-200 shadow-lg rounded-2xl px-3 py-2 flex gap-3 z-50"
              >
                {REACTIONS.map((r) => (
                  <motion.button
                    key={r.type}
                    onClick={() => handleReaction(r.type)}
                    whileHover={{ scale: 1.3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="text-xl cursor-pointer"
                    title={r.label}
                  >
                    {r.emoji}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={toggleComments}
          className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100 transition"
        >
          <MessageCircle className="h-5 w-5 text-gray-500" />
          <span>Comment</span>
        </button>

        <button className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100 transition">
          <Repeat className="h-5 w-5 text-gray-500" />
          <span>Repost</span>
        </button>

        <button
          onClick={() => {
            navigator.clipboard.writeText(
              `${window.location.origin}/posts/${post._id}`
            );
            toast.success("Post link copied!");
          }}
          className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100 transition"
        >
          <Send className="h-5 w-5 text-gray-500" />
          <span>Send</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-4 py-3 border-t border-gray-100 space-y-3">
          {loadingComments ? (
            <p className="text-xs text-gray-500">Loading comments...</p>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="flex gap-2 items-start">
                <Avatar className="h-8 w-8">
                  {comment.ownerId.avatar?.url ? (
                    <AvatarImage src={comment.ownerId.avatar.url} />
                  ) : (
                    <AvatarFallback className="bg-gray-300 text-xs">
                      {comment.ownerId.firstName?.[0]?.toUpperCase() ||
                        comment.ownerId.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 bg-gray-50 rounded-lg px-3 py-1.5">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-xs text-gray-900">
                      {comment.ownerId.firstName || comment.ownerId.email}
                    </p>
                    {(comment.ownerId._id === user?.userId ||
                      post.ownerId._id === user?.userId) && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs mt-0.5">{comment.content}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500">No comments yet</p>
          )}

          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gray-300 text-xs">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 text-xs rounded-full border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Button
              onClick={handleAddComment}
              size="sm"
              className="text-xs h-7 px-3"
              disabled={!newComment.trim()}
            >
              Post
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
