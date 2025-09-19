import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { Article } from '../types';
import { articleApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import MarkdownRenderer from '../components/MarkdownRenderer';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0 ${({ theme }) => theme.spacing.md};
  }
`;

const ArticleHeader = styled.header`
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};
  text-align: center;
`;

const CategoryBadge = styled.span<{ color: string }>`
  display: inline-block;
  background-color: ${({ color }) => color}15;
  color: ${({ color }) => color};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h1`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  line-height: 1.2;
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ArticleMeta = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const ArticleImage = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const ContentWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing['2xl']};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.xl};
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']} 0;
`;

const ErrorTitle = styled.h2`
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) {
        setError('잘못된 URL입니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await articleApi.getArticleBySlug(slug);
        setArticle(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : '아티클을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorTitle>오류가 발생했습니다</ErrorTitle>
          <ErrorMessage>{error}</ErrorMessage>
        </ErrorContainer>
      </Container>
    );
  }

  if (!article) {
    return <Navigate to="/" replace />;
  }

  const formattedDate = new Date(article.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Container>
      <ArticleHeader>
        <CategoryBadge color={article.categoryColor || '#6b7280'}>
          {article.categoryDisplayName || article.category}
        </CategoryBadge>
        <Title>{article.title}</Title>
        <Description>{article.description}</Description>
        <ArticleMeta>
          <span>작성일: {formattedDate}</span>
          {article.updatedAt && article.updatedAt !== article.createdAt && (
            <span>
              수정일: {new Date(article.updatedAt).toLocaleDateString('ko-KR')}
            </span>
          )}
        </ArticleMeta>
      </ArticleHeader>

      {article.imageUrl && (
        <ArticleImage src={article.imageUrl} alt={article.title} />
      )}

      <ContentWrapper>
        <MarkdownRenderer content={article.content} />
      </ContentWrapper>
    </Container>
  );
};

export default ArticlePage;