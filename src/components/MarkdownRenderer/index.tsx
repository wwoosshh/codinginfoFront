import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import styled from 'styled-components';
import 'highlight.js/styles/github-dark.css';
import 'katex/dist/katex.min.css';

const MarkdownContainer = styled.div`
  line-height: 1.8;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};

  /* 헤딩 스타일 */
  h1, h2, h3, h4, h5, h6 {
    margin: 2rem 0 1rem 0;
    font-weight: 600;
    line-height: 1.4;
    color: ${({ theme }) => theme.colors.text};

    &:first-child {
      margin-top: 0;
    }
  }

  h1 {
    font-size: 2.25rem;
    border-bottom: 2px solid ${({ theme }) => theme.colors.border};
    padding-bottom: 0.5rem;
  }

  h2 {
    font-size: 1.875rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    padding-bottom: 0.375rem;
  }

  h3 {
    font-size: 1.5rem;
  }

  h4 {
    font-size: 1.25rem;
  }

  h5 {
    font-size: 1.125rem;
  }

  h6 {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  /* 문단 스타일 */
  p {
    margin-bottom: 1rem;
    line-height: 1.8;

    &:last-child {
      margin-bottom: 0;
    }
  }

  /* 리스트 스타일 */
  ul, ol {
    margin: 1rem 0;
    padding-left: 2rem;

    li {
      margin-bottom: 0.5rem;
      line-height: 1.6;

      &:last-child {
        margin-bottom: 0;
      }

      /* 중첩 리스트 */
      ul, ol {
        margin: 0.5rem 0;
      }
    }
  }

  /* 체크리스트 */
  ul.contains-task-list {
    list-style: none;
    padding-left: 1.5rem;

    li.task-list-item {
      position: relative;

      input[type="checkbox"] {
        position: absolute;
        left: -1.5rem;
        top: 0.3rem;
        margin: 0;
        cursor: pointer;
      }
    }
  }

  /* 인용문 스타일 */
  blockquote {
    margin: 1.5rem 0;
    padding: 1rem 1.5rem;
    border-left: 4px solid ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.backgroundSecondary};
    border-radius: 0 8px 8px 0;

    p:last-child {
      margin-bottom: 0;
    }

    /* 중첩 인용문 */
    blockquote {
      margin: 0.5rem 0;
      border-left-color: ${({ theme }) => theme.colors.border};
    }
  }

  /* 코드 블록 스타일 */
  pre {
    margin: 1.5rem 0;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 14px;
    line-height: 1.5;

    code {
      background: none !important;
      border: none;
      padding: 1rem;
      display: block;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      color: inherit;
    }
  }

  /* 인라인 코드 스타일 */
  code:not(pre code) {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.875em;
    background-color: ${({ theme }) => theme.colors.codeBackground};
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }

  /* 이미지 스타일 */
  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1.5rem 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: block;
  }

  /* 테이블 스타일 */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    overflow: hidden;
    font-size: 14px;

    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid ${({ theme }) => theme.colors.border};
      border-right: 1px solid ${({ theme }) => theme.colors.border};

      &:last-child {
        border-right: none;
      }
    }

    th {
      background-color: ${({ theme }) => theme.colors.backgroundSecondary};
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text};
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover {
      background-color: ${({ theme }) => theme.colors.surfaceHover};
    }
  }

  /* 수평선 스타일 */
  hr {
    border: none;
    height: 1px;
    background-color: ${({ theme }) => theme.colors.border};
    margin: 2rem 0;
  }

  /* 링크 스타일 */
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  /* 강조 텍스트 */
  strong {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }

  em {
    font-style: italic;
  }

  /* 취소선 */
  del {
    text-decoration: line-through;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  /* 수식 스타일 */
  .katex {
    font-size: 1.1em;
  }

  .katex-display {
    margin: 1.5rem 0;
    text-align: center;
  }
`;

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // DB 콘텐츠가 ```markdown으로 감싸져 있는 경우 제거
  const cleanContent = React.useMemo(() => {
    const trimmed = content.trim();

    // ```markdown으로 시작하고 ```로 끝나는 경우 제거
    if (trimmed.startsWith('```markdown\n') && trimmed.endsWith('```')) {
      return trimmed.slice(12, -3).trim();
    }

    // ```로만 감싸져 있는 경우도 제거
    if (trimmed.startsWith('```\n') && trimmed.endsWith('```')) {
      return trimmed.slice(4, -3).trim();
    }

    return content;
  }, [content]);

  return (
    <MarkdownContainer>
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,           // GitHub Flavored Markdown (테이블, 체크리스트, 취소선 등)
          remarkMath,          // 수식 지원
          remarkBreaks         // 줄바꿈 지원
        ]}
        rehypePlugins={[
          rehypeHighlight,     // 코드 syntax highlighting
          rehypeKatex,         // 수식 렌더링
          rehypeRaw           // HTML 태그 지원
        ]}
        components={{
          // 링크를 새 탭에서 열기
          a: ({ href, children, ...props }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          ),
          // 이미지 최적화
          img: ({ src, alt, ...props }) => (
            <img src={src} alt={alt} loading="lazy" {...props} />
          ),
          // 코드 블록 언어 표시
          pre: ({ children, ...props }) => (
            <pre {...props}>{children}</pre>
          )
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </MarkdownContainer>
  );
};

export default MarkdownRenderer;

// 마크다운 콘텐츠 유틸리티 함수들
export const markdownUtils = {
  // 콘텐츠 정리 함수
  cleanMarkdownContent: (content: string): string => {
    const trimmed = content.trim();

    if (trimmed.startsWith('```markdown\n') && trimmed.endsWith('```')) {
      return trimmed.slice(12, -3).trim();
    }

    if (trimmed.startsWith('```\n') && trimmed.endsWith('```')) {
      return trimmed.slice(4, -3).trim();
    }

    return content;
  },

  // 마크다운 콘텐츠 검증
  validateMarkdown: (content: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // 기본 검증
    if (!content.trim()) {
      errors.push('콘텐츠가 비어있습니다.');
    }

    // 너무 긴 헤딩 체크
    const headingLines = content.split('\n').filter(line => line.startsWith('#'));
    headingLines.forEach((line, index) => {
      if (line.length > 200) {
        errors.push(`헤딩이 너무 깁니다 (줄 ${index + 1}): 최대 200자`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};