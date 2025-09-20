import React, { useState, useCallback } from 'react';
import styled from 'styled-components';

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  disabled?: boolean;
}

interface UploadResponse {
  success: boolean;
  url: string;
  publicId: string;
  filename: string;
  size: number;
  width: number;
  height: number;
  format: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(async (file: File) => {
    if (disabled) return;

    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://codinginfoback-production.up.railway.app'}/api/images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `업로드 실패: ${response.status}`);
      }

      const result: UploadResponse = await response.json();

      if (result.success && result.url) {
        onImageUpload(result.url);
        console.log('Image uploaded successfully:', {
          url: result.url,
          size: `${(result.size / 1024).toFixed(1)}KB`,
          dimensions: `${result.width}x${result.height}`
        });
      } else {
        throw new Error('업로드 응답이 올바르지 않습니다.');
      }

    } catch (error) {
      console.error('Image upload error:', error);
      setError(error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  }, [onImageUpload, disabled]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
    // input 값 초기화 (같은 파일을 다시 선택할 수 있도록)
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    if (disabled || uploading) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      uploadImage(imageFile);
    } else if (files.length > 0) {
      setError('이미지 파일만 업로드 가능합니다.');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <UploaderContainer>
      <DropZone
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        $dragOver={dragOver}
        $disabled={disabled || uploading}
        $error={!!error}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          style={{ display: 'none' }}
          id="image-upload-input"
        />

        {uploading ? (
          <UploadingState>
            <Spinner />
            <span>이미지 업로드 중...</span>
          </UploadingState>
        ) : (
          <UploadContent>
            <UploadIcon>📷</UploadIcon>
            <UploadText>
              <strong>클릭하여 이미지 선택</strong> 또는 드래그 앤 드롭
            </UploadText>
            <UploadHint>
              PNG, JPG, GIF 최대 10MB
            </UploadHint>
            <UploadButton
              as="label"
              htmlFor="image-upload-input"
              disabled={disabled || uploading}
            >
              이미지 선택
            </UploadButton>
          </UploadContent>
        )}
      </DropZone>

      {error && (
        <ErrorMessage>
          ❌ {error}
          <CloseButton onClick={() => setError(null)}>×</CloseButton>
        </ErrorMessage>
      )}
    </UploaderContainer>
  );
};

// Styled Components
const UploaderContainer = styled.div`
  width: 100%;
  margin-bottom: 1rem;
`;

const DropZone = styled.div<{
  $dragOver: boolean;
  $disabled: boolean;
  $error: boolean;
}>`
  border: 2px dashed ${({ theme, $dragOver, $error }) =>
    $error ? '#ff4757' :
    $dragOver ? theme.colors.primary : theme.colors.border
  };
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  background-color: ${({ theme, $dragOver, $disabled, $error }) =>
    $disabled ? theme.colors.backgroundSecondary :
    $error ? 'rgba(255, 71, 87, 0.05)' :
    $dragOver ? theme.colors.backgroundSecondary : 'transparent'
  };
  transition: all 0.3s ease;
  opacity: ${({ $disabled }) => $disabled ? 0.6 : 1};

  &:hover {
    border-color: ${({ theme, $disabled, $error }) =>
      $disabled ? theme.colors.border :
      $error ? '#ff4757' :
      theme.colors.primary
    };
    background-color: ${({ theme, $disabled, $error }) =>
      $disabled ? theme.colors.backgroundSecondary :
      $error ? 'rgba(255, 71, 87, 0.05)' :
      theme.colors.backgroundSecondary
    };
  }
`;

const UploadContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  opacity: 0.7;
`;

const UploadText = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.1rem;

  strong {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const UploadHint = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const UploadButton = styled.button<{ disabled?: boolean }>`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryDark || theme.colors.primary};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const UploadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: ${({ theme }) => theme.colors.primary};

  span {
    font-size: 1.1rem;
    font-weight: 500;
  }
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${({ theme }) => theme.colors.border};
  border-left-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  background-color: #fff5f5;
  border: 1px solid #ff4757;
  color: #c53030;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-top: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #c53030;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;

  &:hover {
    opacity: 0.7;
  }
`;

export default ImageUploader;