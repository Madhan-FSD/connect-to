import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import {
  UploadCloud,
  Image as ImageIcon,
  VideoIcon,
  FileText,
} from "lucide-react";

import {
  channelpostsApi,
  channelvideosApi,
  channelplaylistApi,
} from "@/lib/api";
import { DialogTitle } from "@radix-ui/react-dialog";

export default function UploadModal({
  open,
  onClose,
  channelId,
  authToken,
  onUploaded,
  mode = "video",
}) {
  const [uploadTarget, setUploadTarget] = useState<"CHANNEL">("CHANNEL");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");

  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState("NONE");

  const [isLoading, setLoading] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setVisibility("PUBLIC");
    setFile(null);
    setThumbnail(null);
    setSelectedPlaylist("NONE");
    setUploadTarget("CHANNEL");
  };

  useEffect(() => {
    if (!open) reset();
    if (open && uploadTarget === "CHANNEL") loadPlaylists();
  }, [open, uploadTarget]);

  const loadPlaylists = async () => {
    try {
      const resp = await channelplaylistApi.getMyPlaylists(authToken);
      setPlaylists(resp.playlists || []);
    } catch (err) {
      console.error("Failed to load playlists:", err);
    }
  };

  const submit = async () => {
    if (!title.trim()) return alert("Title is required.");
    setLoading(true);

    try {
      if (mode === "post") {
        const form = new FormData();
        form.append("postTarget", "CHANNEL");
        form.append("channelId", channelId);
        form.append("title", title);
        form.append("content", description);
        form.append("visibility", visibility);
        if (file) form.append("media", file);

        await channelpostsApi.create(form, authToken);
        onUploaded?.();
        onClose();
        return;
      }

      if (!file) return alert("Please upload a video file.");

      const form = new FormData();
      form.append("contentType", "VIDEO_CHANNEL");
      form.append("title", title);
      form.append("description", description);
      form.append("visibility", visibility);
      form.append("video", file);

      if (uploadTarget === "CHANNEL") {
        form.append("channelId", channelId);
        form.append("channelType", "UserChannel");
      }

      if (thumbnail) form.append("thumbnail", thumbnail);

      const resp = await channelvideosApi.upload(form, authToken);
      const videoId = resp?.video?._id;

      if (
        uploadTarget === "CHANNEL" &&
        videoId &&
        selectedPlaylist !== "NONE"
      ) {
        await channelplaylistApi.addVideo(selectedPlaylist, videoId, authToken);
      }

      onUploaded?.();
      onClose();
    } catch (err: any) {
      alert(err.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>
          <h2 className="text-xl font-bold flex items-center gap-2">
            {mode === "video" ? (
              <>
                <VideoIcon className="w-5" /> Upload Video
              </>
            ) : (
              <>
                <FileText className="w-5" /> Create Post
              </>
            )}
          </h2>
        </DialogTitle>
        <div className="p-6 bg-white dark:bg-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <Input
                placeholder="Title (required)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Textarea
                placeholder="Description (optional)"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Visibility
              </label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger>
                  <SelectValue placeholder="Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                  <SelectItem value="SUBSCRIBERS_ONLY">
                    Subscribers Only
                  </SelectItem>
                  <SelectItem value="PAID_ONLY">Paid Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === "video" && uploadTarget === "CHANNEL" && (
              <div>
                <label className="text-sm block mb-1">Add to Playlist</label>
                <Select
                  value={selectedPlaylist}
                  onValueChange={setSelectedPlaylist}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select playlist" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    {playlists.map((pl) => (
                      <SelectItem key={pl._id} value={pl._id}>
                        {pl.name} — {pl.playlistVisibility}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="text-sm block mb-2">
                {mode === "video" ? "Upload Video File" : "Upload Media"}
              </label>

              <div
                className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                onClick={() => document.getElementById("uploadMain")?.click()}
              >
                {!file ? (
                  <>
                    <UploadCloud className="w-10 h-10 text-gray-500" />
                    <p className="text-xs mt-2 text-gray-600">
                      Click to upload {mode === "video" ? "video" : "media"}
                    </p>
                  </>
                ) : (
                  <p className="text-green-500 text-sm">{file.name} ✓</p>
                )}
              </div>

              <input
                id="uploadMain"
                type="file"
                className="hidden"
                accept={mode === "video" ? "video/*" : "image/*,video/*"}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            {mode === "video" && (
              <div className="md:col-span-1">
                <label className="text-sm block mb-1">
                  Thumbnail (optional)
                </label>
                <div
                  className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  onClick={() =>
                    document.getElementById("uploadThumbnail")?.click()
                  }
                >
                  {!thumbnail ? (
                    <>
                      <ImageIcon className="w-8 h-8 text-gray-500" />
                      <p className="text-xs mt-2 text-gray-600">
                        Upload thumbnail
                      </p>
                    </>
                  ) : (
                    <p className="text-green-500 text-sm">{thumbnail.name} ✓</p>
                  )}
                </div>

                <input
                  id="uploadThumbnail"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={isLoading} onClick={submit}>
              {isLoading
                ? "Processing..."
                : mode === "video"
                ? "Upload Video"
                : "Publish Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
