export interface Article {
  _id: string;
  title: string;
  description: string;
  content: string;
  category: Category;
  categoryDisplayName: string;
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

export enum Category {
  OVERFLOW = 'OVERFLOW',
  GAME_DEVELOPMENT = 'GAME_DEVELOPMENT',
  GRAPHICS = 'GRAPHICS',
  ALGORITHM = 'ALGORITHM',
  WEB_DEVELOPMENT = 'WEB_DEVELOPMENT',
  DATA_STRUCTURE = 'DATA_STRUCTURE',
}

export interface CategoryInfo {
  key: Category;
  displayName: string;
  description: string;
  color: string;
}

export const categoryInfoMap: Record<Category, CategoryInfo> = {
  [Category.OVERFLOW]: {
    key: Category.OVERFLOW,
    displayName: '오버플로우',
    description: '데이터 타입의 범위를 벗어나는 현상들',
    color: '#ef4444',
  },
  [Category.GAME_DEVELOPMENT]: {
    key: Category.GAME_DEVELOPMENT,
    displayName: '게임 개발',
    description: '게임 프로그래밍의 흥미로운 현상들',
    color: '#8b5cf6',
  },
  [Category.GRAPHICS]: {
    key: Category.GRAPHICS,
    displayName: '그래픽스',
    description: '컴퓨터 그래픽스의 원리와 기법',
    color: '#06b6d4',
  },
  [Category.ALGORITHM]: {
    key: Category.ALGORITHM,
    displayName: '알고리즘',
    description: '효율적인 문제 해결 방법들',
    color: '#10b981',
  },
  [Category.WEB_DEVELOPMENT]: {
    key: Category.WEB_DEVELOPMENT,
    displayName: '웹 개발',
    description: '웹 기술의 동작 원리',
    color: '#f59e0b',
  },
  [Category.DATA_STRUCTURE]: {
    key: Category.DATA_STRUCTURE,
    displayName: '자료구조',
    description: '데이터를 효율적으로 저장하고 조작하는 방법',
    color: '#ec4899',
  },
};