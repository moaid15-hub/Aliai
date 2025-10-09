/**
 * API Client for Oqool AI
 */
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // If 401 and not already retried, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
                refresh_token: refreshToken,
              });

              localStorage.setItem('access_token', data.access_token);
              localStorage.setItem('refresh_token', data.refresh_token);

              originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async signup(email: string, password: string, fullName: string) {
    const { data } = await this.client.post('/api/auth/signup', {
      email,
      password,
      full_name: fullName,
    });
    return data;
  }

  async login(email: string, password: string) {
    const { data } = await this.client.post('/api/auth/login', {
      email,
      password,
    });
    return data;
  }

  async logout() {
    try {
      await this.client.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  async refreshToken(refreshToken: string) {
    const { data } = await this.client.post('/api/auth/refresh', {
      refresh_token: refreshToken,
    });
    return data;
  }

  // User endpoints
  async getCurrentUser() {
    const { data } = await this.client.get('/api/users/me');
    return data;
  }

  async updateUser(userData: any) {
    const { data } = await this.client.put('/api/users/me', userData);
    return data;
  }

  // Chat endpoints
  async createConversation(title: string, model?: string) {
    const { data } = await this.client.post('/api/chat/conversations', {
      title,
      model: model || 'claude-3-sonnet-20240229',
    });
    return data;
  }

  async getConversations(skip = 0, limit = 50) {
    const { data } = await this.client.get('/api/chat/conversations', {
      params: { skip, limit },
    });
    return data;
  }

  async getConversation(conversationId: string) {
    const { data } = await this.client.get(
      `/api/chat/conversations/${conversationId}`
    );
    return data;
  }

  async updateConversation(conversationId: string, updates: any) {
    const { data } = await this.client.patch(
      `/api/chat/conversations/${conversationId}`,
      updates
    );
    return data;
  }

  async deleteConversation(conversationId: string) {
    await this.client.delete(`/api/chat/conversations/${conversationId}`);
  }

  async sendMessage(
    message: string,
    conversationId?: string,
    model?: string,
    modelType?: 'local' | 'cloud'
  ) {
    const { data } = await this.client.post('/api/chat/send', {
      message,
      conversation_id: conversationId,
      model: model || 'claude-3-sonnet-20240229',
      model_type: modelType || 'cloud',
    });
    return data;
  }

  async getMessages(conversationId: string) {
    const { data } = await this.client.get(
      `/api/chat/conversations/${conversationId}/messages`
    );
    return data;
  }

  // Streaming
  async sendMessageStream(
    message: string,
    conversationId?: string,
    model?: string,
    onChunk?: (chunk: string) => void
  ) {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/api/chat/send-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        model: model || 'claude-3-sonnet-20240229',
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.chunk && onChunk) {
              onChunk(data.chunk);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }
}

export const api = new ApiClient();
export default api;


