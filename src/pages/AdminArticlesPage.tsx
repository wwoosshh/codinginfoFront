import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { adminApi, AdminArticleListResponse } from '../services/adminApi';
import { Article, ArticleStatus, Category, categoryInfoMap } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    width: 100%;
  }
`;

const SearchInput = styled.input`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  min-width: 250px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 100%;
    min-width: unset;
  }
`;

const FilterSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: white;
  font-size: ${({ theme }) => theme.fontSizes.sm};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ArticlesTable = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
`;

const TableHeader = styled.th`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const TableRow = styled.tr`
  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
`;

const ArticleTitle = styled.div`
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ArticleDescription = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  background: ${({ status, theme }) => {
    switch (status) {
      case 'published':
        return theme.colors.success + '20';
      case 'draft':
        return theme.colors.warning + '20';
      case 'archived':
        return theme.colors.error + '20';
      default:
        return theme.colors.textMuted + '20';
    }
  }};
  color: ${({ status, theme }) => {
    switch (status) {
      case 'published':
        return theme.colors.success;
      case 'draft':
        return theme.colors.warning;
      case 'archived':
        return theme.colors.error;
      default:
        return theme.colors.textMuted;
    }
  }};
`;

const CategoryBadge = styled.span<{ color: string }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  background: ${({ color }) => color + '20'};
  color: ${({ color }) => color};
`;

const ActionButton = styled.button<{ variant?: 'danger' | 'warning' | 'success' }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 500;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  margin-right: ${({ theme }) => theme.spacing.xs};

  background: ${({ variant, theme }) => {
    switch (variant) {
      case 'danger':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'success':
        return theme.colors.success;
      default:
        return theme.colors.primary;
    }
  }};

  color: white;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const PageButton = styled.button<{ active?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ active, theme }) =>
    active ? theme.colors.primary : 'white'};
  color: ${({ active, theme }) =>
    active ? 'white' : theme.colors.text};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${({ active, theme }) =>
      active ? theme.colors.primaryDark : theme.colors.surfaceHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']} 0;
  color: ${({ theme }) => theme.colors.error};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']} 0;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const AdminArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<AdminArticleListResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchArticles = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { page, limit: 10 };
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;

      const result = await adminApi.getAllArticles(params);
      setArticles(result.articles);
      setPagination(result.pagination);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : '아티클 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(1);
  }, [searchQuery, categoryFilter, statusFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusChange = async (articleId: string, newStatus: ArticleStatus) => {
    try {
      await adminApi.updateArticleStatus(articleId, newStatus);
      fetchArticles(currentPage);
    } catch (err) {
      alert(err instanceof Error ? err.message : '아티클 상태 변경에 실패했습니다.');
    }
  };

  const handleDeleteArticle = async (articleId: string, title: string) => {
    if (!window.confirm(`아티클 "${title}"를 삭제하시겠습니까?`)) return;

    try {
      await adminApi.deleteArticle(articleId);
      fetchArticles(currentPage);
    } catch (err) {
      alert(err instanceof Error ? err.message : '아티클 삭제에 실패했습니다.');
    }
  };

  const handlePageChange = (page: number) => {
    fetchArticles(page);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return '발행됨';
      case 'draft':
        return '초안';
      case 'archived':
        return '보관됨';
      default:
        return status;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container>
      <Header>
        <Title>아티클 관리</Title>
        <Controls>
          <SearchInput
            type="text"
            placeholder="제목 또는 설명 검색..."
            value={searchQuery}
            onChange={handleSearch}
          />
          <FilterSelect value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">모든 카테고리</option>
            {Object.values(categoryInfoMap).map((category) => (
              <option key={category.key} value={category.key}>
                {category.displayName}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">모든 상태</option>
            <option value="published">발행됨</option>
            <option value="draft">초안</option>
            <option value="archived">보관됨</option>
          </FilterSelect>
        </Controls>
      </Header>

      {error ? (
        <ErrorContainer>{error}</ErrorContainer>
      ) : articles.length === 0 ? (
        <EmptyState>검색 조건에 맞는 아티클이 없습니다.</EmptyState>
      ) : (
        <>
          <ArticlesTable>
            <Table>
              <thead>
                <tr>
                  <TableHeader>제목</TableHeader>
                  <TableHeader>작성자</TableHeader>
                  <TableHeader>카테고리</TableHeader>
                  <TableHeader>상태</TableHeader>
                  <TableHeader>조회수</TableHeader>
                  <TableHeader>작성일</TableHeader>
                  <TableHeader>작업</TableHeader>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <TableRow key={article._id}>
                    <TableCell>
                      <ArticleTitle>{article.title}</ArticleTitle>
                      <ArticleDescription>{article.description}</ArticleDescription>
                    </TableCell>
                    <TableCell>
                      {article.author?.username || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <CategoryBadge color={categoryInfoMap[article.category as Category]?.color || '#gray'}>
                        {article.categoryDisplayName}
                      </CategoryBadge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={article.status}>
                        {getStatusText(article.status)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>{article.viewCount}</TableCell>
                    <TableCell>
                      {new Date(article.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {article.status === 'draft' && (
                        <ActionButton
                          variant="success"
                          onClick={() => handleStatusChange(article._id, ArticleStatus.PUBLISHED)}
                        >
                          발행
                        </ActionButton>
                      )}
                      {article.status === 'published' && (
                        <ActionButton
                          variant="warning"
                          onClick={() => handleStatusChange(article._id, ArticleStatus.ARCHIVED)}
                        >
                          보관
                        </ActionButton>
                      )}
                      {article.status === 'archived' && (
                        <ActionButton
                          onClick={() => handleStatusChange(article._id, ArticleStatus.PUBLISHED)}
                        >
                          복원
                        </ActionButton>
                      )}
                      <ActionButton
                        variant="danger"
                        onClick={() => handleDeleteArticle(article._id, article.title)}
                      >
                        삭제
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </ArticlesTable>

          {pagination && pagination.totalPages > 1 && (
            <Pagination>
              <PageButton
                disabled={!pagination.hasPrevPage}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                이전
              </PageButton>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <PageButton
                  key={page}
                  active={page === currentPage}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </PageButton>
              ))}

              <PageButton
                disabled={!pagination.hasNextPage}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                다음
              </PageButton>
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

export default AdminArticlesPage;