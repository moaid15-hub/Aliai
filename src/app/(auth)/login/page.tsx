import { LoginForm } from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تسجيل الدخول | Oqool AI',
  description: 'سجل دخولك إلى Oqool AI',
};

export default function LoginPage() {
  return <LoginForm />;
}


