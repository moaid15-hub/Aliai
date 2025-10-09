import { useChatStore } from '@/store/chatStore';
import { useEffect } from 'react';

export function useChat() {
  const {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isSending,
    error,
    loadConversations,
    selectConversation,
    createConversation,
    deleteConversation,
    sendMessage,
    sendMessageStream,
    clearError,
    clearCurrentConversation,
  } = useChatStore();

  useEffect(() => {
    // Load conversations on mount
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isSending,
    error,
    loadConversations,
    selectConversation,
    createConversation,
    deleteConversation,
    sendMessage,
    sendMessageStream,
    clearError,
    clearCurrentConversation,
  };
}


