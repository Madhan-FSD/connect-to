import { useEffect, useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  MoreVertical,
  MinusCircle,
  Link as LinkIcon,
  Send,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { getAuth } from "@/lib/auth";
import { toast } from "sonner";
import { connectionApi } from "@/lib/api";
import { ProfileCard } from "@/components/card/ProflieCard";

const getInitials = (firstName: string, lastName: string) =>
  `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();

export default function Network() {
  const [activeTab, setActiveTab] = useState("connections");
  const [connections, setConnections] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const user = getAuth();

  const fetchConnections = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await connectionApi.getConnections(user.userId, user.token);
      setConnections(res.connections || []);
    } catch (e) {
      toast.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchReceivedRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await connectionApi.getPending(user.token);
      setReceivedRequests(res.requests || []);
    } catch {
      toast.error("Failed to load received requests");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchSentRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await connectionApi.getSentPending(user.token);
      setSentRequests(res.requests || []);
    } catch {
      toast.error("Failed to load sent requests");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchSuggestions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await connectionApi.getSuggestions(user.token, 10);
      setSuggestions(res.suggestions || []);
    } catch {
      toast.error("Failed to load suggestions");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refetch = useCallback(() => {
    switch (activeTab) {
      case "connections":
        fetchConnections();
        break;
      case "received":
        fetchReceivedRequests();
        break;
      case "sent":
        fetchSentRequests();
        break;
      case "suggestions":
        fetchSuggestions();
        break;
    }
  }, [
    activeTab,
    fetchConnections,
    fetchReceivedRequests,
    fetchSentRequests,
    fetchSuggestions,
  ]);

  useEffect(() => {
    refetch();
  }, [activeTab, refetch]);

  const handleSendRequest = async (id: string) => {
    if (!user) return;
    try {
      await connectionApi.sendRequest(id, "", user.token);
      toast.success("Connection request sent!");
      fetchSuggestions();
      fetchSentRequests();
    } catch {
      toast.error("Failed to send request");
    }
  };

  const handleAcceptRequest = async (id: string) => {
    if (!user) return;
    try {
      await connectionApi.accept(id, user.token);
      toast.success("Connection accepted!");
      fetchConnections();
      fetchReceivedRequests();
    } catch {
      toast.error("Failed to accept request");
    }
  };

  const handleRejectRequest = async (id: string) => {
    if (!user) return;
    try {
      await connectionApi.reject(id, user.token);
      toast.success("Connection rejected");
      fetchReceivedRequests();
    } catch {
      toast.error("Failed to reject request");
    }
  };

  const handleCancelRequest = async (id: string) => {
    if (!user) return;
    try {
      await connectionApi.remove(id, user.token);
      toast.success("Request cancelled");
      fetchSentRequests();
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
    } catch {
      toast.error("Failed to remove connection");
    }
  };

  const handleBlockUser = async (id: string) => {
    if (!user) return;
    try {
      await connectionApi.blockUser(id, user.token);
      toast.success("User blocked successfully.");
      refetch();
    } catch {
      toast.error("Failed to block user");
    }
  };

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-8">
        <div className="mb-8 border-b pb-4">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary-500 to-indigo-600 bg-clip-text text-transparent">
            My Professional Network
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Manage connections, review requests, and discover new professionals.
          </p>
        </div>

        <Tabs defaultValue="connections" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 h-12 text-md">
            <TabsTrigger value="connections">
              <Users className="h-5 w-5 mr-2" />
              Connections ({connections.length})
            </TabsTrigger>
            <TabsTrigger value="received">
              <Clock className="h-5 w-5 mr-2" />
              Requests ({receivedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              <Send className="h-5 w-5 mr-2" />
              Pending ({sentRequests.length})
            </TabsTrigger>
            <TabsTrigger value="suggestions">
              <UserPlus className="h-5 w-5 mr-2" />
              Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections">
            {loading ? (
              <CardLoader message="Loading connections..." />
            ) : connections.length === 0 ? (
              <EmptyState
                icon={Users}
                message="No connections yet. Start connecting!"
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {connections.map((conn) => (
                  <ProfileCard
                    key={conn._id}
                    id={conn._id}
                    name={`${conn.firstName} ${conn.lastName}`}
                    handle={conn.email?.split("@")[0]}
                    bio={conn.profileHeadline}
                    avatarUrl={conn.avatar?.url}
                    connections={conn.connectionCount}
                    joinedDate="Apr 2024"
                    isConnected
                    onMessage={(id) => console.log("Message:", id)}
                    onSave={(id) => console.log("Saved:", id)}
                    onLike={(id) => console.log("Liked:", id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Received Requests */}
          <TabsContent value="received">
            {loading ? (
              <CardLoader message="Loading received requests..." />
            ) : receivedRequests.length === 0 ? (
              <EmptyState
                icon={Clock}
                message="No incoming connection requests."
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {receivedRequests.map((req) => {
                  const u = req.requester;
                  return (
                    <ProfileCard
                      key={req._id}
                      id={req._id}
                      name={`${u.firstName} ${u.lastName}`}
                      handle={u.email?.split("@")[0]}
                      bio={u.profileHeadline}
                      avatarUrl={u.avatar?.url}
                      connections={u.connectionCount}
                      onConnect={() => handleAcceptRequest(req._id)}
                      onMessage={() => handleRejectRequest(req._id)}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Sent Requests */}
          <TabsContent value="sent">
            {loading ? (
              <CardLoader message="Loading sent requests..." />
            ) : sentRequests.length === 0 ? (
              <EmptyState
                icon={Send}
                message="You haven’t sent any connection requests yet."
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {sentRequests.map((req) => {
                  const u = req.recipient;
                  return (
                    <ProfileCard
                      key={req._id}
                      id={req._id}
                      name={`${u.firstName} ${u.lastName}`}
                      handle={u.email?.split("@")[0]}
                      bio={u.profileHeadline}
                      avatarUrl={u.avatar?.url}
                      connections={u.connectionCount}
                      onConnect={() => handleCancelRequest(req._id)}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggestions">
            {loading ? (
              <CardLoader message="Loading suggestions..." />
            ) : suggestions.length === 0 ? (
              <EmptyState
                icon={UserPlus}
                message="No new connection suggestions right now."
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {suggestions.map((sug) => (
                  <ProfileCard
                    key={sug._id}
                    id={sug._id}
                    name={`${sug.firstName} ${sug.lastName}`}
                    handle={sug.email?.split("@")[0]}
                    bio={sug.profileHeadline}
                    avatarUrl={sug.avatar?.url}
                    connections={sug.connectionCount}
                    onConnect={() => handleSendRequest(sug._id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

const CardLoader = ({ message }: { message: string }) => (
  <Card>
    <CardContent className="py-12 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
      <p className="text-lg font-medium text-muted-foreground">{message}</p>
    </CardContent>
  </Card>
);

const EmptyState = ({
  icon: Icon,
  message,
}: {
  icon: any;
  message: string;
}) => (
  <Card>
    <CardContent className="py-12 text-center">
      <Icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
      <p className="text-lg font-medium">{message}</p>
    </CardContent>
  </Card>
);
