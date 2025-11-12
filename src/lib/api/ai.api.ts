import { API_BASE_URL, apiFetch } from "./utils";

export const aiApi = {
  chat: (message: string, token: string) =>
    apiFetch(`${API_BASE_URL}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    }),

  buildProfile: (data: any, token: string) =>
    apiFetch(`${API_BASE_URL}/ai/build-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),

  getActivityInsights: async (childId: string, token: string) =>
    await apiFetch(`${API_BASE_URL}/ai/activity-insights/${childId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  moderate: (content: string, token: string) =>
    apiFetch(`${API_BASE_URL}/ai/moderate-content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    }),

  analyzeSentiment: (content: string, token: string) =>
    apiFetch(`${API_BASE_URL}/ai/analyze-sentiment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    }),

  generateCaption: (imageUrl: string, token: string) =>
    apiFetch(`${API_BASE_URL}/ai/generate-caption`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imageUrl }),
    }),

  suggestHashtags: (content: string, token: string) =>
    apiFetch(`${API_BASE_URL}/ai/suggest-hashtags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    }),

  summarizePost: (content: string, token: string) =>
    apiFetch(`${API_BASE_URL}/ai/summarize-post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    }),

  translate: (content: string, targetLanguage: string, token: string) =>
    apiFetch(`${API_BASE_URL}/ai/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, targetLanguage }),
    }),

  enhanceText: async (content: string, token: string) =>
    apiFetch(`${API_BASE_URL}/ai/enhance-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    }),

  describeImage: async (imageUrl: string, token: string) =>
    apiFetch(`${API_BASE_URL}/ai/describe-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imageUrl }),
    }),

  generateLearningPath: (interests: string, token: string) =>
    apiFetch(`${API_BASE_URL}/ai/learning-path`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ interests }),
    }),

  calculateSafetyScore: async (content: string, token: string) =>
    await apiFetch(`${API_BASE_URL}/ai/safety-score`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    }),

  getSmartRecommendations: async (userId: string, token: string) =>
    apiFetch(`${API_BASE_URL}/ai/recommendations/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  games: {
    generateTrivia: async (
      topic: string,
      difficulty: string,
      questionCount: number,
      token: string
    ) =>
      apiFetch(`${API_BASE_URL}/ai/games/trivia`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ topic, difficulty, questionCount }),
      }),

    generateStoryAdventure: async (
      genre: string,
      previousStory: string,
      userChoice: string,
      token: string
    ) =>
      await apiFetch(`${API_BASE_URL}/ai/games/story-adventure`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ genre, previousStory, userChoice }),
      }),

    generateWordMaster: async (
      gameType: string,
      difficulty: string,
      category: string,
      token: string
    ) =>
      await apiFetch(`${API_BASE_URL}/ai/games/word-master`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gameType, difficulty, category }),
      }),

    generateMathChallenge: async (
      difficulty: string,
      problemCount: number,
      topics: string[],
      token: string
    ) =>
      await apiFetch(`${API_BASE_URL}/ai/games/math-challenge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ difficulty, problemCount, topics }),
      }),

    generateCodeDetective: async (
      puzzleType: string,
      difficulty: string,
      token: string
    ) =>
      await apiFetch(`${API_BASE_URL}/ai/games/code-detective`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ puzzleType, difficulty }),
      }),

    submitTriviaAnswers: async (
      childId: string,
      questionsWithAnswers: any[],
      token: string
    ) =>
      apiFetch(`${API_BASE_URL}/ai/games/${childId}/trivia/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questionsWithAnswers }),
      }),

    submitStoryChoice: async (
      childId: string,
      data: { storySegment: string; choice: string; isCorrect: boolean },
      token: string
    ) =>
      apiFetch(`${API_BASE_URL}/ai/games/${childId}/story-adventure/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }),

    submitWordMasterAnswers: async (
      childId: string,
      gameType: string,
      answers: any[],
      token: string
    ) =>
      apiFetch(`${API_BASE_URL}/ai/games/${childId}/word-master/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gameType, answers }),
      }),

    submitMathAnswers: async (
      childId: string,
      problemsWithAnswers: any[],
      token: string
    ) =>
      apiFetch(`${API_BASE_URL}/ai/games/${childId}/math-challenge/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ problemsWithAnswers }),
      }),

    submitCodeDetectiveAnswers: async (
      childId: string,
      puzzleType: string,
      puzzlesWithAnswers: any[],
      token: string
    ) =>
      apiFetch(`${API_BASE_URL}/ai/games/${childId}/code-detective/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ puzzleType, puzzlesWithAnswers }),
      }),
  },
};

export const reportsApi = {
  getDailyReport: async (
    childId: string,
    date: string | null = null,
    token: string
  ) => {
    const query = date ? `?date=${date}` : "";
    return apiFetch(`${API_BASE_URL}/reports/daily/${childId}${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getLeaderboard: async (token: string) =>
    apiFetch(`${API_BASE_URL}/reports/leaderboard`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getChildWallet: async (childId: string, token: string) =>
    apiFetch(`${API_BASE_URL}/reports/wallet/${childId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
