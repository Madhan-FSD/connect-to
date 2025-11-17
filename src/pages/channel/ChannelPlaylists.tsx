import React, { useEffect, useState } from "react";
import { channelplaylistApi } from "@/lib/api";
import { getAuth } from "@/lib/auth";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";

export default function ChannelPlaylists({ isOwner }) {
  const auth = getAuth();

  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [createName, setCreateName] = useState("");
  const [createVisibility, setCreateVisibility] = useState("PUBLIC");

  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    name: "",
    description: "",
    playlistVisibility: "PUBLIC",
  });

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const resp = await channelplaylistApi.getMyPlaylists(auth.token);
      setPlaylists(resp.playlists || []);
    } catch (err) {
      console.error("loadPlaylists:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  const createPlaylist = async () => {
    if (!createName.trim()) return;

    try {
      await channelplaylistApi.create(
        {
          name: createName,
          description: "",
          playlistVisibility: createVisibility,
        },
        auth.token
      );
      setCreateName("");
      setCreateVisibility("PUBLIC");
      loadPlaylists();
    } catch (err: any) {
      console.log("error", err);
    }
  };

  const deletePlaylist = async (id: string) => {
    if (!confirm("Delete this playlist?")) return;

    try {
      await channelplaylistApi.delete(id, auth.token);
      loadPlaylists();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const startEdit = (playlist: any) => {
    setEditing(playlist._id);
    setEditData({
      name: playlist.name,
      description: playlist.description || "",
      playlistVisibility: playlist.playlistVisibility || "PUBLIC",
    });
  };

  const saveChanges = async () => {
    try {
      await channelplaylistApi.update(editing as string, editData, auth.token);
      setEditing(null);
      loadPlaylists();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Create Playlist</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Input
              placeholder="Playlist name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
            />

            <Select
              value={createVisibility}
              onValueChange={(v) => setCreateVisibility(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">Public (Free)</SelectItem>
                <SelectItem value="PRIVATE">Private</SelectItem>
                <SelectItem value="SUBSCRIBERS_ONLY">
                  Subscribers Only
                </SelectItem>
                <SelectItem value="PAID_ONLY">Paid Only</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={createPlaylist} className="flex gap-2">
              Create
            </Button>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>{isOwner ? "Your Playlists" : "Playlists"}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {!loading && playlists.length === 0 && (
            <div className="text-gray-400 text-center py-6">
              No playlists yet.
            </div>
          )}

          {!loading &&
            playlists.map((p: any) => (
              <div
                key={p._id}
                className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-900
                         flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold">{p.name}</div>

                  <div className="text-xs text-gray-500">
                    {p.videos?.length || 0} videos • {p.playlistVisibility}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEdit(p)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deletePlaylist(p._id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      {editing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Playlist</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Input
                placeholder="Name"
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
              />

              <Input
                placeholder="Description"
                value={editData.description}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
              />

              <Select
                value={editData.playlistVisibility}
                onValueChange={(v) =>
                  setEditData({ ...editData, playlistVisibility: v })
                }
              >
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

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button onClick={saveChanges}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
