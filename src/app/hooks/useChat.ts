import { useState, useCallback, useEffect } from 'react'
import { apiClient } from '../lib/api'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Conversation {
  id: string
  title?: string
  created_at: string
  updated_at: string
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  // Load conversations from API
  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getConversations() as any
      setConversations(response.conversations || [])
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true)
      const response = await apiClient.getMessages(conversationId) as any
      setMessages(response.messages || [])
      setCurrentConversation(conversationId)
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Send a new message
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    try {
      setIsTyping(true)

      // Add user message immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])

      // Create conversation if none exists
      let conversationId = currentConversation
      if (!conversationId) {
        const response = await apiClient.createConversation() as any
        conversationId = response.conversation.id
        setCurrentConversation(conversationId)
        await loadConversations() // Refresh conversations list
      }

      // Send message to API
      const response = await apiClient.sendMessage(conversationId!, content) as any
      
      // Add AI response
      const aiMessage: Message = {
        id: response.message.id,
        role: 'assistant',
        content: response.message.content,
        timestamp: new Date(response.message.created_at)
      }
      
      setMessages(prev => [...prev, aiMessage])
      
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'عذراً، حدث خطأ في الإرسال. يرجى المحاولة مرة أخرى.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }, [currentConversation, loadConversations])

  // Create new conversation
  const createNewConversation = useCallback(async () => {
    try {
      const response = await apiClient.createConversation() as any
      setCurrentConversation(response.conversation.id)
      setMessages([])
      await loadConversations()
      return response.conversation.id
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw error
    }
  }, [loadConversations])

  // Select a conversation
  const selectConversation = useCallback(async (conversationId: string) => {
    await loadMessages(conversationId)
  }, [loadMessages])

  // Clear current conversation
  const clearConversation = useCallback(() => {
    setMessages([])
    setCurrentConversation(null)
  }, [])

  return {
    // State
    messages,
    conversations,
    currentConversation,
    isLoading,
    isTyping,
    
    // Actions
    sendMessage,
    createNewConversation,
    selectConversation,
    clearConversation,
    loadConversations,
    loadMessages
  }
}