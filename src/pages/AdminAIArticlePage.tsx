import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { AIProviderType, ConversationMessage, AIConversation } from '../types';
import { aiConfigApi, aiConversationApi } from '../services/aiApi';
import LoadingSpinner from '../components/LoadingSpinner';
import MarkdownRenderer from '../components/MarkdownRenderer';

const Container = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  height: calc(100vh - 100px);
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1800px;
  margin: 0 auto;
`;

const Sidebar = styled.div`
  width: 300px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const SidebarHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const NewChatButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &:hover {
    opacity: 0.9;
  }
`;

const ConversationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ConversationItem = styled.div<{ active?: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ active, theme }) => active ? theme.colors.primary + '20' : 'transparent'};
  border: 1px solid ${({ active, theme }) => active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const ConversationTitle = styled.div`
  font-weight: 500;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ConversationDate = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const DeleteButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  background: #ef4444;
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h1`
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  flex: 1;
  min-height: 0;
`;

const ChatSection = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
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
  white-space: pre-wrap;
  word-break: break-word;
`;

const MessageRole = styled.div`
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.primary};
`;

const MessageContent = styled.div`
  line-height: 1.6;

  p {
    margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  }

  strong {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
  }

  code {
    background: ${({ theme }) => theme.colors.background};
    padding: 2px 6px;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.9em;
  }

  pre {
    background: ${({ theme }) => theme.colors.background};
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    overflow-x: auto;
  }

  ul, ol {
    margin: ${({ theme }) => theme.spacing.sm} 0;
    padding-left: ${({ theme }) => theme.spacing.xl};
  }
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

const Button = styled.button<{ variant?: 'secondary' | 'success' | 'danger' }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border: none;
  background: ${({ variant, theme }) => {
    switch (variant) {
      case 'secondary': return theme.colors.border;
      case 'success': return '#10b981';
      case 'danger': return '#ef4444';
      default: return theme.colors.primary;
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
  overflow-y: auto;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const AdminAIArticlePage: React.FC = () => {
  const navigate = useNavigate();
  const { conversationId: urlConversationId } = useParams();

  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(urlConversationId || null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [draftArticle, setDraftArticle] = useState<any>(null);

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    try {
      setLoading(true);
      await loadConversations();
    } catch (error) {
      console.error('Failed to initialize:', error);
      alert('초기화 실패. AI 설정을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const convos = await aiConversationApi.getAllConversations();
      setConversations(convos);

      if (urlConversationId) {
        await loadConversation(urlConversationId);
      } else if (convos.length > 0) {
        await loadConversation(convos[0]._id);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      const conversation = await aiConversationApi.getConversationById(id);
      setConversationId(id);
      setMessages(conversation.messages);
      setDraftArticle(conversation.draftArticle || null);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const handleNewConversation = async () => {
    try {
      const providers = await aiConfigApi.getEnabledProviders();
      const conversation = await aiConversationApi.createConversation({
        title: `AI 기사 작성 - ${new Date().toLocaleString()}`,
        aiProvider: providers.defaultProvider,
      });
      await loadConversations();
      await loadConversation(conversation._id);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      alert('대화 생성 실패');
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('이 대화를 삭제하시겠습니까?')) return;

    try {
      await aiConversationApi.deleteConversation(id);
      await loadConversations();

      if (id === conversationId) {
        setConversationId(null);
        setMessages([]);
        setDraftArticle(null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert('삭제 실패');
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
      <Sidebar>
        <SidebarHeader>
          <NewChatButton onClick={handleNewConversation}>
            + 새 대화
          </NewChatButton>
        </SidebarHeader>

        <ConversationList>
          {conversations.map((conv) => (
            <ConversationItem
              key={conv._id}
              active={conv._id === conversationId}
              onClick={() => loadConversation(conv._id)}
            >
              <ConversationTitle>{conv.title}</ConversationTitle>
              <ConversationDate>
                {new Date(conv.createdAt).toLocaleString()}
              </ConversationDate>
              <DeleteButton onClick={(e) => handleDeleteConversation(conv._id, e)}>
                삭제
              </DeleteButton>
            </ConversationItem>
          ))}
        </ConversationList>
      </Sidebar>

      <MainContent>
        <Header>
          <Title>AI 기사 작성</Title>
          <p>AI와 대화하며 기사를 작성하세요.</p>
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
                    <MessageContent>
                      <MarkdownRenderer content={msg.content} />
                    </MessageContent>
                  </Message>
                ))}
            </ChatMessages>

            <InputGroup>
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="메시지를 입력하세요..."
                disabled={sending || !conversationId}
              />
              <Button onClick={handleSendMessage} disabled={sending || !conversationId}>
                {sending ? '전송 중...' : '전송'}
              </Button>
            </InputGroup>

            <ButtonGroup>
              <Button onClick={handleGenerateArticle} disabled={generating || messages.length < 4 || !conversationId}>
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
      </MainContent>
    </Container>
  );
};

export default AdminAIArticlePage;
