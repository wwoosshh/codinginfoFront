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