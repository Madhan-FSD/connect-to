import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getAuth } from "@/lib/auth";
import { toast } from "sonner";
import { UserPlus, UserCheck, Clock, UserMinus } from "lucide-react";
import { connectionApi } from "@/lib/api";

interface UserConnectionButtonProps {
  userId: string;
  onUpdate?: () => void;
}

export function UserConnectionButton({
  userId,
  onUpdate,
}: UserConnectionButtonProps) {
  const [status, setStatus] = useState<string>("NONE");
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const user = getAuth();

  const fetchStatus = async () => {
    if (!user || user.userId === userId) return;
    try {
      const response = await connectionApi.getStatus(userId, user.token);
      setStatus(response.status);
      setConnectionId(response.connection?._id || null);
      setIsSent(response.isSent || false);
    } catch (error) {
      console.error("Failed to fetch connection status:", error);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [userId]);

  const handleSendRequest = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await connectionApi.sendRequest(userId, "", user.token);
      toast.success("Connection request sent!");
      await fetchStatus();
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.error || "Failed to send request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!user || !connectionId) return;
    setIsLoading(true);
    try {
      await connectionApi.accept(connectionId, user.token);
      toast.success("Connection accepted!");
      await fetchStatus();
      onUpdate?.();
    } catch (error) {
      toast.error("Failed to accept request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveConnection = async () => {
    if (!user || !connectionId) return;
    setIsLoading(true);
    try {
      await connectionApi.remove(connectionId, user.token);
      toast.success("Connection removed");
      await fetchStatus();
      onUpdate?.();
    } catch (error) {
      toast.error("Failed to remove connection");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.userId === userId) return null;

  if (status === "NONE") {
    return (
      <Button onClick={handleSendRequest} disabled={isLoading} size="sm">
        <UserPlus className="h-4 w-4 mr-2" />
        Connect
      </Button>
    );
  }

  if (status === "PENDING" && isSent) {
    return (
      <Button variant="outline" disabled size="sm">
        <Clock className="h-4 w-4 mr-2" />
        Pending
      </Button>
    );
  }

  if (status === "PENDING" && !isSent) {
    return (
      <Button onClick={handleAcceptRequest} disabled={isLoading} size="sm">
        <UserCheck className="h-4 w-4 mr-2" />
        Accept
      </Button>
    );
  }

  if (status === "ACCEPTED") {
    return (
      <Button
        variant="outline"
        onClick={handleRemoveConnection}
        disabled={isLoading}
        size="sm"
      >
        <UserMinus className="h-4 w-4 mr-2" />
        Connected
      </Button>
    );
  }

  return null;
}
