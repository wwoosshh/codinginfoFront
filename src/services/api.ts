import axios from 'axios';
import { Article, Category } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5159';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const articleApi = {
  getAllArticles: async (): Promise<Article[]> => {
    const response = await api.get<Article[]>('/articles');
    return response.data;
  },

  getArticleBySlug: async (slug: string): Promise<Article> => {
    const response = await api.get<Article>(`/articles/${slug}`);
    return response.data;
  },

  getArticlesByCategory: async (category: Category): Promise<Article[]> => {
    const response = await api.get<Article[]>(`/articles/category/${category}`);
    return response.data;
  },

  searchArticles: async (keyword: string): Promise<Article[]> => {
    const response = await api.get<Article[]>('/articles/search', {
      params: { keyword },
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