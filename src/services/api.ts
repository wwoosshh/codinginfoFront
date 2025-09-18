import axios from 'axios';
import { Article, Category, ArticleListResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://codinginfoback-production.up.railway.app';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const articleApi = {
  getAllArticles: async (page: number = 1, limit: number = 10): Promise<ArticleListResponse> => {
    const response = await api.get<ArticleListResponse>('/articles', {
      params: { page, limit }
    });
    return response.data;
  },

  getArticleBySlug: async (slug: string): Promise<Article> => {
    const response = await api.get<Article>(`/articles/${slug}`);
    return response.data;
  },

  getArticlesByCategory: async (category: Category, page: number = 1, limit: number = 10): Promise<ArticleListResponse> => {
    const response = await api.get<ArticleListResponse>(`/articles/category/${category}`, {
      params: { page, limit }
    });
    return response.data;
  },

  searchArticles: async (keyword: string, page: number = 1, limit: number = 10): Promise<ArticleListResponse> => {
    const response = await api.get<ArticleListResponse>('/articles/search', {
      params: { keyword, page, limit },
    });
    return response.data;
  },
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      console.error(`API Error ${status}:`, data);
      
      switch (status) {
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