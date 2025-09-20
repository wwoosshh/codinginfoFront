import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { authService } from '../services/authApi';
import OptimizedImage from '../components/OptimizedImage';

interface Image {
  publicId: string;
  url: string;
  filename: string;
  size: number;
  width: number;
  height: number;
  format: string;
  createdAt: string;
  tags: string[];
  usageCount: number;
  usedInArticles: Array<{
    title: string;
    slug: string;
  }>;
}

interface ImageListResponse {
  success: boolean;
  images: Image[];
  pagination: {
    currentPage: number;
    totalImages: number;
    hasMore: boolean;
  };
}

const AdminImagesPage: React.FC = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [showUnusedOnly, setShowUnusedOnly] = useState(false);

  // 이미지 목록 불러오기
  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const token = authService.getToken();

      const url = new URL(`${process.env.REACT_APP_API_URL || 'https://codinginfoback-production.up.railway.app'}/api/images`);
      if (showUnusedOnly) {
        url.searchParams.append('unused', 'true');
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('이미지 목록을 불러오는데 실패했습니다.');
      }

      const result: ImageListResponse = await response.json();
      setImages(result.images);
    } catch (error) {
      setError(error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [showUnusedOnly]);

  // 이미지 삭제
  const deleteImage = async (publicId: string, force: boolean = false) => {
    if (!force && !window.confirm('정말로 이 이미지를 삭제하시겠습니까?\n삭제된 이미지는 복구할 수 없습니다.')) {
      return;
    }

    try {
      setDeleting(publicId);
      const token = authService.getToken();

      // URL 인코딩 처리
      const encodedPublicId = encodeURIComponent(publicId);
      const url = new URL(`${process.env.REACT_APP_API_URL || 'https://codinginfoback-production.up.railway.app'}/api/images/${encodedPublicId}`);

      if (force) {
        url.searchParams.append('force', 'true');
      }

      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const responseData = await response.json();

      if (response.status === 409) {
        // 이미지가 사용 중인 경우
        const usedArticles = responseData.usedInArticles.map((article: any) => article.title).join(', ');
        const confirmMessage = `이 이미지는 다음 아티클에서 사용 중입니다:\n${usedArticles}\n\n그래도 강제로 삭제하시겠습니까?`;

        if (window.confirm(confirmMessage)) {
          // 강제 삭제 재시도
          await deleteImage(publicId, true);
        }
        return;
      }

      if (!response.ok) {
        throw new Error(responseData.error || '이미지 삭제에 실패했습니다.');
      }

      // 삭제 성공시 목록에서 제거
      setImages(prev => prev.filter(img => img.publicId !== publicId));

      // 선택된 이미지가 삭제된 경우 모달 닫기
      if (selectedImage?.publicId === publicId) {
        setSelectedImage(null);
      }

      alert('이미지가 성공적으로 삭제되었습니다.');
    } catch (error) {
      alert(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(null);
    }
  };

  // 이미지 URL을 클립보드에 복사
  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('이미지 URL이 클립보드에 복사되었습니다.');
    } catch (error) {
      // 클립보드 API가 지원되지 않는 경우 fallback
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('이미지 URL이 클립보드에 복사되었습니다.');
    }
  };

  // 마크다운 문법을 클립보드에 복사
  const copyMarkdown = async (url: string, filename: string) => {
    const markdown = `![${filename}](${url})`;
    try {
      await navigator.clipboard.writeText(markdown);
      alert('마크다운 문법이 클립보드에 복사되었습니다.');
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = markdown;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('마크다운 문법이 클립보드에 복사되었습니다.');
    }
  };

  // 파일 크기를 읽기 쉬운 형태로 변환
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  if (loading) {
    return (
      <Container>
        <Header>
          <h1>이미지 관리</h1>
          <p>업로드된 이미지를 관리하고 삭제할 수 있습니다.</p>
        </Header>
        <LoadingMessage>이미지 목록을 불러오는 중...</LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <h1>이미지 관리</h1>
          <p>업로드된 이미지를 관리하고 삭제할 수 있습니다.</p>
        </Header>
        <ErrorMessage>
          ❌ {error}
          <button onClick={fetchImages}>다시 시도</button>
        </ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>이미지 관리</h1>
        <p>업로드된 이미지를 관리하고 삭제할 수 있습니다.</p>
        <Stats>
          <StatItem>
            <strong>{images.length}</strong>개의 이미지
          </StatItem>
          <FilterControls>
            <FilterToggle
              $active={showUnusedOnly}
              onClick={() => setShowUnusedOnly(!showUnusedOnly)}
            >
              {showUnusedOnly ? '🔍 사용안된 이미지만' : '📋 전체 이미지'}
            </FilterToggle>
            <RefreshButton onClick={fetchImages}>
              🔄 새로고침
            </RefreshButton>
          </FilterControls>
        </Stats>
      </Header>

      {images.length === 0 ? (
        <EmptyState>
          <h3>📷 업로드된 이미지가 없습니다</h3>
          <p>아티클 편집 페이지에서 이미지를 업로드해보세요.</p>
        </EmptyState>
      ) : (
        <ImageGrid>
          {images.map((image) => (
            <ImageCard key={image.publicId}>
              <ImagePreview
                onClick={() => setSelectedImage(image)}
                title="클릭하여 크게 보기"
              >
                <OptimizedImage
                  src={image.url}
                  alt={image.filename}
                  variant="preview"
                  lazy={true}
                  showPlaceholder={true}
                  style={{ width: '100%', height: '100%' }}
                />
                <ImageOverlay>
                  <OverlayButton>🔍 크게보기</OverlayButton>
                </ImageOverlay>
              </ImagePreview>

              <ImageInfo>
                <ImageName title={image.filename}>
                  {image.filename.length > 20
                    ? `${image.filename.substring(0, 20)}...`
                    : image.filename
                  }
                </ImageName>

                <ImageMeta>
                  <MetaItem>{image.width} × {image.height}</MetaItem>
                  <MetaItem>{formatFileSize(image.size)}</MetaItem>
                  <MetaItem>{image.format.toUpperCase()}</MetaItem>
                  <UsageMetaItem $used={image.usageCount > 0}>
                    {image.usageCount > 0 ? `사용 중 (${image.usageCount})` : '미사용'}
                  </UsageMetaItem>
                </ImageMeta>

                <ImageDate>{formatDate(image.createdAt)}</ImageDate>
              </ImageInfo>

              <ImageActions>
                <ActionButton
                  onClick={() => copyToClipboard(image.url)}
                  title="URL 복사"
                >
                  🔗 URL
                </ActionButton>
                <ActionButton
                  onClick={() => copyMarkdown(image.url, image.filename)}
                  title="마크다운 복사"
                >
                  📝 MD
                </ActionButton>
                <DeleteButton
                  onClick={() => deleteImage(image.publicId)}
                  disabled={deleting === image.publicId}
                  title="이미지 삭제"
                >
                  {deleting === image.publicId ? '⏳' : '🗑️'}
                </DeleteButton>
              </ImageActions>
            </ImageCard>
          ))}
        </ImageGrid>
      )}

      {/* 이미지 상세 모달 */}
      {selectedImage && (
        <Modal onClick={() => setSelectedImage(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>{selectedImage.filename}</h3>
              <CloseButton onClick={() => setSelectedImage(null)}>×</CloseButton>
            </ModalHeader>

            <ModalImage>
              <OptimizedImage
                src={selectedImage.url}
                alt={selectedImage.filename}
                variant="original"
                lazy={false}
                showPlaceholder={false}
                style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }}
              />
            </ModalImage>

            <ModalInfo>
              <InfoGrid>
                <InfoItem>
                  <label>파일명:</label>
                  <span>{selectedImage.filename}</span>
                </InfoItem>
                <InfoItem>
                  <label>크기:</label>
                  <span>{selectedImage.width} × {selectedImage.height}</span>
                </InfoItem>
                <InfoItem>
                  <label>용량:</label>
                  <span>{formatFileSize(selectedImage.size)}</span>
                </InfoItem>
                <InfoItem>
                  <label>형식:</label>
                  <span>{selectedImage.format.toUpperCase()}</span>
                </InfoItem>
                <InfoItem>
                  <label>업로드일:</label>
                  <span>{formatDate(selectedImage.createdAt)}</span>
                </InfoItem>
                <InfoItem>
                  <label>Public ID:</label>
                  <span>{selectedImage.publicId}</span>
                </InfoItem>
                <InfoItem>
                  <label>사용 현황:</label>
                  <UsageStatus $used={selectedImage.usageCount > 0}>
                    {selectedImage.usageCount > 0
                      ? `${selectedImage.usageCount}개 아티클에서 사용 중`
                      : '사용되지 않음'
                    }
                  </UsageStatus>
                </InfoItem>
                {selectedImage.usedInArticles.length > 0 && (
                  <InfoItem>
                    <label>사용된 아티클:</label>
                    <ArticleList>
                      {selectedImage.usedInArticles.map((article, index) => (
                        <ArticleLink key={index} href={`/article/${article.slug}`} target="_blank">
                          {article.title}
                        </ArticleLink>
                      ))}
                    </ArticleList>
                  </InfoItem>
                )}
              </InfoGrid>
            </ModalInfo>

            <ModalActions>
              <ModalActionButton onClick={() => copyToClipboard(selectedImage.url)}>
                🔗 URL 복사
              </ModalActionButton>
              <ModalActionButton onClick={() => copyMarkdown(selectedImage.url, selectedImage.filename)}>
                📝 마크다운 복사
              </ModalActionButton>
              <ModalDeleteButton
                onClick={() => deleteImage(selectedImage.publicId)}
                disabled={deleting === selectedImage.publicId}
              >
                {deleting === selectedImage.publicId ? '⏳ 삭제 중...' : '🗑️ 삭제'}
              </ModalDeleteButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;

  h1 {
    margin: 0 0 0.5rem 0;
    color: ${({ theme }) => theme.colors.text};
  }

  p {
    margin: 0 0 1rem 0;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Stats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const StatItem = styled.div`
  color: ${({ theme }) => theme.colors.text};

  strong {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const FilterControls = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const FilterToggle = styled.button<{ $active: boolean }>`
  background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.backgroundSecondary};
  color: ${({ $active, theme }) => $active ? 'white' : theme.colors.text};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.border};
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background: ${({ $active, theme }) =>
      $active
        ? theme.colors.primaryDark || theme.colors.primary
        : theme.colors.surfaceHover || theme.colors.backgroundSecondary
    };
  }
`;

const RefreshButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark || theme.colors.primary};
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.1rem;
`;

const ErrorMessage = styled.div`
  background: #fff5f5;
  border: 1px solid #ff4757;
  color: #c53030;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;

  button {
    margin-left: 1rem;
    background: #ff4757;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  h3 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
  }

  p {
    margin: 0;
    font-size: 1.1rem;
  }
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ImageCard = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const ImagePreview = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${ImagePreview}:hover & {
    opacity: 1;
  }
`;

const OverlayButton = styled.div`
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
`;

const ImageInfo = styled.div`
  padding: 1rem;
`;

const ImageName = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

const ImageMeta = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const MetaItem = styled.span`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const UsageMetaItem = styled.span<{ $used: boolean }>`
  background: ${({ $used }) => $used ? '#e8f5e8' : '#fff3cd'};
  color: ${({ $used }) => $used ? '#2d5a2d' : '#856404'};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const ImageDate = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ImageActions = styled.div`
  display: flex;
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  flex: 1;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark || theme.colors.primary};
  }
`;

const DeleteButton = styled.button<{ disabled?: boolean }>`
  background: #ff4757;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  font-size: 0.8rem;
  transition: all 0.2s ease;
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};

  &:hover:not(:disabled) {
    background: #ff3838;
  }
`;

// Modal styles
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  h3 {
    margin: 0;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 0.25rem;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ModalImage = styled.div`
  text-align: center;
  padding: 1rem;

  img {
    max-width: 100%;
    max-height: 400px;
    border-radius: 8px;
  }
`;

const ModalInfo = styled.div`
  padding: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const InfoItem = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 1rem;

  label {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  span {
    color: ${({ theme }) => theme.colors.text};
    word-break: break-all;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalActionButton = styled.button`
  flex: 1;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark || theme.colors.primary};
  }
`;

const ModalDeleteButton = styled.button<{ disabled?: boolean }>`
  background: #ff4757;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};

  &:hover:not(:disabled) {
    background: #ff3838;
  }
`;

const UsageStatus = styled.span<{ $used: boolean }>`
  color: ${({ $used }) => $used ? '#2d5a2d' : '#856404'};
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  background: ${({ $used }) => $used ? '#e8f5e8' : '#fff3cd'};
  border-radius: 4px;
`;

const ArticleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ArticleLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover || theme.colors.backgroundSecondary};
    text-decoration: underline;
  }
`;

export default AdminImagesPage;