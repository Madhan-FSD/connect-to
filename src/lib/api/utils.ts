export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

import { toast } from "sonner";

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const noCacheUrl = `${url}${url.includes("?") ? "&" : "?"}_=${Date.now()}`;

  const response = await fetch(noCacheUrl, {
    ...options,
    cache: "no-store",
    headers: {
      ...(options.headers || {}),
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });

  if (response.status === 204) return {};

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg = data.error || data.message || `API Error (${response.status})`;
    toast.error(msg);
    throw new Error(msg);
  }

  if (data?.message) toast.success(data.message);

  return data;
};

export const uploadFile = async (
  url: string,
  file: File,
  token: string,
  baseUrl: string
) => {
  try {
    const formData = new FormData();
    formData.append(url.includes("avatar") ? "avatar" : "profileBanner", file);

    const res = await fetch(`${baseUrl}${url}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = data.error || "Upload failed";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    if (data?.message) {
      toast.success(data.message);
    } else {
      toast.success("File uploaded successfully.");
    }

    return data;
  } catch (err: any) {
    console.error("uploadFile error:", err);
    toast.error(err.message || "File upload failed.");
    throw err;
  }
};

export const deleteFile = async (
  url: string,
  token: string,
  baseUrl: string
) => {
  const res = await fetch(`${baseUrl}${url}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
};
