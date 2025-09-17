import React from 'react';
import styled from 'styled-components';

const MarkdownContainer = styled.div`
  line-height: 1.8;
  
  h1, h2, h3, h4, h5, h6 {
    margin: ${({ theme }) => theme.spacing['2xl']} 0 ${({ theme }) => theme.spacing.lg} 0;
    
    &:first-child {
      margin-top: 0;
    }
  }
  
  h1 {
    border-bottom: 2px solid ${({ theme }) => theme.colors.border};
    padding-bottom: ${({ theme }) => theme.spacing.md};
  }
  
  h2 {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    padding-bottom: ${({ theme }) => theme.spacing.sm};
  }
  
  p {
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  ul, ol {
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    padding-left: ${({ theme }) => theme.spacing.xl};
    
    li {
      margin-bottom: ${({ theme }) => theme.spacing.sm};
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  blockquote {
    margin: ${({ theme }) => theme.spacing.xl} 0;
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
    border-left: 4px solid ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.backgroundSecondary};
    border-radius: 0 ${({ theme }) => theme.borderRadius.md} ${({ theme }) => theme.borderRadius.md} 0;
    
    p:last-child {
      margin-bottom: 0;
    }
  }
  
  pre {
    margin: ${({ theme }) => theme.spacing.xl} 0;
    padding: ${({ theme }) => theme.spacing.xl};
    background-color: ${({ theme }) => theme.colors.code};
    color: #ffffff;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    overflow-x: auto;
    border: 1px solid ${({ theme }) => theme.colors.border};
    
    code {
      background: none;
      border: none;
      padding: 0;
      color: inherit;
      font-size: ${({ theme }) => theme.fontSizes.sm};
    }
  }
  
  code {
    font-family: ${({ theme }) => theme.fonts.code};
    font-size: 0.9em;
    background-color: ${({ theme }) => theme.colors.codeBackground};
    padding: 0.125rem 0.375rem;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    border: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text};
  }
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    margin: ${({ theme }) => theme.spacing.xl} 0;
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: ${({ theme }) => theme.spacing.xl} 0;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    overflow: hidden;
    
    th, td {
      padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
      text-align: left;
      border-bottom: 1px solid ${({ theme }) => theme.colors.border};
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
  
  hr {
    border: none;
    height: 1px;
    background-color: ${({ theme }) => theme.colors.border};
    margin: ${({ theme }) => theme.spacing['2xl']} 0;
  }
`;

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderMarkdown = (markdown: string): string => {
    return markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br />');
  };

  const processedContent = renderMarkdown(content);
  const wrappedContent = `<p>${processedContent}</p>`;

  return (
    <MarkdownContainer
      dangerouslySetInnerHTML={{
        __html: wrappedContent
      }}
    />
  );
};

export default MarkdownRenderer;