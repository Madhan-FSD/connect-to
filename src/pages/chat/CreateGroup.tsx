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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { chatApi } from "@/lib/api/chat.api";
import { useConversationStore } from "@/store/ConversationStore";

interface Props {
  onClose: () => void;
  onCreated: (conversation: any) => void;
}

export default function CreateGroup({ onClose, onCreated }: Props) {
  const addConversation = useConversationStore(
    (state) => state.addConversation
  );
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["users-list"],
    queryFn: () => chatApi.listUsers(),
  });

  const createMutation = useMutation({
    mutationFn: () => chatApi.createGroupConversation(groupName, selectedUsers),
    onSuccess: (data) => {
      addConversation(data.conversation);
      onCreated(data.conversation);
    },
  });

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const users = data?.users || [];
  const isValid = groupName.trim().length > 0 && selectedUsers.length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Group Chat</CardTitle>
        <CardDescription>Add a name and select members</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Group Name</label>
          <Input
            placeholder="Enter group name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="ds-pill-input"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Select Members ({selectedUsers.length})
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
            {isLoading ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded" />
                ))}
              </>
            ) : users.length > 0 ? (
              users.map((user: any) => (
                <label
                  key={user._id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/6 transition cursor-pointer"
                >
                  <Checkbox
                    checked={selectedUsers.includes(user._id)}
                    onCheckedChange={() => handleToggleUser(user._id)}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.firstName?.slice(0, 1)}
                      {user.lastName?.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                </label>
              ))
            ) : (
              <p className="text-center text-muted-foreground text-sm py-4">
                No users available
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!isValid || createMutation.isPending}
            className="flex-1"
          >
            {createMutation.isPending ? "Creating..." : "Create Group"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
