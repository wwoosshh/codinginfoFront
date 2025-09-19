import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Category, ArticleStatus } from '../types';
import { adminApi, CreateArticleData, UpdateArticleData } from '../services/adminApi';
import { categoryApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Container = styled.div`
  max-width: 1000px;
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
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

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

const HeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    width: 100%;
  }
`;

const Form = styled.form`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  background: ${({ theme }) => theme.colors.surface};
  transition: ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const Textarea = styled.textarea`
  min-height: 120px;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-family: inherit;
  resize: vertical;
  transition: ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const ContentEditor = styled.textarea`
  min-height: 400px;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-family: ${({ theme }) => theme.fonts.code};
  line-height: 1.6;
  resize: vertical;
  transition: ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const TagsInput = styled.input`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Button = styled.button<{ variant?: 'secondary' | 'danger' }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border: ${({ variant, theme }) =>
    variant === 'secondary'
      ? `1px solid ${theme.colors.border}`
      : 'none'};
  background: ${({ variant, theme }) => {
    switch (variant) {
      case 'secondary':
        return theme.colors.surface;
      case 'danger':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  }};
  color: ${({ variant, theme }) =>
    variant === 'secondary' ? theme.colors.text : 'white'};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;

  &:hover {
    background: ${({ variant, theme }) => {
      switch (variant) {
        case 'secondary':
          return theme.colors.surfaceHover;
        case 'danger':
          return theme.colors.error + 'dd';
        default:
          return theme.colors.primaryDark;
      }
    }};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  background: ${({ theme }) => theme.colors.error}10;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const InfoBox = styled.div`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

interface ArticleFormData {
  title: string;
  description: string;
  content: string;
  category: string;
  status: ArticleStatus;
  tags: string[];
  imageUrl: string;
  slug: string;
}

const AdminArticleEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id && id !== 'new');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    description: '',
    content: '',
    category: '',
    status: ArticleStatus.DRAFT,
    tags: [],
    imageUrl: '',
    slug: '',
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing && id) {
      fetchArticle(id);
    }
  }, [id, isEditing]);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAllCategories();
      setCategories(data);
      // 카테고리가 로드되면 첫 번째 카테고리를 기본값으로 설정 (새 아티클일 때만)
      if (!isEditing && data.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: data[0].key }));
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchArticle = async (articleId: string) => {
    try {
      setLoading(true);
      setError(null);
      const article = await adminApi.getArticleById(articleId);

      setFormData({
        title: article.title,
        description: article.description,
        content: article.content,
        category: article.category,
        status: article.status as ArticleStatus,
        tags: article.tags || [],
        imageUrl: article.imageUrl || '',
        slug: article.slug,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '아티클을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: !isEditing ? generateSlug(title) : prev.slug,
    }));
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.content.trim()) {
      setError('제목, 설명, 내용은 필수 입력 항목입니다.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isEditing && id) {
        const updateData: UpdateArticleData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          content: formData.content.trim(),
          category: formData.category,
          status: formData.status,
          tags: formData.tags,
          imageUrl: formData.imageUrl.trim() || undefined,
          slug: formData.slug.trim(),
        };
        await adminApi.updateArticle(id, updateData);
      } else {
        const createData: CreateArticleData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          content: formData.content.trim(),
          category: formData.category,
          status: formData.status,
          tags: formData.tags,
          imageUrl: formData.imageUrl.trim() || undefined,
          slug: formData.slug.trim(),
        };
        await adminApi.createArticle(createData);
      }

      navigate('/admin/articles');
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?')) {
      navigate('/admin/articles');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container>
      <Header>
        <Title>{isEditing ? '아티클 수정' : '새 아티클 작성'}</Title>
        <HeaderActions>
          <Button type="button" variant="secondary" onClick={handleCancel}>
            취소
          </Button>
          <Button type="submit" form="article-form" disabled={saving}>
            {saving ? '저장 중...' : (isEditing ? '수정' : '발행')}
          </Button>
        </HeaderActions>
      </Header>


      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Form id="article-form" onSubmit={handleSubmit}>
        <FormRow>
          <FormGroup>
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="아티클 제목을 입력하세요"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="slug">슬러그</Label>
            <Input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="URL에 사용될 슬러그"
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label htmlFor="category">카테고리 *</Label>
            <Select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              required
            >
              {categories.map((category) => (
                <option key={category.key} value={category.key}>
                  {category.displayName}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="status">상태</Label>
            <Select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ArticleStatus }))}
            >
              <option value={ArticleStatus.DRAFT}>초안</option>
              <option value={ArticleStatus.PUBLISHED}>발행됨</option>
              <option value={ArticleStatus.ARCHIVED}>보관됨</option>
            </Select>
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label htmlFor="description">요약 설명 *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="아티클의 간단한 설명을 입력하세요"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="imageUrl">대표 이미지 URL</Label>
          <Input
            id="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
            placeholder="https://example.com/image.jpg"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="tags">태그</Label>
          <TagsInput
            id="tags"
            type="text"
            value={formData.tags.join(', ')}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="태그를 쉼표로 구분하여 입력하세요 (예: JavaScript, React, 프론트엔드)"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="content">내용 * (Markdown 지원)</Label>
          <ContentEditor
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Markdown 형식으로 아티클 내용을 작성하세요..."
            required
          />
        </FormGroup>
      </Form>
    </Container>
  );
};

export default AdminArticleEditPage;