import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { chatApi } from "@/lib/api/chat.api";
import { useConversationStore } from "@/store/ConversationStore";

interface Props {
  onClose: () => void;
  onCreated: (conversation: any) => void;
}

const CreateDirect = ({ onClose, onCreated }: Props) => {
  const addConversation = useConversationStore(
    (state) => state.addConversation
  );
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["users-list", searchTerm],
    queryFn: () => chatApi.listUsers(searchTerm),
  });

  const createMutation = useMutation({
    mutationFn: (otherUserId: string) =>
      chatApi.createDirectConversation(otherUserId),
    onSuccess: (data) => {
      addConversation(data.conversation);
      onCreated(data.conversation);
    },
  });

  const users = data?.users || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Start Direct Message</CardTitle>
        <CardDescription>Select a user to start chatting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isLoading}
          autoFocus
          className="ds-pill-input"
        />
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {isLoading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </>
          ) : users.length > 0 ? (
            users.map((user: any) => (
              <button
                key={user._id}
                onClick={() => createMutation.mutate(user._id)}
                disabled={createMutation.isPending}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/40 transition text-left"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user.avatar?.url}
                    alt={`${user.firstName} avatar`}
                  />
                  <AvatarFallback>
                    {user.firstName?.slice(0, 1)}
                    {user.lastName?.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <p className="text-center text-muted-foreground text-sm py-4">
              No users found
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateDirect;
