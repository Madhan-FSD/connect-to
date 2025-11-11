import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getAuth } from "@/lib/auth";
import { toast } from "sonner";
import { UserPlus, UserCheck } from "lucide-react";
import { followerApi } from "@/lib/api";

interface FollowButtonProps {
  entityId: string;
  entityType: "USER" | "USER_CHANNEL" | "CHILD_CHANNEL";
  onUpdate?: () => void;
}

export function FollowButton({
  entityId,
  entityType,
  onUpdate,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const user = getAuth();

  const fetchFollowStatus = async () => {
    if (!user) return;
    try {
      const response = await followerApi.checkStatus(
        entityId,
        entityType,
        user.token
      );
      setIsFollowing(response.isFollowing);
    } catch (error) {
      console.error("Failed to fetch follow status:", error);
    }
  };

  useEffect(() => {
    fetchFollowStatus();
  }, [entityId, entityType]);

  const handleFollow = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      if (isFollowing) {
        await followerApi.unfollow(entityId, entityType, user.token);
        toast.success("Unfollowed successfully");
        setIsFollowing(false);
      } else {
        await followerApi.follow(entityId, entityType, user.token);
        toast.success("Following!");
        setIsFollowing(true);
      }
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.error || "Failed to update follow status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFollow}
      disabled={isLoading}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
    >
      {isFollowing ? (
        <>
          <UserCheck className="h-4 w-4 mr-2" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}
