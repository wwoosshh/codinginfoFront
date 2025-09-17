import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Article, categoryInfoMap } from '../../types';

const Card = styled(Link)`
  display: block;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  text-decoration: none;
  color: inherit;
  transition: ${({ theme }) => theme.transitions.normal};
  height: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-color: ${({ theme }) => theme.colors.borderHover};
  }
`;

const CardHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const CategoryBadge = styled.span<{ color: string }>`
  display: inline-block;
  background-color: ${({ color }) => color}15;
  color: ${({ color }) => color};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CardContent = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const CreatedDate = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const ReadMore = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
  
  &::after {
    content: ' →';
    transition: ${({ theme }) => theme.transitions.fast};
  }
  
  ${Card}:hover & {
    &::after {
      transform: translateX(2px);
    }
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const categoryInfo = categoryInfoMap[article.category];
  const formattedDate = new Date(article.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card to={`/article/${article.slug}`}>
      <CardHeader>
        <CategoryBadge color={categoryInfo.color}>
          {categoryInfo.displayName}
        </CategoryBadge>
      </CardHeader>

      {article.imageUrl && (
        <CardImage src={article.imageUrl} alt={article.title} />
      )}

      <CardContent>
        <Title>{article.title}</Title>
        <Description>{article.description}</Description>
      </CardContent>

      <CardFooter>
        <CreatedDate>{formattedDate}</CreatedDate>
        <ReadMore>읽어보기</ReadMore>
      </CardFooter>
    </Card>
  );
};

export default ArticleCard;