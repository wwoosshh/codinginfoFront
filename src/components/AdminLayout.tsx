import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const Sidebar = styled.aside`
  width: 250px;
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const SidebarTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ $active }) => $active ? '600' : '500'};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary + '10' : 'transparent'};
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text};
  }

  &::before {
    content: '${({ children }) => {
      if (typeof children === 'string') {
        if (children.includes('대시보드')) return '📊';
        if (children.includes('사용자')) return '👥';
        if (children.includes('아티클')) return '📝';
        if (children.includes('카테고리')) return '📂';
        if (children.includes('이미지')) return '🖼️';
        if (children.includes('시스템')) return '⚙️';
      }
      return '•';
    }}';
    margin-right: ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
`;

const MobileHeader = styled.div`
  display: none;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: block;
  }
`;

const MobileTitle = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;

const BackToSite = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text};
  }

  &::before {
    content: '←';
    margin-right: ${({ theme }) => theme.spacing.sm};
  }
`;

const AdminLayout: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    return location.pathname.startsWith(path) && path !== '/admin';
  };

  return (
    <Container>
      <Sidebar>
        <BackToSite to="/">메인 사이트로 돌아가기</BackToSite>

        <SidebarTitle>관리자 패널</SidebarTitle>

        <NavList>
          <NavItem>
            <NavLink to="/admin" $active={isActive('/admin')}>
              대시보드
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/admin/users" $active={isActive('/admin/users')}>
              사용자 관리
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/admin/articles" $active={isActive('/admin/articles')}>
              아티클 관리
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/admin/categories" $active={isActive('/admin/categories')}>
              카테고리 관리
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/admin/images" $active={isActive('/admin/images')}>
              이미지 관리
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/admin/system" $active={isActive('/admin/system')}>
              시스템 모니터링
            </NavLink>
          </NavItem>
        </NavList>
      </Sidebar>

      <MainContent>
        <MobileHeader>
          <MobileTitle>관리자 패널</MobileTitle>
        </MobileHeader>
        <Outlet />
      </MainContent>
    </Container>
  );
};

export default AdminLayout;