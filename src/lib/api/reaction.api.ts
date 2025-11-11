import { API_BASE_URL } from "./utils";

const REACTION_BASE_URL = `${API_BASE_URL}/reactions`;

export const reactionApi = {
  /**
   * Toggle or change a reaction
   * @param targetType "Post" | "Video" | "Comment"
   * @param targetId ObjectId string of the target
   * @param type "LIKE" | "LOVE" | "CELEBRATE" | "INSIGHTFUL" | "SAD" | "ANGRY"
   * @param token User JWT
   */
  toggleReaction: async (
    targetType: "Post" | "Video" | "Comment",
    targetId: string,
    type: string,
    token: string
  ) => {
    const response = await fetch(`${REACTION_BASE_URL}/toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetType, targetId, type }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error || "Failed to toggle reaction");
    }

    return response.json(); // returns { message, counts, totalReactions, userReaction }
  },

  /**
   * Get summary of reactions for a post/video/comment
   * @returns Object like { summary: { LIKE: 5, LOVE: 3 }, total: 8 }
   */
  getSummary: async (
    targetType: "Post" | "Video" | "Comment",
    targetId: string,
    token: string
  ) => {
    const response = await fetch(
      `${REACTION_BASE_URL}/summary?targetType=${targetType}&targetId=${targetId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error || "Failed to fetch reaction summary");
    }

    return response.json();
  },

  /**
   * Get current user’s reaction type (for highlighting the right emoji)
   * @returns { userReaction: "LIKE" | "LOVE" | null }
   */
  getUserReaction: async (
    targetType: "Post" | "Video" | "Comment",
    targetId: string,
    token: string
  ) => {
    const response = await fetch(
      `${REACTION_BASE_URL}/user?targetType=${targetType}&targetId=${targetId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error || "Failed to fetch user reaction");
    }

    return response.json();
  },
};
