import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Article, Category } from '../types';
import { articleApi, categoryApi } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0 ${({ theme }) => theme.spacing.md};
  }
`;

const CategoryHeader = styled.header`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['4xl']};
`;

const CategoryBadge = styled.div<{ color: string }>`
  display: inline-block;
  background: linear-gradient(135deg, ${({ color }) => color}15 0%, ${({ color }) => color}25 100%);
  color: ${({ color }) => color};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  border: 2px solid ${({ color }) => color}30;
`;

const CategoryTitle = styled.h1`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const CategoryDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 600px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl};
  line-height: 1.6;
`;

const ArticleCount = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;

const ArticlesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
`;

const NoArticles = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']} 0;
  color: ${({ theme }) => theme.colors.textSecondary};
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

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!category) {
        setError('유효하지 않은 카테고리입니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 카테고리 정보와 아티클을 병렬로 가져오기
        const [categoriesResult, articlesResult] = await Promise.all([
          categoryApi.getAllCategories(),
          articleApi.getArticlesByCategory(category)
        ]);

        // 현재 카테고리 정보 찾기
        const currentCategory = categoriesResult.find(cat => cat.key === category.toUpperCase());
        if (!currentCategory) {
          setError('유효하지 않은 카테고리입니다.');
          setLoading(false);
          return;
        }

        setCategoryInfo(currentCategory);
        setArticles(articlesResult.articles);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category]);

  if (loading) return <LoadingSpinner />;

  if (error || !categoryInfo) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorTitle>오류가 발생했습니다</ErrorTitle>
          <ErrorMessage>
            {error || '존재하지 않는 카테고리입니다.'}
          </ErrorMessage>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <CategoryHeader>
        <CategoryBadge color={categoryInfo.color}>
          {categoryInfo.displayName}
        </CategoryBadge>
        <CategoryTitle>{categoryInfo.displayName}</CategoryTitle>
        <CategoryDescription>{categoryInfo.description}</CategoryDescription>
        <ArticleCount>총 {articles.length}개의 아티클</ArticleCount>
      </CategoryHeader>

      {articles.length > 0 ? (
        <ArticlesGrid>
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </ArticlesGrid>
      ) : (
        <NoArticles>
          <h3>아직 이 카테고리에 아티클이 없습니다</h3>
          <p>곧 흥미로운 내용들을 추가할 예정입니다.</p>
        </NoArticles>
      )}
    </Container>
  );
};

export default CategoryPage;