import { API_BASE_URL, apiFetch, deleteFile, uploadFile } from "./utils";

const USERS_BASE = `${API_BASE_URL}/users`;
const PROFILE_API_BASE_URL = `${USERS_BASE}/profile`;

export const userApi = {
  getDashboard: (token: string) =>
    apiFetch(`${USERS_BASE}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  addChild: (
    childData: {
      firstName: string;
      lastName: string;
      dob: string;
      accessCode: string;
      profileHeadline?: string;
    },
    token: string
  ) =>
    apiFetch(`${USERS_BASE}/child`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(childData),
    }),

  getChildDetails: (childId: string, token: string) =>
    apiFetch(`${USERS_BASE}/child/${childId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  updateChildPermissions: (
    childId: string,
    updates: Record<string, boolean>,
    token: string
  ) =>
    apiFetch(`${USERS_BASE}/controls/${childId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    }),

  profile: {
    core: {
      get: (token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
      update: async (data: any, token: string) => {
        return apiFetch(`${PROFILE_API_BASE_URL}/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({ ...data }),
        });
      },
    },

    fullProfile: {
      get: (token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/full-profile`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
    },

    addresses: {
      get: (token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/addresses`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
      add: (data: any, token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/addresses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }),
      update: (addressId: string, data: any, token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/addresses/${addressId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }),
      remove: (addressId: string, token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/addresses/${addressId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }),
    },

    skills: {
      get: (token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/skills`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
      add: (data: any, token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/skills`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }),
      update: (skillId: string, data: any, token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/skills/${skillId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }),
      remove: (skillId: string, token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/skills/${skillId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }),
    },

    interests: {
      get: (token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/interests`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
      add: (data: any, token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/interests`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }),
      update: (interestId: string, data: any, token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/interests/${interestId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }),
      remove: (interestId: string, token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/interests/${interestId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }),
    },

    certifications: {
      get: (token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/certifications`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
      add: (data: any, token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/certifications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }),
      update: (certId: string, data: any, token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/certifications/${certId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }),
      remove: (certId: string, token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/certifications/${certId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }),
    },

    experiences: {
      get: (token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/experiences`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
      add: async (data: any, token: string) => {
        return apiFetch(`${PROFILE_API_BASE_URL}/experiences`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...data }),
        });
      },
      update: async (experienceId: string, data: any, token: string) => {
        return apiFetch(`${PROFILE_API_BASE_URL}/experiences/${experienceId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...data }),
        });
      },
      remove: (experienceId: string, token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/experiences/${experienceId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }),
    },

    educations: {
      get: (token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/educations`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
      add: async (data: any, token: string) => {
        return apiFetch(`${PROFILE_API_BASE_URL}/educations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...data }),
        });
      },
      update: async (educationId: string, data: any, token: string) => {
        return apiFetch(`${PROFILE_API_BASE_URL}/educations/${educationId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...data }),
        });
      },
      remove: (educationId: string, token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/educations/${educationId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }),
    },

    achievements: {
      get: (token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/achievements`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
      add: async (data: any, token: string) => {
        return apiFetch(`${PROFILE_API_BASE_URL}/achievements`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...data }),
        });
      },
      update: async (achId: string, data: any, token: string) => {
        return apiFetch(`${PROFILE_API_BASE_URL}/achievements/${achId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...data }),
        });
      },
      remove: (achId: string, token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/achievements/${achId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }),
    },

    projects: {
      get: (token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/projects`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
      add: async (data: any, token: string) => {
        return apiFetch(`${PROFILE_API_BASE_URL}/projects`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...data }),
        });
      },
      update: async (projectId: string, data: any, token: string) => {
        return apiFetch(`${PROFILE_API_BASE_URL}/projects/${projectId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...data }),
        });
      },
      remove: (projectId: string, token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/projects/${projectId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }),
    },

    avatar: {
      get: (token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/avatar`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
      update: (file: File, token: string) =>
        uploadFile("/avatar", file, token, PROFILE_API_BASE_URL),
      delete: (token: string) =>
        deleteFile("/avatar", token, PROFILE_API_BASE_URL),
    },

    banner: {
      get: (token: string) =>
        apiFetch(`${PROFILE_API_BASE_URL}/banner`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }),
      update: (file: File, token: string) =>
        uploadFile("/banner", file, token, PROFILE_API_BASE_URL),
      delete: (token: string) =>
        deleteFile("/banner", token, PROFILE_API_BASE_URL),
    },
  },
};
