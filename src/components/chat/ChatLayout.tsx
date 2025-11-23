import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { useConversationStore } from "@/store/ConversationStore";
import { chatApi } from "@/lib/api/chat.api";
import { getAuth } from "@/lib/auth";
import { ConversationList } from "@/pages/chat/ConversationList";
import { ConversationDetail } from "@/pages/chat/ConversationDetail";
import CreateDirect from "@/pages/chat/CreateDirect";
import CreateGroup from "@/pages/chat/CreateGroup";
import GroupSettings from "@/pages/chat/GroupSettings";

export function ChatLayout() {
  const activeConversationId = useConversationStore(
    (s) => s.activeConversationId
  );
  const setActiveConversation = useConversationStore(
    (s) => s.setActiveConversation
  );

  const widgetOpen = useConversationStore((s) => s.widgetOpen);
  const setWidgetOpen = useConversationStore((s) => s.setWidgetOpen);

  const [showCreateDirect, setShowCreateDirect] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupSettingsFor, setShowGroupSettingsFor] = useState<
    string | null
  >(null);

  useEffect(() => {
    const token = getAuth()?.token;
    if (!token) return;

    chatApi
      .setPresence("ONLINE", { lastSeen: new Date() })
      .catch(console.error);

    return () => {
      chatApi.setPresence("OFFLINE").catch(console.error);
    };
  }, []);

  const openConversation = (id: string) => {
    setActiveConversation(id);
    setWidgetOpen(true);
  };

  const closeConversation = () => setWidgetOpen(false);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar
        onOpenConversation={openConversation}
        onCreateDirect={() => setShowCreateDirect(true)}
        onCreateGroup={() => setShowCreateGroup(true)}
      />

      <main className="flex-1 flex flex-col overflow-hidden bg-card">
        {!widgetOpen ? (
          <ConversationList />
        ) : (
          <ConversationDetail
            conversationId={activeConversationId!}
            onClose={closeConversation}
            onOpenGroupSettings={(id) => setShowGroupSettingsFor(id)}
          />
        )}
      </main>

      {showCreateDirect && (
        <div className="fixed inset-0 z-50 grid place-items-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowCreateDirect(false)}
          />
          <div className="z-50 w-full max-w-md">
            <CreateDirect
              onClose={() => setShowCreateDirect(false)}
              onCreated={(conv) => {
                setShowCreateDirect(false);
                openConversation(conv._id);
              }}
            />
          </div>
        </div>
      )}

      {showCreateGroup && (
        <div className="fixed inset-0 z-50 grid place-items-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowCreateGroup(false)}
          />
          <div className="z-50 w-full max-w-md">
            <CreateGroup
              onClose={() => setShowCreateGroup(false)}
              onCreated={(conv) => {
                setShowCreateGroup(false);
                openConversation(conv._id);
              }}
            />
          </div>
        </div>
      )}

      {showGroupSettingsFor && (
        <div className="fixed inset-0 z-50 grid place-items-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowGroupSettingsFor(null)}
          />
          <div className="z-50 w-full max-w-2xl">
            <GroupSettings
              groupId={showGroupSettingsFor}
              onClose={() => setShowGroupSettingsFor(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
