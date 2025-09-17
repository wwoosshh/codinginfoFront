import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { CategoryInfo } from '../../types';

interface CardProps {
  $color: string;
}

const Card = styled(Link)<CardProps>`
  display: block;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing['2xl']};
  text-decoration: none;
  color: inherit;
  transition: ${({ theme }) => theme.transitions.normal};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.xl};
    border-color: ${({ theme }) => theme.colors.borderHover};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ $color }) => $color};
    transition: ${({ theme }) => theme.transitions.normal};
  }

  &:hover::before {
    height: 6px;
  }
`;

const CategoryIcon = styled.div<{ color: string }>`
  width: 60px;
  height: 60px;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  background: linear-gradient(135deg, ${({ color }) => color}15 0%, ${({ color }) => color}25 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-size: 24px;
  color: ${({ color }) => color};
  border: 2px solid ${({ color }) => color}30;
`;

const CategoryTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
`;

const CategoryDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ExploreText = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
  
  &::after {
    content: '→';
    font-size: ${({ theme }) => theme.fontSizes.lg};
    transition: ${({ theme }) => theme.transitions.fast};
  }
  
  ${Card}:hover & {
    &::after {
      transform: translateX(4px);
    }
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
  category: CategoryInfo;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Card to={`/category/${category.key}`} $color={category.color}>
      <CategoryIcon color={category.color}>
        {getIconForCategory(category.key)}
      </CategoryIcon>
      
      <CategoryTitle>{category.displayName}</CategoryTitle>
      <CategoryDescription>{category.description}</CategoryDescription>
      
      <ExploreText>
        탐험하기
      </ExploreText>
    </Card>
  );
};

export default CategoryCard;