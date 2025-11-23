import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useConversationStore } from "@/store/ConversationStore";
import { chatApi } from "@/lib/api/chat.api";

export function ConversationList() {
  const navigate = useNavigate();
  const setConversations = useConversationStore(
    (state) => state.setConversations
  );
  const conversations = useConversationStore((state) => state.conversations);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => chatApi.listConversations(),
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (data?.conversations) {
      setConversations(data.conversations);
    }
  }, [data, setConversations]);

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-4 flex flex-col items-center justify-center">
        <div className="w-full space-y-4 max-w-lg">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2 text-destructive">
            Error Loading Conversations
          </h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "Failed to load"}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No conversations yet</h2>
          <p className="text-muted-foreground mb-4">
            Start a new chat to get started
          </p>
          <Button onClick={() => navigate("/new/direct")}>
            Start Direct Message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Select a conversation</h2>
        <p className="text-muted-foreground">
          Choose a chat from the sidebar to get started
        </p>
      </div>
    </div>
  );
}
