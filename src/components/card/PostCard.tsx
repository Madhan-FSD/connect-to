import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MoreVertical,
  MessageCircle,
  Repeat,
  Send,
  ThumbsUp,
  Globe,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getAuth } from "@/lib/auth";
import { toast } from "sonner";
import { postApi } from "@/lib/api";
import { reactionApi } from "@/lib/api/reaction.api";
import { motion, AnimatePresence } from "framer-motion";
// FIX 7: Update import names to match the export in post.interface
import {
  Comment,
  Post as PostInterface,
  User,
  Owner,
} from "@/utils/post.interface";
import { useNavigate } from "react-router-dom";

const REACTIONS = [
  { type: "LIKE", emoji: "👍", label: "Like" },
  { type: "LOVE", emoji: "❤️", label: "Love" },
  { type: "CELEBRATE", emoji: "🎉", label: "Celebrate" },
  { type: "INSIGHTFUL", emoji: "💡", label: "Insightful" },
];

const isOwnerObject = (owner: Owner | string | undefined): owner is Owner => {
  return typeof owner === "object" && owner !== null && "_id" in owner;
};

interface PostCardProps {
  post: PostInterface; // Use the imported PostInterface
}

export function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate();
  const user = getAuth();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [expanded, setExpanded] = useState(false);
  // FIX 9: The Post interface doesn't define `userReaction` or `reactionsCount`.
  // Assuming the API returns these fields or they are properties added to the Post object
  // during hydration/retrieval. We'll add temporary optional types to PostInterface
  // for these fields in post.interface.ts for now, but a more robust fix would be
  // to define a `PostWithUserData` interface if possible.
  const [selectedReaction, setSelectedReaction] = useState<string | null>(
    (post as any).userReaction || null
  );
  const [reactionCount, setReactionCount] = useState(
    (post as any).reactionsCount || 0
  );
  const [showPicker, setShowPicker] = useState(false);

  // FIX 10: Simplify owner logic. Post.ownerId is of type Owner.
  // The original code `isUserObject(post.ownerId) ? post.ownerId : post.author` is redundant
  // and relies on a non-existent `post.author` field.
  const owner = post.ownerId; // Assumes ownerId is a populated Owner object
  const displayName =
    owner?.firstName || owner?.lastName
      ? `${owner.firstName || ""} ${owner.lastName || ""}`.trim()
      : owner?.email || "User";

  const handleCardClick = () => {
    // FIX 11: Use post.channelHandle for channel navigation. The targetType is not needed.
    if (post.channelHandle) {
      navigate(`/channel/${post.channelHandle}`);
    } else if ((owner as any)?.handle) {
      // owner is of type Owner which may not have 'handle', casting as any for now
      navigate(`/profile/${(owner as any).handle}`);
    }
  };

  const handleReaction = async (type: string) => {
    if (!user?.token) {
      toast.error("You must be logged in");
      return;
    }

    const previousReaction = selectedReaction;
    const newReaction = selectedReaction === type ? null : type;

    // Optimistic Update
    setSelectedReaction(newReaction);
    setReactionCount(
      (prev) => prev + (newReaction ? (previousReaction ? 0 : 1) : -1)
    );

    try {
      await reactionApi.toggleReaction("Post", post._id, type, user.token);
    } catch (error) {
      console.error("Error toggling reaction:", error);
      // Revert on failure
      setSelectedReaction(previousReaction);
      setReactionCount((post as any).reactionsCount || 0); // Revert to initial count
      toast.error("Failed to update reaction");
    }
  };

  const toggleComments = async () => {
    const shouldLoad = !showComments && comments.length === 0 && user?.token;

    if (shouldLoad) {
      try {
        const data = await postApi.getComments(post._id, user.token);
        setComments(data || []);
      } catch (error) {
        console.error("Error loading comments:", error);
        toast.error("Failed to load comments");
      }
    }
    setShowComments(!showComments);
  };

  const handleComment = async () => {
    if (!commentText.trim() || !user?.token) return;

    const content = commentText.trim();
    setCommentText(""); // Clear input immediately

    try {
      const newComment = await postApi.addComment(
        post._id,
        content,
        user.token
      );
      // Prepend the new comment to the list
      setComments((prev) => [newComment, ...prev]);
      toast.success("Comment added");
    } catch (error) {
      console.error("Error adding comment:", error);
      // Revert on failure if needed, or just keep the input cleared
      toast.error("Failed to add comment");
      setCommentText(content); // Restore input for user to retry
    }
  };

  const truncatedContent =
    post.content && post.content.length > 200 && !expanded
      ? post.content.slice(0, 200) + "..."
      : post.content;

  return (
    <Card className="w-full bg-card border border-border hover:shadow-[var(--shadow-hover)] transition-shadow duration-200 rounded-lg overflow-hidden mb-3">
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between">
          <div
            className="flex items-start gap-2 sm:gap-3 flex-1 cursor-pointer"
            onClick={handleCardClick}
          >
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
              <AvatarImage
                // FIX 12: Use owner?.avatar?.url as the fallback for owner avatar
                src={(owner as any)?.avatarUrl || owner?.avatar?.url}
                alt={displayName}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {displayName[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base text-foreground truncate">
                {displayName}
              </p>
              {owner?.headline && (
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {owner.headline}
                </p>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <span>
                  {/* Ensure post.createdAt is a valid date string */}
                  {post.createdAt &&
                    formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                </span>
                <span>•</span>
                <Globe className="h-3 w-3" />
              </div>
            </div>
          </div>

          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3">
          {post.title && (
            <h3 className="font-semibold text-base sm:text-lg mb-2">
              {post.title}
            </h3>
          )}
          {post.content && (
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {truncatedContent}
              {post.content.length > 200 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-primary hover:underline ml-1 font-medium"
                >
                  {expanded ? "Show less" : "...see more"}
                </button>
              )}
            </p>
          )}
        </div>
      </div>

      {/* FIX 13: The Post interface defines 'mediaUrl' and 'thumbnailUrl' but not 'mediaUrls' as an array.
      If a regular post has media, it should use 'post.mediaUrl' or be adjusted in the interface.
      Assuming 'mediaUrl' is the correct field for a single image/post media. */}
      {post.mediaUrl && (
        <div className="w-full">
          <img
            src={post.mediaUrl}
            alt="Post media"
            className="w-full object-cover max-h-[500px]"
          />
        </div>
      )}

      {reactionCount > 0 && (
        <div className="px-3 sm:px-4 py-2 flex items-center justify-between text-xs text-muted-foreground border-b border-border">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-3 w-3 fill-primary text-primary" />
            <span>{reactionCount}</span>
          </div>
          <div className="flex items-center gap-3">
            {post.commentsCount && post.commentsCount > 0 && (
              <span>{post.commentsCount} comments</span>
            )}
          </div>
        </div>
      )}

      <div className="px-2 sm:px-3 py-1 border-t border-border">
        <div className="flex items-center justify-around gap-1">
          <div className="relative flex-1">
            <Button
              variant="ghost"
              size="sm"
              className={`w-full hover:bg-muted ${
                selectedReaction ? "text-primary" : ""
              }`}
              onMouseEnter={() => setShowPicker(true)}
              onMouseLeave={() => setTimeout(() => setShowPicker(false), 200)}
              onClick={() => handleReaction("LIKE")}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                {selectedReaction || "Like"}
              </span>
            </Button>

            <AnimatePresence>
              {showPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-card border border-border rounded-full shadow-lg px-2 py-1 flex gap-1 z-10"
                  onMouseEnter={() => setShowPicker(true)}
                  onMouseLeave={() => setShowPicker(false)}
                >
                  {REACTIONS.map((reaction) => (
                    <button
                      key={reaction.type}
                      onClick={() => {
                        handleReaction(reaction.type);
                        setShowPicker(false);
                      }}
                      className="hover:scale-125 transition-transform text-xl p-1"
                      title={reaction.label}
                    >
                      {reaction.emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="flex-1 hover:bg-muted"
            onClick={toggleComments}
          >
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

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-3 sm:p-4 space-y-3">
              <div className="flex gap-2">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleComment()}
                    placeholder="Add a comment..."
                    className="flex-1 bg-muted rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button
                    size="sm"
                    onClick={handleComment}
                    disabled={!commentText.trim()}
                  >
                    Post
                  </Button>
                </div>
              </div>

              {comments.map((comment) => {
                // FIX 14: Use isOwnerObject for comments since comment.ownerId is of type Owner
                const commentOwner = isOwnerObject(comment.ownerId)
                  ? comment.ownerId
                  : undefined;
                const commentOwnerName =
                  commentOwner?.firstName || commentOwner?.lastName
                    ? `${commentOwner.firstName || ""} ${
                        commentOwner.lastName || ""
                      }`.trim()
                    : commentOwner?.email || "User";

                return (
                  <div key={comment._id} className="flex gap-2">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage
                        src={
                          (commentOwner as any)?.avatarUrl ||
                          commentOwner?.avatar?.url
                        }
                        alt={commentOwnerName}
                      />
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {commentOwnerName[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-muted rounded-2xl px-3 py-2">
                      <p className="font-semibold text-sm">
                        {commentOwnerName}
                      </p>
                      <p className="text-sm mt-1">{comment.content}</p>
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        <button className="hover:underline">Like</button>
                        <button className="hover:underline">Reply</button>
                        <span>
                          {comment.createdAt &&
                            formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                            })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
