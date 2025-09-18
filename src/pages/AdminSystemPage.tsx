import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { adminApi, SystemHealth } from '../services/adminApi';
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

const RefreshButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 500;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing['4xl']};
`;

const StatusCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const CardTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;

const StatusItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const StatusLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;

const StatusValue = styled.span<{ status?: 'healthy' | 'warning' | 'error' }>`
  font-weight: 600;
  color: ${({ status, theme }) => {
    switch (status) {
      case 'healthy':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  }};
`;

const HealthIndicator = styled.div<{ healthy: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  background: ${({ healthy, theme }) =>
    healthy ? theme.colors.success + '20' : theme.colors.error + '20'};
  color: ${({ healthy, theme }) =>
    healthy ? theme.colors.success : theme.colors.error};

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
  }
`;

const MemoryBar = styled.div`
  background: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  height: 8px;
  overflow: hidden;
`;

const MemoryFill = styled.div<{ percentage: number }>`
  background: ${({ percentage, theme }) => {
    if (percentage > 80) return theme.colors.error;
    if (percentage > 60) return theme.colors.warning;
    return theme.colors.success;
  }};
  height: 100%;
  width: ${({ percentage }) => percentage}%;
  transition: width 0.3s ease;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const MetricCard = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const MetricValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const MetricLabel = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']} 0;
  color: ${({ theme }) => theme.colors.error};
`;

const LastUpdated = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const AdminSystemPage: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSystemHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminApi.getSystemHealth();
      setSystemHealth(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : '시스템 상태를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemHealth();
    // 30초마다 자동 새로고침
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}일 ${hours}시간`;
    if (hours > 0) return `${hours}시간 ${minutes}분`;
    return `${minutes}분`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getMemoryUsagePercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100);
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <Container>
        <ErrorContainer>{error}</ErrorContainer>
      </Container>
    );
  }

  if (!systemHealth) return null;

  const memoryUsagePercentage = getMemoryUsagePercentage(
    systemHealth.memory.heapUsed,
    systemHealth.memory.heapTotal
  );

  return (
    <Container>
      <Header>
        <Title>시스템 모니터링</Title>
        <RefreshButton onClick={fetchSystemHealth} disabled={loading}>
          새로고침
        </RefreshButton>
      </Header>

      <StatusGrid>
        <StatusCard>
          <CardTitle>전체 상태</CardTitle>
          <StatusItem>
            <StatusLabel>시스템 상태</StatusLabel>
            <HealthIndicator healthy={systemHealth.status === 'healthy'}>
              {systemHealth.status === 'healthy' ? '정상' : '오류'}
            </HealthIndicator>
          </StatusItem>
          <StatusItem>
            <StatusLabel>가동 시간</StatusLabel>
            <StatusValue>{formatUptime(systemHealth.uptime)}</StatusValue>
          </StatusItem>
          <StatusItem>
            <StatusLabel>버전</StatusLabel>
            <StatusValue>{systemHealth.version}</StatusValue>
          </StatusItem>
        </StatusCard>

        <StatusCard>
          <CardTitle>데이터베이스</CardTitle>
          <StatusItem>
            <StatusLabel>연결 상태</StatusLabel>
            <HealthIndicator healthy={systemHealth.database.connected}>
              {systemHealth.database.status}
            </HealthIndicator>
          </StatusItem>
          <StatusItem>
            <StatusLabel>아티클 수</StatusLabel>
            <StatusValue>{systemHealth.collections.articles}</StatusValue>
          </StatusItem>
          <StatusItem>
            <StatusLabel>사용자 수</StatusLabel>
            <StatusValue>{systemHealth.collections.users}</StatusValue>
          </StatusItem>
        </StatusCard>

        <StatusCard>
          <CardTitle>메모리 사용량</CardTitle>
          <StatusItem>
            <StatusLabel>힙 사용량</StatusLabel>
            <div style={{ flex: 1, marginLeft: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>{formatBytes(systemHealth.memory.heapUsed)}</span>
                <span>{formatBytes(systemHealth.memory.heapTotal)}</span>
              </div>
              <MemoryBar>
                <MemoryFill percentage={memoryUsagePercentage} />
              </MemoryBar>
            </div>
          </StatusItem>
          <StatusItem>
            <StatusLabel>RSS</StatusLabel>
            <StatusValue>{formatBytes(systemHealth.memory.rss)}</StatusValue>
          </StatusItem>
          <StatusItem>
            <StatusLabel>External</StatusLabel>
            <StatusValue>{formatBytes(systemHealth.memory.external)}</StatusValue>
          </StatusItem>
        </StatusCard>
      </StatusGrid>

      <StatusCard>
        <CardTitle>시스템 메트릭</CardTitle>
        <MetricGrid>
          <MetricCard>
            <MetricValue>{systemHealth.collections.articles}</MetricValue>
            <MetricLabel>총 아티클</MetricLabel>
          </MetricCard>
          <MetricCard>
            <MetricValue>{systemHealth.collections.users}</MetricValue>
            <MetricLabel>총 사용자</MetricLabel>
          </MetricCard>
          <MetricCard>
            <MetricValue>{memoryUsagePercentage}%</MetricValue>
            <MetricLabel>메모리 사용률</MetricLabel>
          </MetricCard>
          <MetricCard>
            <MetricValue>{formatUptime(systemHealth.uptime)}</MetricValue>
            <MetricLabel>가동 시간</MetricLabel>
          </MetricCard>
        </MetricGrid>
      </StatusCard>

      {lastUpdated && (
        <LastUpdated>
          마지막 업데이트: {lastUpdated.toLocaleString()}
        </LastUpdated>
      )}
    </Container>
  );
};

export default AdminSystemPage;