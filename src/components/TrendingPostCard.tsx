import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Globe,
  Heart,
  MessageCircle,
  Repeat,
  Send,
  ThumbsUp,
  X,
  CornerUpRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { getAuth } from "@/lib/auth";
import { toast } from "sonner";
import { postApi } from "@/lib/api";
import { reactionApi } from "@/lib/api/reaction.api";

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
  parentComment?: string | null;
  replies?: Comment[];
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

export function TrendingPostCard({ post }: { post: Post }) {
  const user = getAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [reactionCount, setReactionCount] = useState(post.totalReactions || 0);
  const [showPicker, setShowPicker] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  const displayName =
    `${post.ownerId.firstName || ""} ${post.ownerId.lastName || ""}`.trim() ||
    post.ownerId.email ||
    "User";

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
    } catch {
      toast.error("Failed to react");
    }
  };

  const fetchComments = async () => {
    try {
      const data = await postApi.getComments(post._id, user!.token);
      const nested = buildNestedComments(data.comments || []);
      setComments(nested);
    } catch {
      toast.error("Failed to load comments");
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

      if (replyTo) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === replyTo._id
              ? { ...c, replies: [response.comment, ...(c.replies || [])] }
              : c
          )
        );
        setReplyTo(null);
      } else {
        setComments((prev) => [response.comment, ...prev]);
      }

      setNewComment("");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const buildNestedComments = (flat: Comment[]) => {
    const map: Record<string, Comment> = {};
    flat.forEach((c) => (map[c._id] = { ...c, replies: [] }));
    const roots: Comment[] = [];

    flat.forEach((c) => {
      if (c.parentComment) {
        map[c.parentComment]?.replies?.push(map[c._id]);
      } else roots.push(map[c._id]);
    });

    return roots;
  };

  const CommentItem = ({
    comment,
    depth = 0,
  }: {
    comment: Comment;
    depth?: number;
  }) => (
    <div className={`flex gap-2 mt-3 ${depth > 0 ? "ml-10" : ""}`}>
      <Avatar className="h-7 w-7">
        {comment.ownerId.avatar?.url ? (
          <AvatarImage src={comment.ownerId.avatar.url} />
        ) : (
          <AvatarFallback className="bg-gray-300 text-xs">
            {comment.ownerId.firstName?.[0]?.toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>

      <div className="flex-1 bg-gray-50 rounded-lg px-3 py-1.5">
        <p className="text-xs font-semibold text-gray-900">
          {comment.ownerId.firstName || comment.ownerId.email}
        </p>
        <p className="text-xs mt-0.5">{comment.content}</p>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
          <button
            onClick={() => setReplyTo(comment)}
            className="flex items-center gap-1 hover:text-blue-600"
          >
            <CornerUpRight className="h-3.5 w-3.5" />
            Reply
          </button>
          <span className="text-gray-400">·</span>
          <span>
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        {comment.replies?.map((reply) => (
          <CommentItem key={reply._id} comment={reply} depth={depth + 1} />
        ))}
      </div>
    </div>
  );

  const openModal = async () => {
    setShowModal(true);
    await fetchComments();
  };

  return (
    <>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogTrigger asChild>
          <Card
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
            onClick={openModal}
          >
            <CardHeader className="flex flex-row items-start gap-3 p-3">
              <Avatar className="h-8 w-8">
                {post.ownerId.avatar?.url ? (
                  <AvatarImage src={post.ownerId.avatar.url} />
                ) : (
                  <AvatarFallback className="bg-gray-300 text-xs font-semibold">
                    {displayName[0]?.toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col !mt-0 text-left">
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {displayName}
                </p>
                {post.ownerId.headline && (
                  <p className="text-[11px] text-gray-500 truncate">
                    {post.ownerId.headline}
                  </p>
                )}
                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                  <span>
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <span>•</span>
                  <Globe className="h-3 w-3" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-3 pb-2 text-left text-xs text-gray-700 line-clamp-3">
              {post.content}
              {post.mediaUrl && (
                <div className="mt-2 rounded-lg overflow-hidden">
                  <img
                    src={post.mediaUrl}
                    alt="Post"
                    className="w-full max-h-[160px] object-cover"
                  />
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between items-center px-3 pt-2 text-[11px] text-gray-500 border-t border-gray-100">
              <div className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 text-gray-400" />
                <span>{post.totalReactions || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5 text-gray-400" />
                <span>{post.commentsCount || 0}</span>
              </div>
            </CardFooter>
          </Card>
        </DialogTrigger>

        <DialogContent className="max-w-2xl bg-white p-0 rounded-xl overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {post.ownerId.avatar?.url ? (
                  <AvatarImage src={post.ownerId.avatar.url} />
                ) : (
                  <AvatarFallback>{displayName[0]}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{displayName}</p>
                <p className="text-xs text-gray-500">
                  {post.ownerId.headline || ""}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 text-sm">
            <p className="mb-3 whitespace-pre-wrap">{post.content}</p>
            {post.mediaUrl && (
              <img
                src={post.mediaUrl}
                alt="Post media"
                className="rounded-lg max-h-[400px] w-full object-cover"
              />
            )}

            {/* Reaction bar */}
            <div className="flex justify-around items-center mt-4 border-t border-gray-100 pt-3">
              <div
                className="relative flex flex-col items-center"
                onMouseEnter={() => {
                  if (hideTimeout.current) clearTimeout(hideTimeout.current);
                  setShowPicker(true);
                }}
                onMouseLeave={() => {
                  hideTimeout.current = setTimeout(
                    () => setShowPicker(false),
                    200
                  );
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
                          className="text-xl"
                          title={r.label}
                        >
                          {r.emoji}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button className="flex flex-col items-center text-gray-500 hover:text-blue-600">
                <MessageCircle className="h-5 w-5" />
                <span className="text-xs">Comment</span>
              </button>

              <button className="flex flex-col items-center text-gray-500 hover:text-blue-600">
                <Repeat className="h-5 w-5" />
                <span className="text-xs">Repost</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/posts/${post._id}`
                  );
                  toast.success("Link copied!");
                }}
                className="flex flex-col items-center text-gray-500 hover:text-blue-600"
              >
                <Send className="h-5 w-5" />
                <span className="text-xs">Send</span>
              </button>
            </div>

            {/* Comments */}
            <div className="mt-4 border-t border-gray-100 pt-3">
              {comments.length === 0 ? (
                <p className="text-xs text-gray-500">No comments yet</p>
              ) : (
                comments.map((comment) => (
                  <CommentItem key={comment._id} comment={comment} />
                ))
              )}

              <div className="flex items-center gap-2 mt-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <input
                  type="text"
                  placeholder={
                    replyTo
                      ? `Replying to ${replyTo.ownerId.firstName}`
                      : "Add a comment..."
                  }
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 text-xs rounded-full border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="text-blue-600 text-xs font-medium"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
