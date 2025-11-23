import { useState } from "react";
import { MessageSquare, Plus, Settings, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useConversationStore } from "@/store/ConversationStore";
import { ConversationItem } from "./ConversationItem";
import { useQuery } from "@tanstack/react-query";
import { chatApi } from "@/lib/api/chat.api";
import { clearAuth } from "@/lib/auth";

interface SidebarProps {
  onOpenConversation?: (conversationId: string) => void;
  onCreateDirect?: () => void;
  onCreateGroup?: () => void;
}

export function Sidebar({
  onOpenConversation,
  onCreateDirect,
  onCreateGroup,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const conversations = useConversationStore((state) => state.conversations);
  const setConversations = useConversationStore(
    (state) => state.setConversations
  );

  useQuery({
    queryKey: ["conversations-sidebar"],
    queryFn: async () => {
      const data = await chatApi.listConversations();
      setConversations(data.conversations);
      return data;
    },
    refetchInterval: 5000,
  });

  const filteredConversations = conversations.filter((conv) => {
    const title =
      conv.type === "DIRECT" && conv.otherUser
        ? `${conv.otherUser.firstName} ${conv.otherUser.lastName}`
        : conv.title || "";
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleLogout = () => {
    clearAuth();
    // If your app uses routing, the auth guard will redirect.
    window.location.href = "/login";
  };

  return (
    <div className="w-72 border-r border-border bg-background flex flex-col h-screen">
      <div className="p-4 border-b border-border/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-primary rounded-full flex items-center justify-center shadow-sm">
              <MessageSquare className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground">Messages</h1>
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:bg-muted rounded-full"
              onClick={onCreateDirect}
              title="New Direct Message"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:bg-muted rounded-full"
              onClick={onCreateGroup}
              title="New Group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 pl-9 bg-muted/50 border-0 text-sm placeholder:text-muted-foreground rounded-full focus-visible:ring-2 focus-visible:ring-primary/20"
            aria-label="Search conversations"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-1 space-y-0.5">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => onOpenConversation?.(conversation._id)}
              >
                <ConversationItem
                  conversation={conversation}
                  isActive={false}
                />
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground font-medium">
                No conversations
              </p>
              <button
                onClick={onCreateDirect}
                className="text-primary hover:text-primary-600 text-sm font-semibold mt-2 inline-block"
              >
                Start one now
              </button>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border/60 flex gap-1.5">
        <Button
          size="icon"
          variant="ghost"
          className="flex-1 h-8 hover:bg-muted rounded-full"
        >
          <Settings className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="flex-1 h-8 hover:bg-muted rounded-full"
          onClick={handleLogout}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path
              d="M16 17l5-5-5-5M21 12H9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 19H9V5H5z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}
