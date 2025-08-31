// app/(auth)/auth/register/page.tsx
import { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Sign Up | Admin Dashboard',
  description: 'Create your admin account to get started',
};

export default function RegisterPage() {
  return <RegisterForm />;
}