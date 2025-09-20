/**
 * Cloudinary 이미지 URL 변환 유틸리티
 * 성능 최적화를 위해 미리보기/원본 버전을 구분하여 제공
 */

export type ImageVariant = 'thumbnail' | 'preview' | 'medium' | 'original';

interface TransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'scale';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  blur?: number;
}

/**
 * Cloudinary URL에서 변환 파라미터를 추가/수정하는 함수
 */
export const transformCloudinaryUrl = (
  originalUrl: string,
  options: TransformOptions
): string => {
  if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
    return originalUrl;
  }

  // /upload/ 뒤에 변환 파라미터를 삽입
  const uploadIndex = originalUrl.indexOf('/upload/');
  if (uploadIndex === -1) return originalUrl;

  const beforeUpload = originalUrl.substring(0, uploadIndex + 8);
  const afterUpload = originalUrl.substring(uploadIndex + 8);

  // 기존 변환 파라미터 제거 (v숫자/로 시작하는 부분 이전까지)
  const versionMatch = afterUpload.match(/^(.*?\/)?v\d+\//);
  const pathWithoutTransforms = versionMatch
    ? afterUpload.substring(versionMatch[0].length - 1)
    : afterUpload;

  // 새로운 변환 파라미터 생성
  const transforms: string[] = [];

  if (options.width || options.height) {
    const w = options.width ? `w_${options.width}` : '';
    const h = options.height ? `h_${options.height}` : '';
    const c = options.crop ? `c_${options.crop}` : '';
    transforms.push([w, h, c].filter(Boolean).join(','));
  }

  if (options.quality !== undefined) {
    transforms.push(`q_${options.quality}`);
  }

  if (options.format) {
    transforms.push(`f_${options.format}`);
  }

  if (options.blur) {
    transforms.push(`e_blur:${options.blur}`);
  }

  const transformString = transforms.length > 0 ? transforms.join('/') + '/' : '';

  return beforeUpload + transformString + pathWithoutUpload;
};

/**
 * 미리 정의된 이미지 변형을 제공하는 함수
 */
export const getImageVariant = (originalUrl: string, variant: ImageVariant): string => {
  switch (variant) {
    case 'thumbnail':
      // 썸네일: 150x150, 정사각형 크롭, 압축 높음
      return transformCloudinaryUrl(originalUrl, {
        width: 150,
        height: 150,
        crop: 'fill',
        quality: 'auto',
        format: 'webp'
      });

    case 'preview':
      // 미리보기: 최대 400px 너비, 비율 유지, 중간 압축
      return transformCloudinaryUrl(originalUrl, {
        width: 400,
        crop: 'limit',
        quality: 'auto',
        format: 'webp'
      });

    case 'medium':
      // 중간 크기: 최대 800px 너비, 비율 유지, 자동 품질
      return transformCloudinaryUrl(originalUrl, {
        width: 800,
        crop: 'limit',
        quality: 'auto',
        format: 'auto'
      });

    case 'original':
    default:
      // 원본: 변환 없음
      return originalUrl;
  }
};

/**
 * 이미지 로딩 상태를 관리하는 커스텀 훅을 위한 유틸리티
 */
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * 반응형 이미지를 위한 srcSet 생성
 */
export const generateSrcSet = (originalUrl: string): string => {
  const sizes = [400, 600, 800, 1200];

  return sizes
    .map(size => {
      const url = transformCloudinaryUrl(originalUrl, {
        width: size,
        crop: 'limit',
        quality: 'auto',
        format: 'webp'
      });
      return `${url} ${size}w`;
    })
    .join(', ');
};

/**
 * 블러된 플레이스홀더 이미지 생성 (지연 로딩용)
 */
export const getBlurPlaceholder = (originalUrl: string): string => {
  return transformCloudinaryUrl(originalUrl, {
    width: 20,
    height: 20,
    crop: 'fill',
    quality: 1,
    blur: 1000,
    format: 'jpg'
  });
};

/**
 * 이미지 메타데이터 추출
 */
export interface ImageMetadata {
  isCloudinary: boolean;
  publicId?: string;
  version?: string;
  format?: string;
  cloudName?: string;
}

export const extractImageMetadata = (url: string): ImageMetadata => {
  const metadata: ImageMetadata = {
    isCloudinary: url.includes('cloudinary.com')
  };

  if (metadata.isCloudinary) {
    // Cloudinary URL 패턴: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
    const match = url.match(/cloudinary\.com\/([^\/]+)\/image\/upload\/(?:.*\/)?v(\d+)\/(.+?)\.(\w+)$/);
    if (match) {
      metadata.cloudName = match[1];
      metadata.version = match[2];
      metadata.publicId = match[3];
      metadata.format = match[4];
    }
  }

  return metadata;
};

/**
 * 이미지 URL이 유효한지 검사
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const hasValidExtension = validExtensions.some(ext =>
      urlObj.pathname.toLowerCase().includes(ext)
    );

    return urlObj.protocol === 'https:' && (hasValidExtension || url.includes('cloudinary.com'));
  } catch {
    return false;
  }
};

/**
 * 이미지 로딩 성능 통계
 */
export class ImagePerformanceTracker {
  private static instance: ImagePerformanceTracker;
  private loadTimes: Map<string, number> = new Map();
  private loadStartTimes: Map<string, number> = new Map();

  static getInstance(): ImagePerformanceTracker {
    if (!ImagePerformanceTracker.instance) {
      ImagePerformanceTracker.instance = new ImagePerformanceTracker();
    }
    return ImagePerformanceTracker.instance;
  }

  startTracking(url: string): void {
    this.loadStartTimes.set(url, performance.now());
  }

  endTracking(url: string): void {
    const startTime = this.loadStartTimes.get(url);
    if (startTime) {
      const loadTime = performance.now() - startTime;
      this.loadTimes.set(url, loadTime);
      this.loadStartTimes.delete(url);

      // 개발 환경에서만 로그 출력
      if (process.env.NODE_ENV === 'development') {
        console.log(`Image loaded: ${url.substring(0, 50)}... (${loadTime.toFixed(2)}ms)`);
      }
    }
  }

  getAverageLoadTime(): number {
    const times = Array.from(this.loadTimes.values());
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  getStats(): { totalImages: number; averageLoadTime: number; slowestImage: string | null } {
    const times = Array.from(this.loadTimes.entries());
    const slowest = times.reduce((prev, current) =>
      current[1] > prev[1] ? current : prev, ['', 0]
    );

    return {
      totalImages: times.length,
      averageLoadTime: this.getAverageLoadTime(),
      slowestImage: slowest[0] || null
    };
  }
}