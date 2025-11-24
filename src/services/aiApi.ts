import axios from 'axios';
import {
  AIConfiguration,
  AIProviderType,
  AIConversation,
  ConversationMessage,
  DraftArticle,
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://codinginfoback-production.up.railway.app';

// axios 인스턴스 생성
const aiAxios = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 자동 추가
aiAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// AI 설정 관리
export const aiConfigApi = {
  // AI 설정 조회
  getConfig: async (): Promise<AIConfiguration> => {
    const response = await aiAxios.get('/admin/ai-config');
    return response.data;
  },

  // AI 설정 업데이트
  updateConfig: async (config: {
    defaultProvider?: AIProviderType;
    providers?: {
      [key: string]: {
        apiKey?: string;
        enabled?: boolean;
      };
    };
  }): Promise<void> => {
    await aiAxios.post('/admin/ai-config', config);
  },

  // API 키 테스트
  testProvider: async (
    provider: AIProviderType,
    apiKey?: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await aiAxios.post(`/admin/ai-config/test/${provider}`, {
      apiKey,
    });
    return response.data;
  },

  // 활성화된 제공자 목록
  getEnabledProviders: async (): Promise<{
    providers: string[];
    defaultProvider: AIProviderType;
  }> => {
    const response = await aiAxios.get('/admin/ai-config/enabled');
    return response.data;
  },
};

// AI 대화 관리
export const aiConversationApi = {
  // 새 대화 세션 생성
  createConversation: async (data: {
    title: string;
    aiProvider: AIProviderType;
  }): Promise<AIConversation> => {
    const response = await aiAxios.post('/admin/ai-conversations', data);
    return response.data;
  },

  // 모든 대화 세션 조회
  getAllConversations: async (status?: string): Promise<AIConversation[]> => {
    const response = await aiAxios.get('/admin/ai-conversations', {
      params: { status },
    });
    return response.data;
  },

  // 특정 대화 세션 조회
  getConversationById: async (id: string): Promise<AIConversation> => {
    const response = await aiAxios.get(`/admin/ai-conversations/${id}`);
    return response.data;
  },

  // AI에게 메시지 전송
  sendMessage: async (
    id: string,
    message: string
  ): Promise<{
    userMessage: ConversationMessage;
    aiResponse: ConversationMessage;
  }> => {
    const response = await aiAxios.post(`/admin/ai-conversations/${id}/messages`, {
      message,
    });
    return response.data;
  },

  // 대화 기반 기사 생성
  generateArticle: async (
    id: string,
    customInstructions?: string
  ): Promise<{
    message: string;
    draftArticle: DraftArticle;
  }> => {
    const response = await aiAxios.post(
      `/admin/ai-conversations/${id}/generate-article`,
      { customInstructions }
    );
    return response.data;
  },

  // 기사 수정 요청
  refineArticle: async (
    id: string,
    feedback: string
  ): Promise<{
    message: string;
    draftArticle: DraftArticle;
  }> => {
    const response = await aiAxios.post(
      `/admin/ai-conversations/${id}/refine-article`,
      { feedback }
    );
    return response.data;
  },

  // 기사 발행
  publishArticle: async (
    id: string,
    finalArticle?: DraftArticle
  ): Promise<{
    message: string;
    article: any;
    conversationId: string;
    status: string;
  }> => {
    const response = await aiAxios.post(`/admin/ai-conversations/${id}/publish`, {
      finalArticle,
    });
    return response.data;
  },

  // 대화 세션 삭제
  deleteConversation: async (id: string): Promise<void> => {
    await aiAxios.delete(`/admin/ai-conversations/${id}`);
  },
};

// Draft 아티클 관리 (관리자 전용)
export const draftApi = {
  // Draft 목록 조회
  getDrafts: async (): Promise<any[]> => {
    const response = await aiAxios.get('/admin/drafts');
    return response.data;
  },

  // Draft 승인
  approveDraft: async (id: string): Promise<{ message: string; article: any }> => {
    const response = await aiAxios.post(`/admin/drafts/${id}/approve`);
    return response.data;
  },

  // Draft 거부
  rejectDraft: async (id: string): Promise<{ message: string }> => {
    const response = await aiAxios.delete(`/admin/drafts/${id}/reject`);
    return response.data;
  },
};
