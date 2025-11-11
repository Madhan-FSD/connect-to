import { API_BASE_URL, apiFetch, deleteFile, uploadFile } from "./utils";

const CHILD_BASE = `${API_BASE_URL}/child`;
const PROFILE_API_BASE_URL = `${CHILD_BASE}/profile`;

export const childApi = {
  createChildPostOnProfile: (childId: string, content: string, token: string) =>
    apiFetch(`${CHILD_BASE}/${childId}/create/profile/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    }),

  createChildPostOnChannel: (
    childId: string,
    channelId: string,
    content: string,
    token: string
  ) =>
    apiFetch(`${CHILD_BASE}/${childId}/create/channel/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, channelId }),
    }),

  childLikedPostByPostId: (childId: string, postId: string, token: string) =>
    apiFetch(`${CHILD_BASE}/${childId}/like/${postId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  contentCompletion: (childId: string, contentId: string, token: string) =>
    apiFetch(`${CHILD_BASE}/${childId}/content/${contentId}/complete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  profile: {
    getFullProfile: (childId: string, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/full-profile`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }),
    getCore: (childId: string, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }),
    updateCore: (childId: string, data: any, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),

    getSkills: (childId: string, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/skills`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }),
    addSkill: (childId: string, data: any, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/skills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
    updateSkill: (childId: string, skillId: string, data: any, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/skills/${skillId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
    removeSkill: (childId: string, skillId: string, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/skills/${skillId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),

    getInterests: (childId: string, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/interests`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }),
    addInterest: (childId: string, data: any, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/interests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
    updateInterest: (
      childId: string,
      interestId: string,
      data: any,
      token: string
    ) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/interests/${interestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
    removeInterest: (childId: string, interestId: string, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/interests/${interestId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),

    getCertifications: (childId: string, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/certifications`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }),
    addCertification: (childId: string, data: any, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/certifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
    updateCertification: (
      childId: string,
      certId: string,
      data: any,
      token: string
    ) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/certifications/${certId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
    removeCertification: (childId: string, certId: string, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/certifications/${certId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),

    getAchievements: (childId: string, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/achievements`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }),
    addAchievement: (childId: string, data: any, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/achievements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
    updateAchievement: (
      childId: string,
      achId: string,
      data: any,
      token: string
    ) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/achievements/${achId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
    removeAchievement: (childId: string, achId: string, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/achievements/${achId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),

    getProjects: (childId: string, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/projects`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }),
    addProject: (childId: string, data: any, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
    updateProject: (
      childId: string,
      projectId: string,
      data: any,
      token: string
    ) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
    removeProject: (childId: string, projectId: string, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/projects/${projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),

    getEducations: (childId: string, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/educations`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }),
    addEducation: (childId: string, data: any, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/educations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
    updateEducation: (
      childId: string,
      educationId: string,
      data: any,
      token: string
    ) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/educations/${educationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),
    removeEducation: (childId: string, educationId: string, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/educations/${educationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }),

    getAvatar: (childId: string, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/avatar`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }),
    updateAvatar: (childId: string, file: File, token: string) =>
      uploadFile(
        `/children/${childId}/profile/avatar`,
        file,
        token,
        PROFILE_API_BASE_URL
      ),
    deleteAvatar: (childId: string, token: string) =>
      deleteFile(
        `/children/${childId}/profile/avatar`,
        token,
        PROFILE_API_BASE_URL
      ),

    getBanner: (childId: string, token: string) =>
      apiFetch(`${PROFILE_API_BASE_URL}/${childId}/banner`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }),
    updateBanner: (childId: string, file: File, token: string) =>
      uploadFile(
        `/children/${childId}/profile/banner`,
        file,
        token,
        PROFILE_API_BASE_URL
      ),
    deleteBanner: (childId: string, token: string) =>
      deleteFile(
        `/children/${childId}/profile/banner`,
        token,
        PROFILE_API_BASE_URL
      ),
  },
};
