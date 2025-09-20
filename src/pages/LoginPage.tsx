import React, { useState } from 'react';
import styled from 'styled-components';
import { authService, LoginData } from '../services/authApi';

const LoginContainer = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Button = styled.button`
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  text-align: center;
  margin-top: 1rem;
`;

const SuccessMessage = styled.div`
  color: #27ae60;
  text-align: center;
  margin-top: 1rem;
`;

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authService.login(formData);
      setSuccess('로그인 성공!');
      setTimeout(() => {
        // 페이지 새로고침으로 인증 상태 즉시 반영
        window.location.href = '/';
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <Title>로그인</Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="email">이메일</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">비밀번호</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <Button type="submit" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </Button>
      </Form>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
    </LoginContainer>
  );
};

export default LoginPage;