import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Video, Type } from "lucide-react";
import { toast } from "sonner";
import { getAuth } from "@/lib/auth";
import { postApi } from "@/lib/api";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postTarget: "profile" | "channel";
  channelId?: string;
  onPostCreated?: () => void;
}

export function CreatePostModal({
  open,
  onOpenChange,
  postTarget,
  channelId,
  onPostCreated,
}: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("text");

  const user = getAuth();

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = type === "video" ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(
        `File too large. Max size: ${type === "video" ? "100MB" : "5MB"}`
      );
      return;
    }

    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!content.trim() && !mediaFile) {
      toast.error("Please add content or media");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (title) formData.append("title", title);
      formData.append("postTarget", postTarget.toUpperCase());
      if (channelId) formData.append("channelId", channelId);
      if (mediaFile) formData.append("media", mediaFile);

      await postApi.create(formData, user!.token, postTarget);

      toast.success("Post created successfully!");
      setContent("");
      setTitle("");
      setMediaFile(null);
      setMediaPreview(null);
      onOpenChange(false);
      onPostCreated?.();
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Image
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Video
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <Input
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </TabsContent>

          <TabsContent value="image" className="space-y-4">
            <Input
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Add a caption..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "image")}
            />
            {mediaPreview && (
              <div className="max-h-[300px] overflow-hidden rounded-lg border">
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            <Input
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Add a description..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileChange(e, "video")}
            />
            {mediaPreview && (
              <div className="max-h-[300px] overflow-hidden rounded-lg border">
                <video
                  src={mediaPreview}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
