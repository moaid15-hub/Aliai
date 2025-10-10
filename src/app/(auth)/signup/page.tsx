import { SignupForm } from '@/components/auth/SignupForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إنشاء حساب | Oqool AI',
  description: 'أنشئ حسابك في Oqool AI',
};

export default function SignupPage() {
  return <SignupForm />;
}


