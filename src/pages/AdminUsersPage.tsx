import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { adminApi, AdminUser, AdminUserListResponse } from '../services/adminApi';
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

const UsersTable = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
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

const StatusBadge = styled.span<{ status: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  background: ${({ status, theme }) =>
    status ? theme.colors.success + '20' : theme.colors.error + '20'};
  color: ${({ status, theme }) =>
    status ? theme.colors.success : theme.colors.error};
`;

const RoleBadge = styled.span<{ role: string }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  background: ${({ role, theme }) =>
    role === 'admin' ? theme.colors.primary + '20' : theme.colors.secondary + '20'};
  color: ${({ role, theme }) =>
    role === 'admin' ? theme.colors.primary : theme.colors.secondary};
`;

const ActionButton = styled.button<{ variant?: 'danger' | 'warning' }>`
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

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<AdminUserListResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { page, limit: 10 };
      if (searchQuery) params.search = searchQuery;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const result = await adminApi.getAllUsers(params);
      setUsers(result.users);
      setPagination(result.pagination);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : '사용자 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [searchQuery, roleFilter, statusFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await adminApi.updateUserStatus(userId, !currentStatus);
      fetchUsers(currentPage);
    } catch (err) {
      alert(err instanceof Error ? err.message : '사용자 상태 변경에 실패했습니다.');
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!window.confirm(`사용자 "${username}"를 삭제하시겠습니까?`)) return;

    try {
      await adminApi.deleteUser(userId);
      fetchUsers(currentPage);
    } catch (err) {
      alert(err instanceof Error ? err.message : '사용자 삭제에 실패했습니다.');
    }
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container>
      <Header>
        <Title>사용자 관리</Title>
        <Controls>
          <SearchInput
            type="text"
            placeholder="사용자명 또는 이메일 검색..."
            value={searchQuery}
            onChange={handleSearch}
          />
          <FilterSelect value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">모든 역할</option>
            <option value="admin">관리자</option>
            <option value="user">일반 사용자</option>
          </FilterSelect>
          <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">모든 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </FilterSelect>
        </Controls>
      </Header>

      {error ? (
        <ErrorContainer>{error}</ErrorContainer>
      ) : users.length === 0 ? (
        <EmptyState>검색 조건에 맞는 사용자가 없습니다.</EmptyState>
      ) : (
        <>
          <UsersTable>
            <Table>
              <thead>
                <tr>
                  <TableHeader>사용자명</TableHeader>
                  <TableHeader>이메일</TableHeader>
                  <TableHeader>역할</TableHeader>
                  <TableHeader>상태</TableHeader>
                  <TableHeader>가입일</TableHeader>
                  <TableHeader>작업</TableHeader>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <RoleBadge role={user.role}>
                        {user.role === 'admin' ? '관리자' : '일반 사용자'}
                      </RoleBadge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.isActive}>
                        {user.isActive ? '활성' : '비활성'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {user.role !== 'admin' && (
                        <>
                          <ActionButton
                            variant={user.isActive ? 'warning' : undefined}
                            onClick={() => handleStatusToggle(user._id, user.isActive)}
                          >
                            {user.isActive ? '비활성화' : '활성화'}
                          </ActionButton>
                          <ActionButton
                            variant="danger"
                            onClick={() => handleDeleteUser(user._id, user.username)}
                          >
                            삭제
                          </ActionButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </UsersTable>

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

export default AdminUsersPage;