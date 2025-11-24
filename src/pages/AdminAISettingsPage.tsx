import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AIConfiguration, AIProviderType } from '../types';
import { aiConfigApi } from '../services/aiApi';
import LoadingSpinner from '../components/LoadingSpinner';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.lg};
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;

const Section = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme}) => theme.colors.text};
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
`;

const Checkbox = styled.input`
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const Button = styled.button<{ variant?: 'secondary' | 'success' }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
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
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  background: ${({ type }) => {
    switch (type) {
      case 'success':
        return '#d1fae5';
      case 'error':
        return '#fee2e2';
      case 'info':
        return '#dbeafe';
    }
  }};
  color: ${({ type }) => {
    switch (type) {
      case 'success':
        return '#065f46';
      case 'error':
        return '#991b1b';
      case 'info':
        return '#1e40af';
    }
  }};
`;

const TestStatus = styled.span<{ success?: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ success }) => (success ? '#10b981' : '#ef4444')};
  margin-left: ${({ theme }) => theme.spacing.sm};
`;

const AdminAISettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const [config, setConfig] = useState<AIConfiguration | null>(null);
  const [formData, setFormData] = useState({
    defaultProvider: AIProviderType.GEMINI,
    gemini: { apiKey: '', enabled: false },
    openai: { apiKey: '', enabled: false },
    claude: { apiKey: '', enabled: false },
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await aiConfigApi.getConfig();
      setConfig(data);

      setFormData({
        defaultProvider: data.defaultProvider,
        gemini: {
          apiKey: '',
          enabled: data.providers.gemini?.enabled || false,
        },
        openai: {
          apiKey: '',
          enabled: data.providers.openai?.enabled || false,
        },
        claude: {
          apiKey: '',
          enabled: data.providers.claude?.enabled || false,
        },
      });
    } catch (error) {
      console.error('Failed to fetch AI config:', error);
      setMessage({ type: 'error', text: 'AI 설정을 불러오지 못했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const updateData: any = {
        defaultProvider: formData.defaultProvider,
        providers: {},
      };

      // API 키가 입력된 경우만 전송
      if (formData.gemini.apiKey) {
        updateData.providers.gemini = {
          apiKey: formData.gemini.apiKey,
          enabled: formData.gemini.enabled,
        };
      } else {
        updateData.providers.gemini = { enabled: formData.gemini.enabled };
      }

      if (formData.openai.apiKey) {
        updateData.providers.openai = {
          apiKey: formData.openai.apiKey,
          enabled: formData.openai.enabled,
        };
      } else {
        updateData.providers.openai = { enabled: formData.openai.enabled };
      }

      if (formData.claude.apiKey) {
        updateData.providers.claude = {
          apiKey: formData.claude.apiKey,
          enabled: formData.claude.enabled,
        };
      } else {
        updateData.providers.claude = { enabled: formData.claude.enabled };
      }

      await aiConfigApi.updateConfig(updateData);
      setMessage({ type: 'success', text: 'AI 설정이 저장되었습니다.' });

      // 설정 새로고침
      await fetchConfig();
    } catch (error: any) {
      console.error('Save failed:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || '저장에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (provider: AIProviderType) => {
    try {
      setMessage(null);
      const apiKey = formData[provider].apiKey;
      const result = await aiConfigApi.testProvider(provider, apiKey || undefined);

      if (result.success) {
        setMessage({ type: 'success', text: `${provider} API 연결 성공!` });
      } else {
        setMessage({ type: 'error', text: `${provider} API 연결 실패: ${result.message}` });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'API 테스트 실패' });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container>
      <Header>
        <Title>AI 설정</Title>
        <Subtitle>AI 제공자를 설정하고 API 키를 관리합니다.</Subtitle>
      </Header>

      {message && <Message type={message.type}>{message.text}</Message>}

      <Section>
        <SectionTitle>기본 AI 제공자</SectionTitle>
        <FormGroup>
          <Label>대화 시작 시 기본으로 사용할 AI 선택</Label>
          <select
            value={formData.defaultProvider}
            onChange={(e) => setFormData({ ...formData, defaultProvider: e.target.value as AIProviderType })}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}
          >
            <option value={AIProviderType.GEMINI}>Google Gemini (무료)</option>
            <option value={AIProviderType.OPENAI}>OpenAI GPT</option>
            <option value={AIProviderType.CLAUDE}>Anthropic Claude</option>
          </select>
        </FormGroup>
      </Section>

      <Section>
        <SectionTitle>Google Gemini (무료)</SectionTitle>
        {config?.providers.gemini?.hasApiKey && (
          <TestStatus success={config.providers.gemini.lastTestSuccess}>
            현재 키: {config.providers.gemini.apiKeyMasked}
            {config.providers.gemini.lastTestSuccess !== undefined &&
              ` - ${config.providers.gemini.lastTestSuccess ? '테스트 성공' : '테스트 실패'}`}
          </TestStatus>
        )}
        <FormGroup>
          <Label>API Key</Label>
          <Input
            type="password"
            value={formData.gemini.apiKey}
            onChange={(e) => setFormData({ ...formData, gemini: { ...formData.gemini, apiKey: e.target.value } })}
            placeholder="API 키를 입력하세요 (변경 시에만)"
          />
        </FormGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={formData.gemini.enabled}
            onChange={(e) => setFormData({ ...formData, gemini: { ...formData.gemini, enabled: e.target.checked } })}
          />
          활성화
        </CheckboxLabel>
        <ButtonGroup>
          <Button variant="secondary" onClick={() => handleTest(AIProviderType.GEMINI)}>
            테스트
          </Button>
        </ButtonGroup>
      </Section>

      <Section>
        <SectionTitle>OpenAI GPT (유료)</SectionTitle>
        {config?.providers.openai?.hasApiKey && (
          <TestStatus success={config.providers.openai.lastTestSuccess}>
            현재 키: {config.providers.openai.apiKeyMasked}
          </TestStatus>
        )}
        <FormGroup>
          <Label>API Key</Label>
          <Input
            type="password"
            value={formData.openai.apiKey}
            onChange={(e) => setFormData({ ...formData, openai: { ...formData.openai, apiKey: e.target.value } })}
            placeholder="API 키를 입력하세요 (변경 시에만)"
          />
        </FormGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={formData.openai.enabled}
            onChange={(e) => setFormData({ ...formData, openai: { ...formData.openai, enabled: e.target.checked } })}
          />
          활성화
        </CheckboxLabel>
        <ButtonGroup>
          <Button variant="secondary" onClick={() => handleTest(AIProviderType.OPENAI)}>
            테스트
          </Button>
        </ButtonGroup>
      </Section>

      <Section>
        <SectionTitle>Anthropic Claude (유료)</SectionTitle>
        {config?.providers.claude?.hasApiKey && (
          <TestStatus success={config.providers.claude.lastTestSuccess}>
            현재 키: {config.providers.claude.apiKeyMasked}
          </TestStatus>
        )}
        <FormGroup>
          <Label>API Key</Label>
          <Input
            type="password"
            value={formData.claude.apiKey}
            onChange={(e) => setFormData({ ...formData, claude: { ...formData.claude, apiKey: e.target.value } })}
            placeholder="API 키를 입력하세요 (변경 시에만)"
          />
        </FormGroup>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={formData.claude.enabled}
            onChange={(e) => setFormData({ ...formData, claude: { ...formData.claude, enabled: e.target.checked } })}
          />
          활성화
        </CheckboxLabel>
        <ButtonGroup>
          <Button variant="secondary" onClick={() => handleTest(AIProviderType.CLAUDE)}>
            테스트
          </Button>
        </ButtonGroup>
      </Section>

      <ButtonGroup>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? '저장 중...' : '전체 설정 저장'}
        </Button>
        <Button variant="secondary" onClick={() => navigate('/admin')}>
          취소
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default AdminAISettingsPage;
