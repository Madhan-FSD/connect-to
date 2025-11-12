import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, Bookmark } from "lucide-react";

interface ProfileCardProps {
  id?: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  handle?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  connections?: number | null;
  joinedDate?: string | null;
  isConnected?: boolean | null;
  onConnect?: (id: string) => void;
  onMessage?: (id: string) => void;
  onLike?: (id: string) => void;
  onSave?: (id: string) => void;
}

export function ProfileCard({
  id = "",
  name,
  firstName,
  lastName,
  handle = "user",
  bio,
  avatarUrl,
  connections = 0,
  joinedDate,
  isConnected = false,
  onConnect,
  onMessage,
  onLike,
  onSave,
}: ProfileCardProps) {
  const safeName =
    name?.trim() ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    "Unknown User";

  const initials =
    safeName
      ?.split(" ")
      .filter(Boolean)
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2) || "U";

  const safeHandle =
    typeof handle === "string" && handle.trim().length > 0
      ? handle.replace("@", "")
      : "user";

  const safeBio =
    typeof bio === "string" && bio.trim().length > 0
      ? bio
      : "No bio available.";

  const connectionCount =
    typeof connections === "number" && connections >= 0 ? connections : 0;

  const safeJoinedDate =
    typeof joinedDate === "string" && joinedDate.trim().length > 0
      ? joinedDate
      : "";

  const safeId = id || "";

  return (
    <Card className="w-full max-w-sm mx-auto border border-gray-200 shadow-sm rounded-2xl bg-white hover:shadow-md transition-all">
      <CardContent className="p-6 flex flex-col items-center text-center">
        {/* Avatar */}
        <Avatar className="h-24 w-24 border-4 border-gray-100 shadow-md mb-4">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={safeName} />
          ) : (
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Name & Handle */}
        <h2 className="text-xl font-bold text-gray-900">{safeName}</h2>
        <p className="text-sm text-gray-500">@{safeHandle}</p>

        {/* Bio */}
        <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-3 max-w-xs">
          {safeBio}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 text-xs text-gray-500 mt-4">
          <p>
            <span className="font-semibold">{connectionCount}</span>{" "}
            {connectionCount === 1 ? "Connection" : "Connections"}
          </p>

          {safeJoinedDate && (
            <>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <p>Joined {safeJoinedDate}</p>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-5">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-9 w-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => safeId && onLike?.(safeId)}
          >
            <Heart className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-9 w-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => safeId && onSave?.(safeId)}
          >
            <Bookmark className="h-4 w-4" />
          </Button>

          {isConnected ? (
            <Button
              onClick={() => safeId && onMessage?.(safeId)}
              className="rounded-full h-9 px-6 bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              Message
            </Button>
          ) : (
            <Button
              onClick={() => safeId && onConnect?.(safeId)}
              className="rounded-full h-9 px-6 bg-gray-900 text-white hover:bg-gray-800"
            >
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
