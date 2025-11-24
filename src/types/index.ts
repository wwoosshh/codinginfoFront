export interface Article {
  _id: string;
  title: string;
  description: string;
  content: string;
  category: string; // 카테고리 키 (예: 'ALGORITHM')
  categoryDisplayName?: string; // 백엔드에서 추가되는 표시 이름
  categoryColor?: string; // 백엔드에서 추가되는 색상
  slug: string;
  status: 'draft' | 'published' | 'archived';
  author: {
    _id: string;
    username: string;
  };
  tags: string[];
  viewCount: number;
  publishedAt?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleListResponse {
  articles: Article[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalArticles: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface Category {
  _id: string;
  key: string;
  displayName: string;
  description: string;
  color: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// AI 관련 타입
export enum AIProviderType {
  GEMINI = 'gemini',
  OPENAI = 'openai',
  CLAUDE = 'claude',
}

export interface ProviderConfig {
  hasApiKey: boolean;
  apiKeyMasked: string | null;
  enabled: boolean;
  lastTested?: string;
  lastTestSuccess?: boolean;
}

export interface AIConfiguration {
  defaultProvider: AIProviderType;
  providers: {
    gemini?: ProviderConfig;
    openai?: ProviderConfig;
    claude?: ProviderConfig;
  };
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface DraftArticle {
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl?: string;
}

export enum ConversationStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface AIConversation {
  _id: string;
  title: string;
  status: ConversationStatus;
  aiProvider: AIProviderType;
  messages: ConversationMessage[];
  draftArticle?: DraftArticle;
  publishedArticleId?: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}