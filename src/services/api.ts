// Comentosh REST API Client
// Connects Frontend to Cloudflare Workers / D1 Database Backend

import { User, Post, Comment, NotificationItem } from '../types';

const API_BASE = '/api';

class ApiClient {
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('comentosh_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = { ...this.getHeaders(), ...(options.headers as Record<string, string>) };

    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include HttpOnly cookies
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data?.error || `API Request Failed: ${res.status}`;
      throw new Error(errorMsg);
    }

    return data as T;
  }

  // --- Auth API ---
  async getMe(): Promise<{ user: User | null; authenticated: boolean }> {
    return this.request<{ user: User | null; authenticated: boolean }>('/auth/me');
  }

  async login(identifier: string, password: string): Promise<{ success: boolean; user: User; token: string }> {
    const res = await this.request<{ success: boolean; user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    if (res.token) {
      localStorage.setItem('comentosh_token', res.token);
    }
    return res;
  }

  async register(data: {
    username: string;
    password: string;
    phoneNumber: string;
    name?: string;
    bio?: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; user: User; token: string }> {
    const res = await this.request<{ success: boolean; user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) {
      localStorage.setItem('comentosh_token', res.token);
    }
    return res;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('comentosh_token');
    }
  }

  // --- Posts & Feed API ---
  async getFeed(topic?: string, filter?: string): Promise<Post[]> {
    const params = new URLSearchParams();
    if (topic && topic !== 'All') params.set('topic', topic);
    if (filter) params.set('filter', filter);
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await this.request<{ posts: Post[] }>(`/posts${query}`);
    return res.posts || [];
  }

  async getPost(postId: string): Promise<Post> {
    const res = await this.request<{ post: Post }>(`/posts/${postId}`);
    return res.post;
  }

  async createPost(data: { content: string; topic: string; images?: string[] }): Promise<{ success: boolean; post: Post; id: string }> {
    return this.request<{ success: boolean; post: Post; id: string }>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async editPost(postId: string, data: { content: string; topic: string; images?: string[] }): Promise<void> {
    await this.request(`/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePost(postId: string): Promise<void> {
    await this.request(`/posts/${postId}`, { method: 'DELETE' });
  }

  async sharePost(postId: string): Promise<void> {
    await this.request(`/posts/${postId}/share`, { method: 'POST' });
  }

  async toggleSavePost(postId: string): Promise<{ success: boolean; saved: boolean }> {
    return this.request<{ success: boolean; saved: boolean }>(`/posts/${postId}/save`, { method: 'POST' });
  }

  // --- Comments & Perspectives API ---
  async getComments(postId: string): Promise<Comment[]> {
    const res = await this.request<{ comments: Comment[] }>(`/posts/${postId}/comments`);
    return res.comments || [];
  }

  async addComment(postId: string, content: string): Promise<Comment> {
    const res = await this.request<{ success: boolean; comment: Comment }>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return res.comment;
  }

  async addReply(commentId: string, content: string): Promise<string> {
    const res = await this.request<{ success: boolean; replyId: string }>(`/comments/${commentId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return res.replyId;
  }

  async editComment(commentId: string, content: string): Promise<void> {
    await this.request(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.request(`/comments/${commentId}`, { method: 'DELETE' });
  }

  async toggleCommentLike(commentId: string): Promise<{ liked: boolean; likesCount: number }> {
    return this.request<{ liked: boolean; likesCount: number }>(`/comments/${commentId}/like`, { method: 'POST' });
  }

  // --- Users & Thinkers API ---
  async getUsers(): Promise<User[]> {
    const res = await this.request<{ users: User[] }>('/users');
    return res.users || [];
  }

  async getUserProfile(userIdOrHandle: string): Promise<User> {
    const res = await this.request<{ user: User }>(`/users/${userIdOrHandle}`);
    return res.user;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const res = await this.request<{ success: boolean; user: User }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.user;
  }

  async toggleFollow(userId: string): Promise<{ following: boolean; user: User }> {
    return this.request<{ following: boolean; user: User }>(`/users/${userId}/follow`, { method: 'POST' });
  }

  // --- Notifications API ---
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await this.request<{ notifications: NotificationItem[] }>('/notifications');
    return res.notifications || [];
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.request(`/notifications/${id}/read`, { method: 'POST' });
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.request('/notifications/read-all', { method: 'POST' });
  }
}

export const api = new ApiClient();
