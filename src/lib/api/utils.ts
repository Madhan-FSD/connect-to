export const API_BASE_URL = "https://api1.madhankumarg.com/api";
// export const API_BASE_URL = "http://localhost:4000/api";

import { toast } from "sonner";

export const apiFetch = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) return {};

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage =
        data.error || data.message || `API Error (${response.status})`;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    if (data?.message) {
      toast.success(data.message);
    }

    return data;
  } catch (err: any) {
    console.error("apiFetch error:", err);
    if (!err.message?.includes("Failed to fetch")) {
      toast.error(err.message || "An unknown error occurred.");
    } else {
      toast.error("Network error: Check your internet or server.");
    }
    throw err;
  }
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
