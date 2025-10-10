import { create } from 'zustand';
import { Conversation, Message } from '@/types/chat';
import api from '@/lib/api';

interface ChatStore {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;

  // Actions
  loadConversations: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  createConversation: (title?: string) => Promise<Conversation>;
  deleteConversation: (conversationId: string) => Promise<void>;
  sendMessage: (message: string, conversationId?: string) => Promise<void>;
  sendMessageStream: (
    message: string,
    conversationId?: string,
    onChunk?: (chunk: string) => void
  ) => Promise<void>;
  clearError: () => void;
  clearCurrentConversation: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,

  loadConversations: async () => {
    try {
      set({ isLoading: true, error: null });
      const conversations = await api.getConversations();
      set({ conversations, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'فشل تحميل المحادثات',
        isLoading: false,
      });
    }
  },

  selectConversation: async (conversationId) => {
    try {
      set({ isLoading: true, error: null });
      const conversation = await api.getConversation(conversationId);
      set({
        currentConversation: conversation,
        messages: conversation.messages || [],
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'فشل تحميل المحادثة',
        isLoading: false,
      });
    }
  },

  createConversation: async (title = 'محادثة جديدة') => {
    try {
      set({ isLoading: true, error: null });
      const conversation = await api.createConversation(title);
      set((state) => ({
        conversations: [conversation, ...state.conversations],
        currentConversation: conversation,
        messages: [],
        isLoading: false,
      }));
      return conversation;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'فشل إنشاء المحادثة',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteConversation: async (conversationId) => {
    try {
      await api.deleteConversation(conversationId);
      set((state) => ({
        conversations: state.conversations.filter((c) => c.id !== conversationId),
        currentConversation:
          state.currentConversation?.id === conversationId
            ? null
            : state.currentConversation,
        messages:
          state.currentConversation?.id === conversationId ? [] : state.messages,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'فشل حذف المحادثة',
      });
      throw error;
    }
  },

  sendMessage: async (message, conversationId) => {
    try {
      set({ isSending: true, error: null });

      // Add user message immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        conversation_id: conversationId || '',
        role: 'user',
        content: message,
        tokens_used: 0,
        model: null,
        created_at: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, userMessage],
      }));

      // Send to API
      const response = await api.sendMessage(message, conversationId);

      // Update with actual messages from server
      set((state) => ({
        messages: [
          ...state.messages.filter((m) => m.id !== userMessage.id),
          response.message,
          response.assistant_message,
        ],
        currentConversation: {
          ...state.currentConversation!,
          id: response.conversation_id,
        },
        isSending: false,
      }));

      // Reload conversations to update list
      get().loadConversations();
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'فشل إرسال الرسالة',
        isSending: false,
      });
      throw error;
    }
  },

  sendMessageStream: async (message, conversationId, onChunk) => {
    try {
      set({ isSending: true, error: null });

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        conversation_id: conversationId || '',
        role: 'user',
        content: message,
        tokens_used: 0,
        model: null,
        created_at: new Date().toISOString(),
      };

      // Add assistant message placeholder
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        conversation_id: conversationId || '',
        role: 'assistant',
        content: '',
        tokens_used: 0,
        model: null,
        created_at: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, userMessage, assistantMessage],
      }));

      // Stream response
      await api.sendMessageStream(message, conversationId, undefined, (chunk) => {
        set((state) => {
          const updatedMessages = [...state.messages];
          const lastMessage = updatedMessages[updatedMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            lastMessage.content += chunk;
          }
          return { messages: updatedMessages };
        });

        if (onChunk) onChunk(chunk);
      });

      set({ isSending: false });
      get().loadConversations();
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'فشل إرسال الرسالة',
        isSending: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  clearCurrentConversation: () =>
    set({ currentConversation: null, messages: [] }),
}));


