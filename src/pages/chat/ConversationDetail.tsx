import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { Skeleton } from "@/components/ui/skeleton";
import { chatApi } from "@/lib/api/chat.api";
import { useConversationStore } from "@/store/ConversationStore";
import { X, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";

interface ConversationDetailProps {
  conversationId: string;
  onClose?: () => void;
  onOpenGroupSettings?: (groupId: string) => void;
}

export function ConversationDetail({
  conversationId,
  onClose,
  onOpenGroupSettings,
}: ConversationDetailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentUser = useConversationStore((s) => s.currentUser);
  const messages = useConversationStore((s) => s.messages);
  const setMessages = useConversationStore((s) => s.setMessages);
  const addMessage = useConversationStore((s) => s.addMessage);
  const conversations = useConversationStore((s) => s.conversations);
  const updateConversation = useConversationStore((s) => s.updateConversation);

  const conversation = conversations.find((c) => c._id === conversationId);

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => chatApi.getMessages(conversationId),
    enabled: !!conversationId,
    refetchInterval: 1500,
  });

  const { data: convData } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => chatApi.getConversation(conversationId),
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (messagesData?.messages) setMessages(messagesData.messages);
  }, [messagesData]);

  useEffect(() => {
    if (convData?.conversation)
      updateConversation(conversationId, convData.conversation);
  }, [convData]);

  const sendMessageMutation = useMutation({
    mutationFn: (body: string) => chatApi.sendMessage({ conversationId, body }),
    onSuccess: (data) => addMessage(data.message),
  });

  const reactMutation = useMutation({
    mutationFn: ({
      messageId,
      reaction,
    }: {
      messageId: string;
      reaction: string;
    }) => chatApi.reactToMessage(messageId, reaction),
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="fixed bottom-6 right-6 w-80 h-24 bg-white shadow-xl rounded-xl flex items-center justify-center text-muted-foreground">
        Conversation not found
      </div>
    );
  }

  const displayName =
    conversation.type === "DIRECT"
      ? `${conversation.otherUser?.firstName ?? ""} ${
          conversation.otherUser?.lastName ?? ""
        }`
      : conversation.title || "Chat";

  const renderMessagesWithDates = () => {
    const list: React.ReactNode[] = [];
    let lastDate = "";
    messages.forEach((message) => {
      const day = format(new Date(message.createdAt), "yyyy-MM-dd");
      if (day !== lastDate) {
        list.push(
          <div key={`sep-${message._id}`} className="flex justify-center my-4">
            <span
              className="
      px-3 
      py-[3px] 
      rounded-full 
      bg-white 
      border border-[#e5e5e5] 
      shadow-sm 
      text-[12px] 
      text-[#6d6d6d]
    "
            >
              {format(new Date(message.createdAt), "PPP")}
            </span>
          </div>
        );
        lastDate = day;
      }

      list.push(
        <MessageBubble
          key={message._id}
          message={message}
          isOwn={message.senderId?._id === currentUser?._id}
          onReact={(emoji) =>
            reactMutation.mutate({
              messageId: message._id,
              reaction: emoji,
            })
          }
        />
      );
    });
    return list;
  };

  return (
    <div className="fixed bottom-6 right-6 w-[380px] h-[600px] bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-200 rounded-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 z-50">
      {/* HEADER */}
      <div className="px-4 py-3 bg-gray-50/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.otherUser?.avatar?.url} />
            <AvatarFallback>
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{displayName}</p>
            <p className="text-xs text-gray-500">
              {conversation.type === "DIRECT"
                ? "Active now"
                : `${conversation.participants?.length || 0} members`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {conversation.type === "GROUP" && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onOpenGroupSettings?.(conversation._id)}
              className="h-8 w-8 rounded-full hover:bg-gray-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}

          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* MESSAGES */}
      <ScrollArea className="flex-1 px-4 py-4 bg-white/70">
        {messagesLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-3">{renderMessagesWithDates()}</div>
            <div ref={scrollRef} />
          </>
        )}
      </ScrollArea>

      {/* INPUT */}
      <div className="border-t border-gray-200 bg-white/90 p-3">
        <MessageInput
          onSendMessage={(text) => sendMessageMutation.mutate(text)}
          isLoading={sendMessageMutation.isPending}
          conversationId={conversationId}
        />
      </div>
    </div>
  );
}
