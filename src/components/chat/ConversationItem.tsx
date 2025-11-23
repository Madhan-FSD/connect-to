import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Conversation } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface ConversationItemProps {
  conversation: Conversation;
  isActive?: boolean;
}

export function ConversationItem({
  conversation,
  isActive = false,
}: ConversationItemProps) {
  const title =
    conversation.type === "DIRECT" && conversation.otherUser
      ? `${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`
      : conversation.title || "Conversation";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const lastMessagePreview = conversation.lastMessageAt
    ? `${formatDistanceToNow(new Date(conversation.lastMessageAt), {
        addSuffix: false,
      })} ago`
    : "No messages";

  const previewText =
    (conversation as any).lastMessage?.body ??
    conversation.lastMessage?.previewText ??
    lastMessagePreview;

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 p-3 rounded-lg transition-all duration-150 hover:bg-primary/6 group cursor-pointer",
        isActive && "bg-primary/10"
      )}
      role="button"
      tabIndex={0}
    >
      {isActive && (
        <div className="absolute left-0 h-full w-1 bg-primary rounded-r-md" />
      )}

      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage
          src={
            conversation.type === "DIRECT" &&
            conversation.otherUser?.avatar?.url
              ? conversation.otherUser.avatar?.url
              : "/placeholder.svg"
          }
        />
        <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
          {getInitials(title)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={cn(
              "font-medium text-sm truncate transition-colors",
              isActive ? "text-foreground font-semibold" : "text-foreground"
            )}
          >
            {title}
          </h3>
          <div className="text-xs text-muted-foreground ml-2">
            {conversation.lastMessageAt
              ? formatDistanceToNow(new Date(conversation.lastMessageAt), {
                  addSuffix: false,
                })
              : null}
          </div>
        </div>

        <p
          className={cn(
            "text-xs truncate transition-colors mt-0.5",
            isActive ? "text-primary-600 font-medium" : "text-muted-foreground"
          )}
        >
          {conversation.unread ? (
            <span className="font-semibold text-foreground">
              {conversation.unread} unread
            </span>
          ) : (
            <span className="truncate text-xs text-muted-foreground">
              {previewText}
            </span>
          )}
        </p>
      </div>

      {conversation.unread ? (
        <div className="flex-shrink-0 h-6 min-w-[26px] px-1.5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
          {conversation.unread > 9 ? "9+" : conversation.unread}
        </div>
      ) : null}
    </div>
  );
}
