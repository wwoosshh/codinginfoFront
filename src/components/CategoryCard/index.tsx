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
  gap: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  text-decoration: none;
  color: inherit;
  transition: ${({ theme }) => theme.transitions.normal};
  position: relative;
  overflow: hidden;
  min-height: 60px;

  &:hover {
    transform: translateX(4px);
    box-shadow: ${({ theme }) => theme.shadows.md};
    border-color: ${({ theme }) => theme.colors.borderHover};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 3px;
    background: ${({ $color }) => $color};
    transition: ${({ theme }) => theme.transitions.normal};
  }

  &:hover::before {
    width: 4px;
  }
`;

const CategoryIcon = styled.div<{ color: string }>`
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: linear-gradient(135deg, ${({ color }) => color}15 0%, ${({ color }) => color}25 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: ${({ color }) => color};
  border: 1.5px solid ${({ color }) => color}30;
`;

const ContentWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const CategoryTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: 600;
  margin-bottom: 2px;
  color: ${({ theme }) => theme.colors.text};
`;

const CategoryDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.4;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ArrowIcon = styled.div`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.lg};
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