import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Smile, Reply, Info } from "lucide-react";
import { Message } from "@/types";

export function MessageBubble({
  message,
  isOwn,
  isGroup = false,
  onReply,
  onReact,
}: {
  message: Message;
  isOwn: boolean;
  isGroup?: boolean;
  onReply?: (m: Message) => void;
  onReact?: (emoji: string) => void;
}) {
  const sender = message.senderId as any;
  const name = `${sender?.firstName ?? ""} ${sender?.lastName ?? ""}`.trim();
  const avatar = sender?.avatar?.url;

  const initials =
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div
      className={`w-full px-3 my-[6px] flex ${
        isOwn ? "justify-end" : "justify-start"
      }`}
    >
      {/* Row MUST align at the top like WhatsApp */}
      <div
        className={`flex items-start gap-2 ${
          isOwn ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* INCOMING AVATAR */}
        {!isOwn && (
          <Avatar className="h-7 w-7 flex-shrink-0">
            <AvatarImage src={avatar} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        )}

        {/* MESSAGE BUBBLE */}
        <div
          className={`
    relative flex flex-col
    px-3 py-[8px] pb-[20px] pr-12
    max-w-[65%] leading-[1.45] text-[15px]
    ${
      isOwn
        ? "bg-[#d9fdd3] text-[#111] rounded-lg rounded-br-none"
        : "bg-[#ffffff] border border-[#d1d7db] text-[#111] rounded-lg rounded-bl-none"
    }
  `}
        >
          {/* Group Sender Name (only for groups) */}
          {!isOwn && isGroup && (
            <p className="text-[12px] font-semibold text-[#0b93f6] mb-1">
              {name}
            </p>
          )}

          {/* Message Text */}
          <span className="whitespace-pre-wrap">{message.body}</span>

          {/* Timestamp */}
          <span className="absolute bottom-[4px] right-[8px] text-[11px] text-[#667781]">
            {format(new Date(message.createdAt), "p")}
          </span>
        </div>

        {/* HOVER ACTIONS */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 mt-[4px]">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-full hover:bg-gray-200"
            onClick={() => onReply?.(message)}
          >
            <Reply className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-full hover:bg-gray-200"
            onClick={() => onReact?.("👍")}
          >
            <Smile className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-full hover:bg-gray-200"
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
