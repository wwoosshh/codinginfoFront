import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import {
  getImageVariant,
  generateSrcSet,
  getBlurPlaceholder,
  ImageVariant,
  ImagePerformanceTracker,
  isValidImageUrl
} from '../../utils/imageUtils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  variant?: ImageVariant;
  className?: string;
  style?: React.CSSProperties;
  lazy?: boolean;
  showPlaceholder?: boolean;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  variant = 'medium',
  className,
  style,
  lazy = true,
  showPlaceholder = true,
  onClick,
  onLoad,
  onError,
  fallbackSrc
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imageRef = useRef<HTMLImageElement>(null);
  const tracker = ImagePerformanceTracker.getInstance();

  // Intersection Observer를 이용한 지연 로딩
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  // 이미지 URL 유효성 검사
  const isValidSrc = isValidImageUrl(src);

  // 최적화된 이미지 URL 생성
  const optimizedSrc = isValidSrc ? getImageVariant(src, variant) : src;
  const srcSet = isValidSrc ? generateSrcSet(src) : undefined;
  const placeholderSrc = isValidSrc && showPlaceholder ? getBlurPlaceholder(src) : undefined;

  const handleLoad = () => {
    setIsLoaded(true);
    tracker.endTracking(optimizedSrc);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  const handleImageStart = () => {
    tracker.startTracking(optimizedSrc);
  };

  // 로딩 시작 트래킹
  useEffect(() => {
    if (isInView && !isLoaded && !isError) {
      handleImageStart();
    }
  }, [isInView, isLoaded, isError, optimizedSrc]);

  if (!isValidSrc && !fallbackSrc) {
    return (
      <ErrorContainer className={className} style={style}>
        <ErrorIcon>🖼️</ErrorIcon>
        <ErrorText>유효하지 않은 이미지</ErrorText>
      </ErrorContainer>
    );
  }

  return (
    <Container
      ref={imageRef}
      className={className}
      style={style}
      onClick={onClick}
      $clickable={!!onClick}
    >
      {/* 플레이스홀더 이미지 (블러 효과) */}
      {showPlaceholder && placeholderSrc && !isLoaded && isInView && (
        <PlaceholderImage
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
        />
      )}

      {/* 로딩 스피너 */}
      {!isLoaded && isInView && !isError && (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      )}

      {/* 메인 이미지 */}
      {isInView && !isError && (
        <MainImage
          src={optimizedSrc}
          srcSet={srcSet}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          $loaded={isLoaded}
          loading={lazy ? 'lazy' : 'eager'}
        />
      )}

      {/* 에러 상태 또는 폴백 이미지 */}
      {(isError || (!isValidSrc && fallbackSrc)) && (
        <>
          {fallbackSrc ? (
            <FallbackImage
              src={fallbackSrc}
              alt={alt}
              onLoad={handleLoad}
              onError={() => setIsError(true)}
            />
          ) : (
            <ErrorContainer>
              <ErrorIcon>❌</ErrorIcon>
              <ErrorText>이미지를 불러올 수 없습니다</ErrorText>
            </ErrorContainer>
          )}
        </>
      )}

      {/* 이미지 정보 표시 (개발 모드) */}
      {process.env.NODE_ENV === 'development' && isLoaded && (
        <DevInfo>
          <div>Variant: {variant}</div>
          <div>Lazy: {lazy ? 'Yes' : 'No'}</div>
          {srcSet && <div>Responsive: Yes</div>}
        </DevInfo>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div<{ $clickable: boolean }>`
  position: relative;
  overflow: hidden;
  cursor: ${({ $clickable }) => $clickable ? 'pointer' : 'default'};
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
`;

const PlaceholderImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(4px);
  transform: scale(1.1);
  z-index: 1;
`;

const MainImage = styled.img<{ $loaded: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
  opacity: ${({ $loaded }) => $loaded ? 1 : 0};
  z-index: 2;
  position: relative;
`;

const FallbackImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 2;
  position: relative;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 3;
`;

const LoadingSpinner = styled.div`
  width: 30px;
  height: 30px;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.textSecondary};
  min-height: 150px;
`;

const ErrorIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const ErrorText = styled.div`
  font-size: 0.9rem;
  text-align: center;
`;

const DevInfo = styled.div`
  position: absolute;
  top: 4px;
  left: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-family: monospace;
  z-index: 10;
  opacity: 0.8;

  div {
    margin: 1px 0;
  }
`;

export default OptimizedImage;