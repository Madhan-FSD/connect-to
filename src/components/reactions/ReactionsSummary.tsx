import { ThumbsUp } from "lucide-react";

interface ReactionsSummaryProps {
  reactions?: number;
  comments?: number;
  views?: number;
}

export function ReactionsSummary({
  reactions = 0,
  comments = 0,
  views = 0,
}: ReactionsSummaryProps) {
  if (!(reactions || comments || views)) return null;

  return (
    <div className="px-3 sm:px-4 py-1.5 flex items-center justify-between text-xs text-muted-foreground border-b border-border">
      <div className="flex items-center gap-1">
        {reactions > 0 && (
          <>
            <ThumbsUp className="h-3 w-3 fill-primary text-primary" />
            <span>{reactions}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        {comments > 0 && <span>{comments} comments</span>}
        {views > 0 && <span>{views} views</span>}
      </div>
    </div>
  );
}
