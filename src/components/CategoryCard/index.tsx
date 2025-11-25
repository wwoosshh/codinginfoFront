import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Category } from '../../types';

interface CardProps {
  $color: string;
}

const Card = styled(Link)<CardProps>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  text-decoration: none;
  color: inherit;
  transition: ${({ theme }) => theme.transitions.normal};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateX(4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-color: ${({ theme }) => theme.colors.borderHover};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 4px;
    background: ${({ $color }) => $color};
    transition: ${({ theme }) => theme.transitions.normal};
  }

  &:hover::before {
    width: 6px;
  }
`;

const CategoryIcon = styled.div<{ color: string }>`
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: linear-gradient(135deg, ${({ color }) => color}15 0%, ${({ color }) => color}25 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: ${({ color }) => color};
  border: 2px solid ${({ color }) => color}30;
`;

const ContentWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const CategoryTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text};
`;

const CategoryDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ArrowIcon = styled.div`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  transition: ${({ theme }) => theme.transitions.fast};

  ${Card}:hover & {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    transform: translateX(2px);
  }
`;

const getIconForCategory = (categoryKey: string): string => {
  const icons: Record<string, string> = {
    OVERFLOW: '⚠️',
    GAME_DEVELOPMENT: '🎮',
    GRAPHICS: '🎨',
    ALGORITHM: '🧠',
    WEB_DEVELOPMENT: '🌐',
    DATA_STRUCTURE: '📊',
  };
  return icons[categoryKey] || '📝';
};

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Card to={`/category/${category.key}`} $color={category.color}>
      <CategoryIcon color={category.color}>
        {getIconForCategory(category.key)}
      </CategoryIcon>

      <ContentWrapper>
        <CategoryTitle>{category.displayName}</CategoryTitle>
        <CategoryDescription>{category.description}</CategoryDescription>
      </ContentWrapper>

      <ArrowIcon>
        →
      </ArrowIcon>
    </Card>
  );
};

export default CategoryCard;