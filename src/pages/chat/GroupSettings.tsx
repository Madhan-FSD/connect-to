import { useState, useEffect } from "react";
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
  groupId: string | null;
  onClose: () => void;
}

export default function GroupSettings({ groupId, onClose }: Props) {
  const conversations = useConversationStore((state) => state.conversations);
  const updateConversation = useConversationStore(
    (state) => state.updateConversation
  );

  const conversation = conversations.find((c) => c._id === groupId);

  const [groupName, setGroupName] = useState(conversation?.title || "");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["users-list"],
    queryFn: () => chatApi.listUsers(),
  });

  const { data: groupData } = useQuery({
    queryKey: ["conversation", groupId],
    queryFn: () => chatApi.getConversation(groupId!),
    enabled: !!groupId,
  });

  useEffect(() => {
    if (groupData?.conversation?.title)
      setGroupName(groupData.conversation.title);
  }, [groupData]);

  const renameMutation = useMutation({
    mutationFn: () => chatApi.renameConversation(groupId!, groupName),
    onSuccess: () => updateConversation(groupId!, { title: groupName }),
  });

  const updateMembersMutation = useMutation({
    mutationFn: (action: "add" | "remove") =>
      chatApi.addRemoveGroupMembers(groupId!, selectedUsers, action),
  });

  const leaveMutation = useMutation({
    mutationFn: () => chatApi.leaveGroup(groupId!),
    onSuccess: () => onClose(),
  });

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((u) => u !== userId)
        : [...prev, userId]
    );
  };

  const users = data?.users || [];
  const currentMembers =
    conversation?.participants?.map((p: any) =>
      typeof p.userId === "string" ? p.userId : p.userId._id
    ) || [];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="ds-card">
        <CardHeader>
          <CardTitle>Group Settings</CardTitle>
          <CardDescription>{conversation?.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Group Name</label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="ds-pill-input"
            />
            <Button
              onClick={() => renameMutation.mutate()}
              disabled={renameMutation.isPending}
              className="w-full"
            >
              {renameMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Current Members ({currentMembers.length})
            </label>
            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto bg-muted/10">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-10" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {users
                    .filter((u: any) => currentMembers.includes(u._id))
                    .map((user: any) => (
                      <div
                        key={user._id}
                        className="flex items-center gap-3 p-2 rounded"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user.firstName?.slice(0, 1)}
                            {user.lastName?.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm flex-1">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Add Members</label>
            <div className="space-y-2 border rounded-lg p-4 max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-10" />
                  ))}
                </div>
              ) : (
                users
                  .filter((u: any) => !currentMembers.includes(u._id))
                  .map((user: any) => (
                    <label
                      key={user._id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-accent/6 transition cursor-pointer"
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
                      <span className="text-sm flex-1">
                        {user.firstName} {user.lastName}
                      </span>
                    </label>
                  ))
              )}
            </div>
            <Button
              onClick={() => updateMembersMutation.mutate("add")}
              disabled={
                selectedUsers.length === 0 || updateMembersMutation.isPending
              }
              variant="outline"
              className="w-full"
            >
              {updateMembersMutation.isPending
                ? "Adding..."
                : "Add Selected Members"}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={() => leaveMutation.mutate()}
              disabled={leaveMutation.isPending}
              className="flex-1"
            >
              {leaveMutation.isPending ? "Leaving..." : "Leave Group"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
