import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Users, UserPlus, UserCheck, UserX, Clock } from "lucide-react";
import { connectionApi } from "@/lib/api";

export default function Network() {
  const [connections, setConnections] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = getAuth();

  const fetchNetworkData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const [connectionsRes, pendingRes, suggestionsRes] = await Promise.all([
        connectionApi.getConnections(user.userId, user.token),
        connectionApi.getPending(user.token),
        connectionApi.getSuggestions(user.token, 10),
      ]);

      setConnections(connectionsRes.connections || []);
      setPendingRequests(pendingRes.requests || []);
      setSuggestions(suggestionsRes.suggestions || []);
    } catch (error) {
      console.error("Failed to load network data:", error);
      toast.error("Failed to load network data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const handleSendRequest = async (recipientId: string) => {
    if (!user) return;
    try {
      await connectionApi.sendRequest(recipientId, "", user.token);
      toast.success("Connection request sent!");
      fetchNetworkData();
    } catch (error: any) {
      toast.error(error.error || "Failed to send request");
    }
  };

  const handleAcceptRequest = async (connectionId: string) => {
    if (!user) return;
    try {
      await connectionApi.accept(connectionId, user.token);
      toast.success("Connection accepted!");
      fetchNetworkData();
    } catch (error) {
      toast.error("Failed to accept request");
    }
  };

  const handleRejectRequest = async (connectionId: string) => {
    if (!user) return;
    try {
      await connectionApi.reject(connectionId, user.token);
      toast.success("Connection rejected");
      fetchNetworkData();
    } catch (error) {
      toast.error("Failed to reject request");
    }
  };

  const handleRemoveConnection = async (connectionId: string) => {
    if (!user) return;
    try {
      await connectionApi.remove(connectionId, user.token);
      toast.success("Connection removed");
      fetchNetworkData();
    } catch (error) {
      toast.error("Failed to remove connection");
    }
  };

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            My Network
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your connections and grow your network
          </p>
        </div>

        <Tabs defaultValue="connections" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connections">
              <Users className="h-4 w-4 mr-2" />
              Connections ({connections.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              <Clock className="h-4 w-4 mr-2" />
              Requests ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="suggestions">
              <UserPlus className="h-4 w-4 mr-2" />
              Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections">
            {isLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Loading connections...
                  </p>
                </CardContent>
              </Card>
            ) : connections.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No connections yet. Start connecting with others!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {connections.map((connection) => (
                  <Card key={connection._id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={connection.avatarUrl} />
                          <AvatarFallback>
                            {connection.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{connection.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {connection.email}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() =>
                              handleRemoveConnection(connection._id)
                            }
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests">
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No pending requests</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <Card key={request._id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.requester?.avatarUrl} />
                          <AvatarFallback>
                            {request.requester?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {request.requester?.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {request.requester?.email}
                          </p>
                          {request.requestMessage && (
                            <p className="text-sm mt-2 text-foreground/80">
                              "{request.requestMessage}"
                            </p>
                          )}
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptRequest(request._id)}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectRequest(request._id)}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggestions">
            {suggestions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No suggestions available at the moment
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion._id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={suggestion.avatarUrl} />
                          <AvatarFallback>
                            {suggestion.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{suggestion.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.email}
                          </p>
                          <Button
                            size="sm"
                            className="mt-3"
                            onClick={() => handleSendRequest(suggestion._id)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
