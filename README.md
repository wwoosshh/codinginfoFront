# 코딩 인포 프론트엔드

React + TypeScript + Vite 기반의 코딩 정보 공유 플랫폼 프론트엔드

## 📋 프로젝트 개요

일상에서 만나는 프로그래밍 현상들을 쉽고 재미있게 설명하는 블로그 플랫폼의 프론트엔드입니다.

## 🛠 기술 스택

- **프레임워크**: React 19
- **언어**: TypeScript
- **빌드 도구**: Create React App
- **스타일링**: styled-components
- **라우팅**: React Router v7
- **HTTP 클라이언트**: Axios
- **마크다운**: react-markdown + GFM + KaTeX
- **배포**: Vercel

## ✨ 주요 기능

### 📝 고급 마크다운 시스템 (v1.3.2+)
- **GitHub Flavored Markdown (GFM)** 완전 지원
- **코드 Syntax Highlighting** - 50+ 언어 지원
- **수식 렌더링** - LaTeX/KaTeX 지원 (`$E=mc^2$`, `$$블록수식$$`)
- **체크리스트** - `- [x] 완료`, `- [ ] 미완료`
- **테이블** - 완전한 테이블 지원 (정렬, 호버 효과)
- **취소선** - `~~텍스트~~`
- **중첩 인용문** - `> > 깊은 인용`
- **자동 래퍼 제거** - 기존 ```markdown``` 래퍼 자동 처리

### 🔐 관리자 시스템
- **완전한 CRUD** - 아티클 및 카테고리 관리
- **실시간 편집** - 마크다운 실시간 미리보기
- **권한 관리** - JWT 기반 인증
- **대시보드** - 통계 및 모니터링

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── ArticleCard/
│   ├── CategoryCard/
│   ├── Layout/
│   ├── MarkdownRenderer/   # 완전한 마크다운 렌더러
│   ├── LoadingSpinner/
│   └── AdminLayout.tsx     # 관리자 레이아웃
├── pages/               # 페이지 컴포넌트
│   ├── HomePage.tsx
│   ├── CategoryPage.tsx
│   ├── ArticlePage.tsx
│   ├── LoginPage.tsx
│   └── Admin*/              # 관리자 페이지들
├── services/            # API 서비스
│   ├── api.ts
│   └── adminApi.ts         # 관리자 API
├── types/               # TypeScript 타입 정의
│   └── index.ts
├── styles/              # 전역 스타일
│   ├── GlobalStyle.ts
│   └── theme.ts
└── App.tsx
```

## 🚀 시작하기

### 필수 조건
- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 🔧 환경 변수

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
VITE_API_URL=your_backend_api_url
```

## 📝 버전 히스토리

### v1.3.0 (2024-12-XX)

**주요 변경사항**
- 백엔드 API v1.3.0과 호환성 개선
- Article 인터페이스 업데이트 (새로운 필드 추가)
- API 응답 형식 변경 (pagination 지원)
- 카테고리 페이지 API 응답 처리 개선

**기술적 개선**
- `Article` 인터페이스에 새로운 필드 추가:
  - `status`: 아티클 상태 (draft/published/archived)
  - `author`: 작성자 정보
  - `tags`: 태그 배열
  - `viewCount`: 조회수
  - `publishedAt`: 발행일
- `ArticleListResponse` 인터페이스 추가 (pagination 지원)
- API 서비스 메서드 업데이트 (pagination 파라미터 추가)
- CategoryPage 컴포넌트의 API 응답 처리 방식 수정

**API 엔드포인트 업데이트**
- 모든 아티클 관련 API가 pagination 형식으로 응답
- 백엔드 서버 URL을 프로덕션 환경으로 업데이트

### v1.2.0 (2024-12-XX)

**주요 기능**
- 초기 프론트엔드 구현
- 홈페이지, 카테고리 페이지, 아티클 상세 페이지
- 반응형 디자인 적용
- 카테고리별 아티클 필터링
- 검색 기능

**컴포넌트**
- `ArticleCard`: 아티클 미리보기 카드
- `CategoryCard`: 카테고리 선택 카드
- `Header`: 네비게이션 헤더
- `LoadingSpinner`: 로딩 스피너

## 🔗 관련 링크

- **백엔드 저장소**: [Backend Repository]
- **배포된 사이트**: [Production URL]
- **API 문서**: [API Documentation]

## 📞 문의사항

프로젝트 관련 문의사항이 있으시면 이슈를 생성해 주세요.