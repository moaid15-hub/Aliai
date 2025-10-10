// Frontend API Configuration for Railway Backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://oqool-backend.railway.app'

interface ApiConfig {
  baseURL: string
  timeout: number
  headers: {
    'Content-Type': string
  }
}

export const apiConfig: ApiConfig = {
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
}

// API Endpoints
export const endpoints = {
  // Auth endpoints
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout'
  },
  
  // Chat endpoints
  chat: {
    conversations: '/chat/conversations',
    messages: '/chat/messages',
    send: '/chat/send'
  },
  
  // User endpoints
  user: {
    profile: '/user/profile',
    settings: '/user/settings'
  }
}

// API Client Class
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request<{ access_token: string; user: any }>(
      endpoints.auth.login,
      {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }
    )
    this.setToken(response.access_token)
    return response
  }

  async register(userData: {
    email: string
    password: string
    username: string
    full_name?: string
  }) {
    return this.request(endpoints.auth.register, {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  // Chat methods
  async getConversations() {
    return this.request(endpoints.chat.conversations)
  }

  async createConversation(title?: string) {
    return this.request(endpoints.chat.conversations, {
      method: 'POST',
      body: JSON.stringify({ title })
    })
  }

  async sendMessage(conversationId: string, message: string) {
    return this.request(endpoints.chat.send, {
      method: 'POST',
      body: JSON.stringify({
        conversation_id: conversationId,
        content: message
      })
    })
  }

  async getMessages(conversationId: string) {
    return this.request(`${endpoints.chat.messages}?conversation_id=${conversationId}`)
  }

  // User methods
  async getProfile() {
    return this.request(endpoints.user.profile)
  }

  async updateProfile(data: any) {
    return this.request(endpoints.user.profile, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_URL)
export default apiClient