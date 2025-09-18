import axios from 'axios';
import { Article, ArticleStatus } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://codinginfoback-production.up.railway.app';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/admin`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      console.error(`Admin API Error ${status}:`, data);

      switch (status) {
        case 401:
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
        case 403:
          throw new Error('관리자 권한이 필요합니다.');
        case 404:
          throw new Error('요청한 리소스를 찾을 수 없습니다.');
        case 500:
          throw new Error('서버 오류가 발생했습니다.');
        default:
          throw new Error(`API 요청이 실패했습니다: ${status}`);
      }
    } else if (error.request) {
      throw new Error('서버에 연결할 수 없습니다.');
    } else {
      throw new Error('요청을 처리하는 중 오류가 발생했습니다.');
    }
  }
);

export interface DashboardStats {
  articles: {
    total: number;
    published: number;
    draft: number;
  };
  users: {
    total: number;
    active: number;
  };
  engagement: {
    totalViews: number;
  };
  recentArticles: Article[];
}

export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserListResponse {
  users: AdminUser[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AdminArticleListResponse {
  articles: Article[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalArticles: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  database: {
    status: string;
    connected: boolean;
  };
  collections: {
    articles: number;
    users: number;
  };
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  version: string;
}

export const adminApi = {
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  // Users Management
  getAllUsers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  } = {}): Promise<AdminUserListResponse> => {
    const response = await api.get<AdminUserListResponse>('/users', { params });
    return response.data;
  },

  updateUserStatus: async (userId: string, isActive: boolean): Promise<{ message: string; user: AdminUser }> => {
    const response = await api.patch<{ message: string; user: AdminUser }>(`/users/${userId}/status`, {
      isActive,
    });
    return response.data;
  },

  deleteUser: async (userId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/users/${userId}`);
    return response.data;
  },

  // Articles Management
  getAllArticles: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    author?: string;
  } = {}): Promise<AdminArticleListResponse> => {
    const response = await api.get<AdminArticleListResponse>('/articles', { params });
    return response.data;
  },

  updateArticleStatus: async (articleId: string, status: ArticleStatus): Promise<{ message: string; article: Article }> => {
    const response = await api.patch<{ message: string; article: Article }>(`/articles/${articleId}/status`, {
      status,
    });
    return response.data;
  },

  deleteArticle: async (articleId: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/articles/${articleId}`);
    return response.data;
  },

  // System Health
  getSystemHealth: async (): Promise<SystemHealth> => {
    const response = await api.get<SystemHealth>('/system/health');
    return response.data;
  },
};