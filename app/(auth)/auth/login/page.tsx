import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In | Admin Dashboard',
  description: 'Sign in to access your admin dashboard',
};

export default function LoginPage() {
  return <LoginForm />;
}