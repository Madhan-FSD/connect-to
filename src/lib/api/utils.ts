export const API_BASE_URL = "https://api1.madhankumarg.com/api";

export const apiFetch = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, options);
  if (response.status === 204) return {};
  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.error || "An API error occurred.");
  }
  return response.json();
};

export const uploadFile = async (
  url: string,
  file: File,
  token: string,
  baseUrl: string
) => {
  const formData = new FormData();
  formData.append(url.includes("avatar") ? "avatar" : "profileBanner", file);

  const res = await fetch(`${baseUrl}${url}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
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
