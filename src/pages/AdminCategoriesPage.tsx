import React, { useState } from 'react';
import styled from 'styled-components';
import { Category, CategoryInfo, categoryInfoMap } from '../types';

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

const AddButton = styled.button`
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
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
`;

const CategoryCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  position: relative;
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const CategoryBadge = styled.div<{ color: string }>`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: linear-gradient(135deg, ${({ color }) => color}20 0%, ${({ color }) => color}30 100%);
  color: ${({ color }) => color};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  border: 2px solid ${({ color }) => color}40;
  white-space: nowrap;
`;

const CategoryActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ActionButton = styled.button<{ variant?: 'danger' }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 500;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};

  background: ${({ variant, theme }) =>
    variant === 'danger' ? theme.colors.error : theme.colors.primary};
  color: white;

  &:hover {
    opacity: 0.8;
  }
`;

const CategoryTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  color: ${({ theme }) => theme.colors.text};
`;

const CategoryDescription = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

const CategoryKey = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-family: ${({ theme }) => theme.fonts.code};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Modal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
  color: ${({ theme }) => theme.colors.text};
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ColorInput = styled.input`
  width: 60px;
  height: 40px;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const Button = styled.button<{ variant?: 'secondary' }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: ${({ variant, theme }) =>
    variant === 'secondary'
      ? `1px solid ${theme.colors.border}`
      : 'none'};
  background: ${({ variant, theme }) =>
    variant === 'secondary'
      ? theme.colors.surface
      : theme.colors.primary};
  color: ${({ variant, theme }) =>
    variant === 'secondary'
      ? theme.colors.text
      : 'white'};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 500;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ variant, theme }) =>
      variant === 'secondary'
        ? theme.colors.surfaceHover
        : theme.colors.primaryDark};
  }
`;

const InfoBox = styled.div`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

interface CategoryFormData {
  key: string;
  displayName: string;
  description: string;
  color: string;
}

const AdminCategoriesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    key: '',
    displayName: '',
    description: '',
    color: '#2563eb',
  });

  const handleOpenModal = (category?: CategoryInfo) => {
    if (category) {
      setEditingCategory(category.key);
      setFormData({
        key: category.key,
        displayName: category.displayName,
        description: category.description,
        color: category.color,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        key: '',
        displayName: '',
        description: '',
        color: '#2563eb',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 백엔드 API 연동 시 실제 저장 로직 구현
    console.log('Category data:', formData);
    alert(`카테고리 ${editingCategory ? '수정' : '생성'} 기능은 백엔드 API 연동 후 구현됩니다.`);
    handleCloseModal();
  };

  const handleDelete = (categoryKey: Category) => {
    if (window.confirm(`카테고리 "${categoryInfoMap[categoryKey].displayName}"를 삭제하시겠습니까?`)) {
      // TODO: 백엔드 API 연동 시 실제 삭제 로직 구현
      alert('카테고리 삭제 기능은 백엔드 API 연동 후 구현됩니다.');
    }
  };

  return (
    <Container>
      <Header>
        <Title>카테고리 관리</Title>
        <AddButton onClick={() => handleOpenModal()}>
          새 카테고리 추가
        </AddButton>
      </Header>

      <InfoBox>
        💡 현재는 정적 카테고리 관리만 가능합니다. 백엔드 API 연동 후 실제 CRUD 기능이 구현됩니다.
      </InfoBox>

      <CategoriesGrid>
        {Object.values(categoryInfoMap).map((category) => (
          <CategoryCard key={category.key}>
            <CategoryHeader>
              <CategoryBadge color={category.color}>
                {category.displayName}
              </CategoryBadge>
              <CategoryActions>
                <ActionButton onClick={() => handleOpenModal(category)}>
                  수정
                </ActionButton>
                <ActionButton
                  variant="danger"
                  onClick={() => handleDelete(category.key)}
                >
                  삭제
                </ActionButton>
              </CategoryActions>
            </CategoryHeader>

            <CategoryTitle>{category.displayName}</CategoryTitle>
            <CategoryDescription>{category.description}</CategoryDescription>
            <CategoryKey>Key: {category.key}</CategoryKey>
          </CategoryCard>
        ))}
      </CategoriesGrid>

      <Modal $isOpen={isModalOpen} onClick={(e) => e.target === e.currentTarget && handleCloseModal()}>
        <ModalContent>
          <ModalTitle>
            {editingCategory ? '카테고리 수정' : '새 카테고리 추가'}
          </ModalTitle>

          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="key">카테고리 키</Label>
              <Input
                id="key"
                type="text"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                placeholder="예: NEW_CATEGORY"
                disabled={!!editingCategory}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="displayName">표시 이름</Label>
              <Input
                id="displayName"
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="예: 새로운 카테고리"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="카테고리에 대한 설명을 입력하세요"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="color">테마 색상</Label>
              <ColorInput
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </FormGroup>

            <ModalActions>
              <Button type="button" variant="secondary" onClick={handleCloseModal}>
                취소
              </Button>
              <Button type="submit">
                {editingCategory ? '수정' : '생성'}
              </Button>
            </ModalActions>
          </form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AdminCategoriesPage;