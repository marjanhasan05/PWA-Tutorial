import React from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import RegisterView from '../../components/RegisterView';
import { useRegisterMutation } from '../../features/auth/authApi';
import { setCredentials } from '../../features/auth/authSlice';
import type { RegisterRequest } from '../../features/auth/authTypes';
import { getApiErrorMessage } from '../../types/api';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleRegister = async (values: RegisterRequest) => {
    setErrorMessage(null);

    try {
      const response = await registerUser(values).unwrap();
      dispatch(setCredentials(response.data));
      toast.success(response.message || 'Account created successfully.');
      navigate('/app', { replace: true });
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Unable to create your account right now.',
      );
      setErrorMessage(message);
      toast.error(message);
    }
  };

  return (
    <RegisterView
      errorMessage={errorMessage}
      isLoading={isLoading}
      onGoToLogin={() => navigate('/login')}
      onRegister={handleRegister}
    />
  );
}
