import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { adminApi, DashboardStats } from '../services/adminApi';
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
  margin-bottom: ${({ theme }) => theme.spacing['4xl']};
`;

const Title = styled.h1`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing['4xl']};
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing['4xl']};
`;

const SectionTitle = styled.h2`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text};
`;

const RecentArticles = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const ArticleItem = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const ArticleInfo = styled.div`
  flex: 1;
`;

const ArticleTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;

const ArticleMeta = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.xs};
  }
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

const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await adminApi.getDashboardStats();
        setStats(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : '통계를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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

  if (!stats) return null;

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

  return (
    <Container>
      <Header>
        <Title>관리자 대시보드</Title>
        <Subtitle>시스템 현황과 최근 활동을 확인하세요</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatValue>{stats.articles.total}</StatValue>
          <StatLabel>전체 아티클</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.articles.published}</StatValue>
          <StatLabel>발행된 아티클</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.users.total}</StatValue>
          <StatLabel>전체 사용자</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.engagement.totalViews}</StatValue>
          <StatLabel>총 조회수</StatLabel>
        </StatCard>
      </StatsGrid>

      <Section>
        <SectionTitle>최근 아티클</SectionTitle>
        <RecentArticles>
          {stats.recentArticles.length > 0 ? (
            stats.recentArticles.map((article) => (
              <ArticleItem key={article._id}>
                <ArticleInfo>
                  <ArticleTitle>{article.title}</ArticleTitle>
                  <ArticleMeta>
                    <span>작성자: {article.author?.username || 'Unknown'}</span>
                    <span>카테고리: {article.categoryDisplayName}</span>
                    <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                  </ArticleMeta>
                </ArticleInfo>
                <StatusBadge status={article.status}>
                  {getStatusText(article.status)}
                </StatusBadge>
              </ArticleItem>
            ))
          ) : (
            <ArticleItem>
              <ArticleInfo>
                <ArticleTitle>최근 아티클이 없습니다</ArticleTitle>
              </ArticleInfo>
            </ArticleItem>
          )}
        </RecentArticles>
      </Section>
    </Container>
  );
};

export default AdminPage;