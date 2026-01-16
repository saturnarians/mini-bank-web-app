import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/store/slices/auth-slice'; // Your auth logic

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // If no session exists at all, send to login
  if (!user) {
    redirect('/login');
  }

  return <>{children}</>;
}