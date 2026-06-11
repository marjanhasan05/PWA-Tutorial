import React from 'react';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import LoginView from '../../components/LoginView';
import { useLoginMutation } from '../../features/auth/authApi';
import { setCredentials } from '../../features/auth/authSlice';
import type { LoginRequest } from '../../features/auth/authTypes';
import { getApiErrorMessage } from '../../types/api';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const fromPath =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof location.state.from === 'object' &&
    location.state.from !== null &&
    'pathname' in location.state.from &&
    typeof location.state.from.pathname === 'string'
      ? location.state.from.pathname
      : '/app';

  const handleLogin = async (values: LoginRequest) => {
    setErrorMessage(null);

    try {
      const response = await login(values).unwrap();
      dispatch(setCredentials(response.data));
      toast.success(response.message || 'Signed in successfully.');
      navigate(fromPath, { replace: true });
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Unable to sign in right now.',
      );
      setErrorMessage(message);
      toast.error(message);
    }
  };

  return (
    <LoginView
      errorMessage={errorMessage}
      isLoading={isLoading}
      onGoToRegister={() => navigate('/register')}
      onLogin={handleLogin}
    />
  );
}
