import { create } from "zustand";
import { Conversation, Message, User } from "@/types";
import { chatApi } from "@/lib/api/chat.api";

interface ConversationState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;

  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;

  typing: Record<string, boolean>;
  setTyping: (userId: string, isTyping: boolean) => void;

  presence: Record<string, { status: string; ts: number }>;
  setPresence: (userId: string, status: string) => void;

  activeConversationId: string | null;
  setActiveConversation: (id: string | null) => void;

  widgetOpen: boolean;
  setWidgetOpen: (open: boolean) => void;

  openDirect: (userId: string) => Promise<void>;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  conversations: [],
  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),
  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c._id === id ? { ...c, ...updates } : c
      ),
    })),

  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === id ? { ...m, ...updates } : m
      ),
    })),

  typing: {},
  setTyping: (userId, isTyping) =>
    set((state) => ({
      typing: { ...state.typing, [userId]: isTyping },
    })),

  presence: {},
  setPresence: (userId, status) =>
    set((state) => ({
      presence: { ...state.presence, [userId]: { status, ts: Date.now() } },
    })),

  activeConversationId: null,
  setActiveConversation: (id) => set({ activeConversationId: id }),

  widgetOpen: false,
  setWidgetOpen: (open) => set({ widgetOpen: open }),

  openDirect: async (userId: string) => {
    try {
      const res = await chatApi.createDirectConversation(userId);
      const conv = res.conversation;

      const exists = get().conversations.some((c) => c._id === conv._id);
      if (!exists) {
        get().addConversation(conv);
      }

      set({
        activeConversationId: conv._id,
        widgetOpen: true,
      });
    } catch (error) {
      console.error("Failed to open direct:", error);
    }
  },
}));
