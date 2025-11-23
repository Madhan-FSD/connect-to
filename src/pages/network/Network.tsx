import { useEffect, useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { toast } from "sonner";
import { connectionApi } from "@/lib/api";
import { getAuth } from "@/lib/auth";
import { useConversationStore } from "@/store/ConversationStore";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, Clock, Send, UserPlus } from "lucide-react";
import HeaderSection from "./HeaderSection";
import { CardLoader } from "@/components/CardLoader";
import { EmptyState } from "@/components/EmptyState";
import ConnectionsList from "./ConnectionsList";
import RequestsList from "./RequestsList";
import SuggestionsList from "./SuggestionList";

export default function Network() {
  const [activeTab, setActiveTab] = useState("connections");

  const [loading, setLoading] = useState<Record<string, boolean>>({
    connections: false,
    received: false,
    sent: false,
    suggestions: false,
  });

  const [connections, setConnections] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const user = getAuth();
  const openDirect = useConversationStore((s) => s.openDirect);

  const fetchConnections = useCallback(async () => {
    if (!user) return;
    setLoading((prev) => ({ ...prev, connections: true }));
    try {
      const res = await connectionApi.getConnections(user.userId, user.token);
      setConnections(res.connections || []);
    } catch {
      toast.error("Failed to load connections");
    } finally {
      setLoading((prev) => ({ ...prev, connections: false }));
    }
  }, [user]);

  const fetchReceived = useCallback(async () => {
    if (!user) return;
    setLoading((prev) => ({ ...prev, received: true }));
    try {
      const res = await connectionApi.getPending(user.token);
      setReceivedRequests(res.requests || []);
    } catch {
      toast.error("Failed to load received requests");
    } finally {
      setLoading((prev) => ({ ...prev, received: false }));
    }
  }, [user]);

  const fetchSent = useCallback(async () => {
    if (!user) return;
    setLoading((prev) => ({ ...prev, sent: true }));
    try {
      const res = await connectionApi.getSentPending(user.token);
      setSentRequests(res.requests || []);
    } catch {
      toast.error("Failed to load sent requests");
    } finally {
      setLoading((prev) => ({ ...prev, sent: false }));
    }
  }, [user]);

  const fetchSuggestions = useCallback(async () => {
    if (!user) return;
    setLoading((prev) => ({ ...prev, suggestions: true }));
    try {
      const res = await connectionApi.getSuggestions(user.token, 10);
      setSuggestions(res.suggestions || []);
    } catch {
      toast.error("Failed to load suggestions");
    } finally {
      setLoading((prev) => ({ ...prev, suggestions: false }));
    }
  }, [user]);

  const fetchAllData = useCallback(() => {
    fetchConnections();
    fetchReceived();
    fetchSent();
    fetchSuggestions();
  }, [fetchConnections, fetchReceived, fetchSent, fetchSuggestions]);

  const refetch = useCallback(() => {
    switch (activeTab) {
      case "connections":
        fetchConnections();
        break;
      case "received":
        fetchReceived();
        break;
      case "sent":
        fetchSent();
        break;
      case "suggestions":
        fetchSuggestions();
        break;
    }
  }, [activeTab, fetchConnections, fetchReceived, fetchSent, fetchSuggestions]);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    refetch();
  }, [activeTab, refetch]);

  const handleSendRequest = async (id: string) => {
    if (!user) return;
    try {
      await connectionApi.sendRequest(id, "", user.token);
      toast.success("Connection request sent!");

      fetchSuggestions();
      fetchSent();
    } catch {
      toast.error("Failed to send request");
    }
  };

  const handleAcceptRequest = async (id: string) => {
    if (!user) return;
    try {
      await connectionApi.accept(id, user.token);
      toast.success("Connection accepted");

      fetchConnections();
      fetchReceived();
    } catch {
      toast.error("Failed to accept request");
    }
  };

  const handleRejectRequest = async (id: string) => {
    if (!user) return;
    try {
      await connectionApi.reject(id, user.token);
      toast.success("Connection rejected");

      fetchReceived();
    } catch {
      toast.error("Failed to reject request");
    }
  };

  const handleCancelRequest = async (id: string) => {
    if (!user) return;
    try {
      await connectionApi.remove(id, user.token);
      toast.success("Request cancelled");

      fetchSent();
      fetchSuggestions();
    } catch {
      toast.error("Failed to cancel request");
    }
  };

  const handleRemoveConnection = async (id: string) => {
    if (!user) return;
    try {
      await connectionApi.remove(id, user.token);
      toast.success("Connection removed");
      fetchConnections();
      fetchSuggestions();
    } catch {
      toast.error("Failed to remove connection");
    }
  };

  const handleMessage = (userId: string) => {
    openDirect(userId);
  };

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-8">
        <HeaderSection />

        <Tabs defaultValue="connections" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 h-12 mb-4">
            <TabsTrigger value="connections">
              <Users className="w-5 h-5 mr-2" />
              Connections ({connections.length})
            </TabsTrigger>

            <TabsTrigger value="received">
              <Clock className="w-5 h-5 mr-2" />
              Requests ({receivedRequests.length})
            </TabsTrigger>

            <TabsTrigger value="sent">
              <Send className="w-5 h-5 mr-2" />
              Pending ({sentRequests.length})
            </TabsTrigger>

            <TabsTrigger value="suggestions">
              <UserPlus className="w-5 h-5 mr-2" />
              Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections">
            {loading.connections ? (
              <CardLoader message="Loading connections..." />
            ) : connections.length === 0 ? (
              <EmptyState icon={Users} message="No connections yet." />
            ) : (
              <ConnectionsList
                items={connections}
                onMessage={(id) => handleMessage(id)}
                onRemove={handleRemoveConnection}
              />
            )}
          </TabsContent>

          <TabsContent value="received">
            {loading.received ? (
              <CardLoader message="Loading received requests..." />
            ) : receivedRequests.length === 0 ? (
              <EmptyState icon={Clock} message="No incoming requests." />
            ) : (
              <RequestsList
                type="received"
                items={receivedRequests}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
              />
            )}
          </TabsContent>

          <TabsContent value="sent">
            {loading.sent ? (
              <CardLoader message="Loading sent requests..." />
            ) : sentRequests.length === 0 ? (
              <EmptyState icon={Send} message="No pending requests." />
            ) : (
              <RequestsList
                type="sent"
                items={sentRequests}
                onCancel={handleCancelRequest}
              />
            )}
          </TabsContent>

          <TabsContent value="suggestions">
            {loading.suggestions ? (
              <CardLoader message="Loading suggestions..." />
            ) : suggestions.length === 0 ? (
              <EmptyState icon={UserPlus} message="No suggestions found." />
            ) : (
              <SuggestionsList
                items={suggestions}
                onConnect={handleSendRequest}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
