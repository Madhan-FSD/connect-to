import { useEffect } from "react";
import { useConversationStore } from "@/store/ConversationStore";
import { ConversationDetail } from "@/pages/chat/ConversationDetail";
import { useLocation } from "react-router-dom";

export function ChatWidget() {
  const location = useLocation();

  const activeConversationId = useConversationStore(
    (s) => s.activeConversationId
  );
  const widgetOpen = useConversationStore((s) => s.widgetOpen);

  useEffect(() => {
    if (location.pathname !== "/chat") {
      useConversationStore.setState({
        widgetOpen: false,
        activeConversationId: null,
      });
    }
  }, [location.pathname]);

  if (!widgetOpen || !activeConversationId) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[500px] rounded-xl shadow-xl overflow-hidden bg-card border">
      <ConversationDetail
        conversationId={activeConversationId}
        onClose={() => useConversationStore.setState({ widgetOpen: false })}
        onOpenGroupSettings={() => {}}
      />
    </div>
  );
}
