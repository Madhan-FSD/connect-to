import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getAuth } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { postApi } from "@/lib/api";

interface Post {
  _id: string;
  ownerId: { _id: string; username?: string; email?: string };
  title?: string;
  content: string;
  mediaUrl?: string;
  contentType: "TEXT" | "IMAGE" | "VIDEO";
  likeCount: number;
  commentsCount: number;
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  onDelete?: () => void;
}

export function PostCard({ post, onDelete }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const user = getAuth();

  const handleLike = async () => {
    try {
      const response = await postApi.toggleLike(post._id, user!.token);
      setIsLiked(response.isLiked);
      setLikeCount(response.likeCount);
    } catch (error) {
      toast.error("Failed to like post");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await postApi.delete(post._id, user!.token);
      toast.success("Post deleted");
      onDelete?.();
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const canDelete =
    user?.userId === post?.ownerId?._id || user?.role === "PARENT";

  return (
    <Card className="w-full border border-gray-200 rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4 border-b border-gray-100">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-blue-500 text-white font-bold">
            {(post?.ownerId?.username ||
              post?.ownerId?.email ||
              "U")[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          {" "}
          <p className="font-bold truncate text-gray-800">
            {post?.ownerId?.username || post?.ownerId?.email}
          </p>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="text-red-500 hover:bg-red-50 hover:text-red-700 rounded-full"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        {post.title && (
          <h3 className="font-extrabold text-xl text-gray-900">{post.title}</h3>
        )}

        {post.content && (
          <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {post.content}
          </p>
        )}

        {post.contentType === "IMAGE" && post.mediaUrl && (
          <div className="max-h-96 overflow-hidden rounded-lg">
            <img
              src={post.mediaUrl}
              alt={post.title || "Post image"}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {post.contentType === "VIDEO" && post.mediaUrl && (
          <div className="max-h-96 overflow-hidden rounded-lg">
            <video
              src={post.mediaUrl}
              controls
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-4 p-4 border-t border-gray-100">
        <Button
          variant={isLiked ? "default" : "secondary"}
          size="sm"
          onClick={handleLike}
          className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-200 ${
            isLiked
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          <Heart
            className={`h-4 w-4 ${
              isLiked
                ? "fill-white text-white"
                : "fill-transparent text-gray-500"
            }
    `}
          />
          {likeCount}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          <MessageCircle className="h-4 w-4 text-gray-500" />
          <span className="font-semibold">{post.commentsCount}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
