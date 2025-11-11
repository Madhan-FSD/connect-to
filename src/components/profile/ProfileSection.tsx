import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { userApi, childApi } from "@/lib/api";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

const ButtonGroup = ({ options, value, onValueChange, label }) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex space-x-2">
        {options.map((option) => (
          <Button
            key={option}
            size="sm"
            type="button"
            variant={value === option ? "default" : "outline"}
            onClick={() => onValueChange(option)}
            className="flex-1"
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
};

const PrimaryAddressToggle = ({ value, onValueChange }) => {
  const isChecked = !!value;
  return (
    <div className="flex items-center justify-between p-3 border rounded-md bg-white shadow-sm">
      <div className="flex items-center">
        <span
          className={`h-2.5 w-2.5 rounded-full mr-2 ${
            isChecked ? "bg-green-500" : "bg-gray-400"
          }`}
        />
        <Label
          htmlFor="primary-address-switch"
          className="font-semibold text-sm"
        >
          {isChecked ? "Primary Address" : "Mark as Primary"}
        </Label>
      </div>
      <Switch
        id="primary-address-switch"
        checked={isChecked}
        onCheckedChange={onValueChange}
        className="data-[state=checked]:bg-green-600"
      />
    </div>
  );
};

type FieldDef = {
  label: string;
  key: string;
  type?: "text" | "textarea" | "date" | "boolean" | "buttonGroup";
  options?: string[];
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

const ProfileSection: React.FC<ProfileSectionProps> = ({
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
    title === "Education" ? `${title.toLowerCase()}s` : title.toLowerCase();
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

  const cleanPayload = (payload: Record<string, any>): Record<string, any> => {
    const cleaned: Record<string, any> = {};
    fields.forEach((f) => {
      let value = payload[f.key];

      if (f.type === "boolean") {
        value = !!value;
      } else if (f.type === "date" && value) {
        value = new Date(value);
      } else if (
        (f.type === "buttonGroup" ||
          f.type === "text" ||
          f.type === "textarea") &&
        typeof value === "string"
      ) {
        value = value.trim();
      }

      if (value !== null && value !== undefined && value !== "") {
        cleaned[f.key] = value;
      }
    });

    fields
      .filter((f) => f.type === "boolean")
      .forEach((f) => {
        if (f.key in payload) {
          cleaned[f.key] = !!payload[f.key];
        }
      });

    return cleaned;
  };

  const onAddSubmit = async () => {
    const payload = cleanPayload(addPayload);
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

    fields.forEach((f) => {
      let value = item[f.key] ?? "";

      if (f.type === "date" && value) {
        value = new Date(value).toISOString().split("T")[0];
      }

      p[f.key] = value;
    });

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
    const payload = cleanPayload(editPayload);

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
    if (!window.confirm("Confirm delete?")) return;
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

  const renderFieldInput = (
    f: FieldDef,
    payload: Record<string, any>,
    setPayload: (p: Record<string, any>) => void
  ) => {
    const inputId = `input-${f.key}-${key}-${editingId || "new"}`;
    const value = payload[f.key];
    const setValue = (val: any) => setPayload({ ...payload, [f.key]: val });

    if (f.type === "textarea") {
      return (
        <div key={f.key} className="space-y-1">
          <Label htmlFor={inputId}>{f.label}</Label>
          <Textarea
            id={inputId}
            placeholder={f.label}
            value={value || ""}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
      );
    }

    if (f.type === "buttonGroup" && f.options) {
      return (
        <ButtonGroup
          key={f.key}
          label={f.label}
          options={f.options}
          value={value || f.options[0]}
          onValueChange={setValue}
        />
      );
    }

    if (f.type === "boolean") {
      if (f.key === "isPrimary") {
        return (
          <PrimaryAddressToggle
            key={f.key}
            value={value}
            onValueChange={setValue}
          />
        );
      }
      return (
        <div key={f.key} className="space-y-1">
          <div className="flex items-center space-x-2 p-2 border rounded-md bg-white shadow-sm justify-between">
            <Label
              htmlFor={`switch-${f.key}-${key}`}
              className="font-medium text-sm"
            >
              {f.label}
            </Label>
            <Switch
              id={`switch-${f.key}-${key}`}
              checked={!!value}
              onCheckedChange={(checked) => setValue(checked)}
            />
          </div>
        </div>
      );
    }

    return (
      <div key={f.key} className="space-y-1">
        <Label htmlFor={inputId}>{f.label}</Label>
        <Input
          id={inputId}
          placeholder={f.label}
          type={f.type || "text"}
          value={value || ""}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    );
  };

  const renderReadOnlyFields = (item: any) => {
    // Determine the primary field: 'title' (Experience), 'name' (Project/Cert), or 'fieldOfStudy' (Education)
    let primaryField = fields.find(
      (f) => f.key === "title" || f.key === "name"
    );

    // Custom logic to promote 'fieldOfStudy' to primary display for Education section
    if (key === "educations") {
      const fieldOfStudyField = fields.find((f) => f.key === "fieldOfStudy");
      if (fieldOfStudyField && item.fieldOfStudy) {
        primaryField = fieldOfStudyField;
      } else if (!primaryField) {
        // Fallback to 'institution' if fieldOfStudy is empty or not found,
        // and no other primary field exists (though it won't be excluded below)
        primaryField = fields.find((f) => f.key === "institution");
      }
    }

    const startDateField = fields.find((f) => f.key === "startDate");
    const endDateField = fields.find((f) => f.key === "endDate");

    const needsHeaderLayout =
      key === "experiences" ||
      key === "educations" ||
      key === "projects" ||
      key === "certifications" ||
      key === "achievements" ||
      key === "interests";

    return (
      <div className="space-y-2 w-full">
        {needsHeaderLayout ? (
          <div className="flex justify-between items-start pb-1">
            <div className="text-lg font-semibold text-foreground max-w-[70%]">
              {primaryField && item[primaryField.key]
                ? String(item[primaryField.key])
                : ""}
            </div>

            {(startDateField || endDateField) && (
              <div className="text-sm text-right text-muted-foreground min-w-[30%]">
                <span className="font-medium">
                  {startDateField && item[startDateField.key]
                    ? new Date(item[startDateField.key]).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "short" }
                      )
                    : ""}
                </span>
                {(startDateField && item[startDateField.key]) ||
                (endDateField &&
                  (item[endDateField.key] || item[endDateField.key] === null))
                  ? " - "
                  : ""}
                <span className="font-medium">
                  {endDateField
                    ? item[endDateField.key]
                      ? new Date(item[endDateField.key]).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short" }
                        )
                      : item[endDateField.key] === null
                      ? "Present"
                      : ""
                    : ""}
                </span>
              </div>
            )}
          </div>
        ) : (
          primaryField &&
          item[primaryField.key] && (
            <div className="text-lg font-semibold text-foreground pb-1">
              {String(item[primaryField.key])}
            </div>
          )
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {fields
            .filter(
              (f) =>
                f.key !== primaryField?.key && // Exclude the determined primary field
                f.key !== "startDate" &&
                f.key !== "endDate"
            )
            .map((f) => {
              let displayValue = item[f.key];

              if (
                displayValue === null ||
                displayValue === undefined ||
                displayValue === ""
              ) {
                if (f.type === "boolean" && displayValue === false) return null;
                return null;
              }

              if (f.type === "boolean") {
                displayValue = item[f.key] ? "Yes" : "No";
              } else if (f.type === "date" && displayValue) {
                displayValue = new Date(displayValue).toLocaleDateString();
              }

              const valueClassName =
                f.type === "textarea"
                  ? "whitespace-pre-wrap col-span-2"
                  : "text-foreground";

              if (f.type === "textarea") {
                return (
                  <div key={f.key} className="col-span-full pt-2">
                    <p className="font-medium text-muted-foreground">
                      {f.label}
                    </p>
                    <p className="text-foreground whitespace-pre-wrap">
                      {String(displayValue)}
                    </p>
                  </div>
                );
              }

              return (
                <div key={f.key} className="flex flex-col">
                  <span className="font-medium text-muted-foreground">
                    {f.label}
                  </span>
                  <span className={valueClassName}>{String(displayValue)}</span>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  return (
    <Card className="rounded-xl border border-slate-100 shadow-sm">
      <CardHeader className="flex items-center flex-row justify-between">
        <div className="flex items-center gap-2 text-lg">
          {Icon && <Icon className="h-5 w-5 text-primary" />}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-left">
        {adding && (
          <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200 space-y-3">
            {fields.map((f) => renderFieldInput(f, addPayload, setAddPayload))}
            <div className="flex gap-2 justify-end pt-2">
              <Button
                size="sm"
                onClick={() => {
                  setAdding(false);
                  setAddPayload({});
                }}
                variant="outline"
              >
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button size="sm" onClick={onAddSubmit} disabled={saving}>
                <Check className="h-4 w-4 mr-1" />{" "}
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        )}

        {data?.map((item: any) => {
          const id = item._id || item.id;
          const isEditing = editingId === id;
          return (
            <div
              key={id}
              className="relative p-4 bg-white border border-gray-100 rounded-lg shadow-sm transition-all duration-200"
            >
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                {isEditing ? (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-gray-500 hover:text-red-500"
                      onClick={onEditCancel}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="default"
                      className="h-7 w-7"
                      onClick={() => onEditSave(id)}
                      disabled={saving}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-gray-500 hover:text-primary"
                      onClick={() => onEditStart(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-gray-500 hover:text-red-500"
                      onClick={() => onDelete(id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              <div className="pr-16">
                {isEditing ? (
                  <div className="space-y-3">
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
                      renderFieldInput(f, editPayload, setEditPayload)
                    )}
                  </div>
                ) : (
                  renderReadOnlyFields(item)
                )}
              </div>
            </div>
          );
        })}

        {(!data || data.length === 0) && !adding && (
          <p className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
            No {title.toLowerCase()} added yet.
          </p>
        )}
      </CardContent>

      {canEdit && (
        <CardFooter className="pt-2 flex justify-end">
          <Button
            size="sm"
            variant="default"
            onClick={() => {
              setAdding(true);
              setEditingId(null);
            }}
            disabled={adding}
          >
            <Plus className="h-4 w-4 mr-1" /> Add {title.slice(0, -1)}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ProfileSection;
