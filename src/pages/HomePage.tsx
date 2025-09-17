import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { Article, categoryInfoMap } from '../types';
import { articleApi } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import CategoryCard from '../components/CategoryCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0 ${({ theme }) => theme.spacing.md};
  }
`;

const HeroSection = styled.section`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['4xl']};
`;

const HeroTitle = styled.h1`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.accent} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeroDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 600px;
  margin: 0 auto;
`;

const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing['4xl']};
`;

const SectionTitle = styled.h2`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  text-align: center;
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing['4xl']};
`;

const ArticlesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
`;

const SearchResultsText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;

const NoResults = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['3xl']} 0;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const HomePage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let result: Article[];
        if (searchQuery) {
          result = await articleApi.searchArticles(searchQuery);
        } else {
          result = await articleApi.getAllArticles();
        }
        
        setArticles(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [searchQuery]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <Container>
        <NoResults>
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
        </NoResults>
      </Container>
    );
  }

  return (
    <Container>
      {!searchQuery && (
        <>
          <HeroSection>
            <HeroTitle>코딩의 신비로운 현상들</HeroTitle>
            <HeroDescription>
              일상에서 만나는 프로그래밍 현상들을 쉽고 재미있게 설명합니다.
              오버플로우부터 게임 물리학까지, 코딩 세계의 흥미로운 이야기들을 만나보세요.
            </HeroDescription>
          </HeroSection>

          <Section>
            <SectionTitle>카테고리별 탐험</SectionTitle>
            <CategoriesGrid>
              {Object.values(categoryInfoMap).map((category) => (
                <CategoryCard key={category.key} category={category} />
              ))}
            </CategoriesGrid>
          </Section>
        </>
      )}

      <Section>
        {searchQuery ? (
          <SearchResultsText>
            "{searchQuery}"에 대한 검색 결과 ({articles.length}개)
          </SearchResultsText>
        ) : (
          <SectionTitle>최신 아티클</SectionTitle>
        )}
        
        {articles.length > 0 ? (
          <ArticlesGrid>
            {articles.map((article) => (
              <ArticleCard key={article.id || article._id} article={article} />
            ))}
          </ArticlesGrid>
        ) : (
          <NoResults>
            {searchQuery ? (
              <>
                <h3>검색 결과가 없습니다</h3>
                <p>다른 키워드로 검색해 보세요.</p>
              </>
            ) : (
              <>
                <h3>아직 게시된 아티클이 없습니다</h3>
                <p>곧 흥미로운 내용들을 추가할 예정입니다.</p>
              </>
            )}
          </NoResults>
        )}
      </Section>
    </Container>
  );
};

export default HomePage;