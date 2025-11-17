import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageCircle, Repeat, Send } from "lucide-react";
import { ReactionsPicker } from "./ReactionsPicker";
import { reactionApi } from "@/lib/api";

export function ReactionsBar({
  targetType,
  targetId,
  token,
  currentReactionType, // e.g., "LIKE", "LOVE", or null
  onOptimisticUpdate, // Function to locally update state immediately
  onReactSuccess, // Function to finalize state update
  onReactFailure, // Function to revert state after API failure
  onComment,
  onRepost,
  onSend,
}: {
  targetType: "Post" | "Video" | "Comment";
  targetId: string;
  token: string;
  currentReactionType: string | null;
  onOptimisticUpdate: (update: { newType: string }) => void;
  onReactSuccess: (newType: string) => void;
  onReactFailure: (oldType: string | null) => void;
  onComment?: () => void;
  onRepost?: () => void;
  onSend?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isReacting, setIsReacting] = useState(false);

  const handleReact = async (newType: string) => {
    if (isReacting) return;

    const oldType = currentReactionType;

    onOptimisticUpdate({ newType });
    setIsReacting(true);
    setOpen(false);

    try {
      await reactionApi.toggleReaction(targetType, targetId, newType, token);
      onReactSuccess(newType);
    } catch (error) {
      console.error("Error toggling reaction, rolling back:", error);
      onReactFailure(oldType);
    } finally {
      setIsReacting(false);
    }
  };

  const isLiked = currentReactionType === "LIKE";

  return (
    <div className="px-2 sm:px-3 py-1 border-t border-border relative">
      <div className="flex items-center justify-between gap-1 relative">
        <div
          className="relative"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {open && (
            // Position the picker above the bar
            <div className="absolute bottom-10 left-0 z-50">
              <ReactionsPicker
                onSelect={handleReact}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
              />
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            // Use 'text-primary' if the current reaction is 'LIKE', otherwise use muted
            className={`hover:bg-transparent transition-colors ${
              isLiked
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            }`}
            // Default 'Like' click action
            onClick={() => handleReact("LIKE")}
            disabled={isReacting}
          >
            <ThumbsUp
              className={`h-4 w-4 mr-1 ${
                isLiked ? "fill-primary" : ""
              } transition-colors`}
            />
            {isLiked ? "Liked" : "Like"}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-transparent text-muted-foreground hover:text-primary"
          onClick={onComment}
        >
          <MessageCircle className="h-4 w-4 mr-1 transition-colors" />
          Comment
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-transparent text-muted-foreground hover:text-primary"
          onClick={onRepost}
        >
          <Repeat className="h-4 w-4 mr-1 transition-colors" />
          Repost
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-transparent text-muted-foreground hover:text-primary"
          onClick={onSend}
        >
          <Send className="h-4 w-4 mr-1 transition-colors" />
          Send
        </Button>
      </div>
    </div>
  );
}
