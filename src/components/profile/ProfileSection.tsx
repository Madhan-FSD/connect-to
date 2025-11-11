import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { userApi, childApi } from "@/lib/api";
import { toast } from "sonner";

type FieldDef = {
  label: string;
  key: string;
  type?: "text" | "textarea" | "date";
};
type ProfileSectionProps = {
  title: string;
  icon?: any;
  fields: FieldDef[];
  data: any[];
  childId?: string | null;
  userToken: string;
  fetchProfileData: () => Promise<void>;
  canEdit?: boolean;
};

const sectionMethodMap: Record<
  string,
  {
    user: { add: string; update: string; remove: string };
    child: { add: string; update: string; remove: string } | null;
  }
> = {
  skills: {
    user: { add: "add", update: "update", remove: "remove" },
    child: { add: "addSkill", update: "updateSkill", remove: "removeSkill" },
  },
  interests: {
    user: { add: "add", update: "update", remove: "remove" },
    child: {
      add: "addInterest",
      update: "updateInterest",
      remove: "removeInterest",
    },
  },
  certifications: {
    user: { add: "add", update: "update", remove: "remove" },
    child: {
      add: "addCertification",
      update: "updateCertification",
      remove: "removeCertification",
    },
  },
  achievements: {
    user: { add: "add", update: "update", remove: "remove" },
    child: {
      add: "addAchievement",
      update: "updateAchievement",
      remove: "removeAchievement",
    },
  },
  projects: {
    user: { add: "add", update: "update", remove: "remove" },
    child: {
      add: "addProject",
      update: "updateProject",
      remove: "removeProject",
    },
  },
  educations: {
    user: { add: "add", update: "update", remove: "remove" },
    child: {
      add: "addEducation",
      update: "updateEducation",
      remove: "removeEducation",
    },
  },
  experiences: {
    user: { add: "add", update: "update", remove: "remove" },
    child: null,
  },

  addresses: {
    user: { add: "add", update: "update", remove: "remove" },
    child: null,
  },
};

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  title,
  icon: Icon,
  fields,
  data,
  childId = null,
  userToken,
  fetchProfileData,
  canEdit = true,
}) => {
  const key =
    title === "Education" ? `${title?.toLowerCase()}s` : title.toLowerCase();
  const map = sectionMethodMap[key];
  const [adding, setAdding] = useState(false);
  const [addPayload, setAddPayload] = useState<Record<string, any>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPayload, setEditPayload] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const callApi = async (
    action: "add" | "update" | "remove",
    id?: string,
    payload?: any
  ) => {
    const token = userToken;
    const section = sectionMethodMap[key];

    if (!section) throw new Error(`Unsupported section ${key}`);

    try {
      if (childId) {
        if (!section.child)
          throw new Error(`Child API does not support ${key}`);
        const method = (section.child as any)[action];
        if (!method) throw new Error(`No child method for ${action} ${key}`);
        const client = childApi.profile as any;
        if (action === "add")
          return await client[method](childId, payload, token);
        if (action === "update")
          return await client[method](childId, id, payload, token);
        if (action === "remove")
          return await client[method](childId, id, token);
      } else {
        const client = (userApi.profile as any)[key];
        if (!client) throw new Error(`User API missing ${key}`);
        const method = (section.user as any)[action];
        if (!method) throw new Error(`No user method for ${action} ${key}`);
        if (action === "add") return await client[method](payload, token);
        if (action === "update")
          return await client[method](id, payload, token);
        if (action === "remove") return await client[method](id, token);
      }
    } catch (err: any) {
      console.error("API Error:", err);
      throw err;
    }
  };

  const onAddSubmit = async () => {
    const payload = Object.fromEntries(
      fields.map((f) => [f.key, addPayload[f.key] ?? ""])
    );
    setSaving(true);
    try {
      await callApi("add", undefined, payload);
      toast.success(`${title.slice(0, -1)} added`);
      setAdding(false);
      setAddPayload({});
      await fetchProfileData();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to add ${title.slice(0, -1)}`);
    } finally {
      setSaving(false);
    }
  };

  const onEditStart = (item: any) => {
    setEditingId(item._id || item.id || String(Math.random()));
    const p: Record<string, any> = {};

    fields.forEach((f) => (p[f.key] = item[f.key] ?? ""));

    if (key === "skills" && item.endorsements !== undefined) {
      p.endorsements = item.endorsements;
    }

    setEditPayload(p);
  };

  const onEditCancel = () => {
    setEditingId(null);
    setEditPayload({});
  };

  const onEditSave = async (itemId: string) => {
    const payload = Object.fromEntries(
      fields.map((f) => [f.key, editPayload[f.key] ?? ""])
    );
    setSaving(true);
    try {
      await callApi("update", itemId, payload);
      toast.success(`${title.slice(0, -1)} updated`);
      setEditingId(null);
      setEditPayload({});
      await fetchProfileData();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to update ${title.slice(0, -1)}`);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (itemId: string) => {
    if (!confirm("Confirm delete?")) return;
    setSaving(true);
    try {
      await callApi("remove", itemId);
      toast.success(`${title.slice(0, -1)} removed`);
      await fetchProfileData();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to delete ${title.slice(0, -1)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="rounded-xl border border-slate-100 shadow-sm">
      <CardHeader className="flex items-center flex-row justify-between">
        <div className="flex items-center gap-2 text-lg">
          {Icon && <Icon className="h-5 w-5 text-primary" />}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={adding ? "outline" : "default"}
              onClick={() => setAdding(!adding)}
            >
              {adding ? (
                <>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </>
              )}
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3 text-left">
        {adding && (
          <div className="p-3 rounded-md bg-muted/30 space-y-2">
            {fields.map((f) =>
              f.type === "textarea" ? (
                <Textarea
                  key={f.key}
                  placeholder={f.label}
                  value={addPayload[f.key] || ""}
                  onChange={(e) =>
                    setAddPayload({ ...addPayload, [f.key]: e.target.value })
                  }
                />
              ) : (
                <Input
                  key={f.key}
                  placeholder={f.label}
                  value={addPayload[f.key] || ""}
                  onChange={(e) =>
                    setAddPayload({ ...addPayload, [f.key]: e.target.value })
                  }
                />
              )
            )}
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                onClick={() => {
                  setAdding(false);
                  setAddPayload({});
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button size="sm" onClick={onAddSubmit} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        )}

        {(!data || data.length === 0) && !adding && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No {title.toLowerCase()} added yet.
          </p>
        )}

        {data?.map((item: any) => {
          const id = item._id || item.id;
          const isEditing = editingId === id;
          return (
            <div
              key={id}
              className="flex items-start gap-4 p-3 bg-muted/10 rounded-md"
            >
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    {key === "skills" &&
                      item.endorsements !== undefined &&
                      item.endorsements > 0 && (
                        <div className="pb-1">
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {item.endorsements} Endorsement
                            {item.endorsements !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    {fields.map((f) =>
                      f.type === "textarea" ? (
                        <Textarea
                          key={f.key}
                          value={editPayload[f.key] || ""}
                          onChange={(e) =>
                            setEditPayload({
                              ...editPayload,
                              [f.key]: e.target.value,
                            })
                          }
                          placeholder={f.label}
                        />
                      ) : (
                        <Input
                          key={f.key}
                          value={editPayload[f.key] || ""}
                          onChange={(e) =>
                            setEditPayload({
                              ...editPayload,
                              [f.key]: e.target.value,
                            })
                          }
                          placeholder={f.label}
                        />
                      )
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {fields.map((f) =>
                      item[f.key] ? (
                        <div
                          key={f.key}
                          className={`text-sm text-foreground ${
                            f.key === "name" ? "font-semibold text-base" : ""
                          }`}
                        >
                          {f.type === "date"
                            ? new Date(item[f.key]).toLocaleDateString()
                            : String(item[f.key])}
                        </div>
                      ) : null
                    )}

                    {key === "skills" &&
                      item.endorsements !== undefined &&
                      item.endorsements > 0 && (
                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {item.endorsements} Endorsement
                            {item.endorsements !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                {isEditing ? (
                  <>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onEditCancel}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onEditSave(id)}
                        disabled={saving}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditStart(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ProfileSection;
