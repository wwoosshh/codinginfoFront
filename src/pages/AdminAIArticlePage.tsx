import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AIProviderType, ConversationMessage } from '../types';
import { aiConfigApi, aiConversationApi } from '../services/aiApi';
import LoadingSpinner from '../components/LoadingSpinner';
import MarkdownRenderer from '../components/MarkdownRenderer';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChatSection = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  height: 600px;
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const Message = styled.div<{ isUser: boolean }>`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ isUser, theme }) => (isUser ? theme.colors.primary + '20' : theme.colors.surface)};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const MessageRole = styled.div`
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.primary};
`;

const InputGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Input = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const Button = styled.button<{ variant?: 'secondary' | 'success' }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border: none;
  background: ${({ variant, theme }) => {
    switch (variant) {
      case 'secondary':
        return theme.colors.border;
      case 'success':
        return '#10b981';
      default:
        return theme.colors.primary;
    }
  }};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PreviewSection = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  height: 600px;
  overflow-y: auto;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const AdminAIArticlePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [draftArticle, setDraftArticle] = useState<any>(null);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<AIProviderType>(AIProviderType.GEMINI);

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    try {
      setLoading(true);
      const providers = await aiConfigApi.getEnabledProviders();
      setAvailableProviders(providers.providers);
      setSelectedProvider(providers.defaultProvider);
      await createNewConversation(providers.defaultProvider);
    } catch (error) {
      console.error('Failed to initialize:', error);
      alert('초기화 실패. AI 설정을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async (provider: AIProviderType) => {
    try {
      const conversation = await aiConversationApi.createConversation({
        title: `AI 기사 작성 - ${new Date().toLocaleString()}`,
        aiProvider: provider,
      });
      setConversationId(conversation._id);
      setMessages(conversation.messages);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !conversationId) return;

    try {
      setSending(true);
      const result = await aiConversationApi.sendMessage(conversationId, inputMessage);
      setMessages((prev) => [...prev, result.userMessage, result.aiResponse]);
      setInputMessage('');
    } catch (error: any) {
      console.error('Failed to send message:', error);
      alert(error.response?.data?.message || '메시지 전송 실패');
    } finally {
      setSending(false);
    }
  };

  const handleGenerateArticle = async () => {
    if (!conversationId) return;

    try {
      setGenerating(true);
      const result = await aiConversationApi.generateArticle(conversationId);
      setDraftArticle(result.draftArticle);
      alert('기사가 생성되었습니다!');
    } catch (error: any) {
      console.error('Failed to generate article:', error);
      alert(error.response?.data?.message || '기사 생성 실패');
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!conversationId || !draftArticle) return;

    if (!window.confirm('이 기사를 발행하시겠습니까?')) return;

    try {
      const result = await aiConversationApi.publishArticle(conversationId);
      alert(result.message);
      navigate('/admin/articles');
    } catch (error: any) {
      console.error('Failed to publish:', error);
      alert(error.response?.data?.message || '발행 실패');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container>
      <Header>
        <Title>AI 기사 작성</Title>
        <p>AI와 대화하며 기사를 작성하세요. 대화가 충분히 진행되면 "기사 생성" 버튼을 눌러주세요.</p>
      </Header>

      <Grid>
        <ChatSection>
          <h3>대화</h3>
          <ChatMessages>
            {messages
              .filter((msg) => msg.role !== 'system')
              .map((msg, idx) => (
                <Message key={idx} isUser={msg.role === 'user'}>
                  <MessageRole>{msg.role === 'user' ? '나' : 'AI'}</MessageRole>
                  <div>{msg.content}</div>
                </Message>
              ))}
          </ChatMessages>

          <InputGroup>
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="메시지를 입력하세요..."
              disabled={sending}
            />
            <Button onClick={handleSendMessage} disabled={sending}>
              {sending ? '전송 중...' : '전송'}
            </Button>
          </InputGroup>

          <ButtonGroup>
            <Button onClick={handleGenerateArticle} disabled={generating || messages.length < 4}>
              {generating ? '생성 중...' : '기사 생성'}
            </Button>
          </ButtonGroup>
        </ChatSection>

        <PreviewSection>
          <h3>기사 미리보기</h3>
          {draftArticle ? (
            <>
              <h2>{draftArticle.title}</h2>
              <p style={{ color: '#666', marginBottom: '20px' }}>{draftArticle.description}</p>
              <MarkdownRenderer content={draftArticle.content} />
              <ButtonGroup>
                <Button variant="success" onClick={handlePublish}>
                  발행하기
                </Button>
                <Button variant="secondary" onClick={() => navigate('/admin')}>
                  취소
                </Button>
              </ButtonGroup>
            </>
          ) : (
            <p>AI와 대화를 나눈 후 "기사 생성" 버튼을 눌러주세요.</p>
          )}
        </PreviewSection>
      </Grid>
    </Container>
  );
};

export default AdminAIArticlePage;
