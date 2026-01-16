import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/store/slices/auth-slice'; // Your auth logic

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // If they aren't an admin or superadmin, send them to the user dashboard
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    redirect('/user'); 
  }

  return (
    <section>
      <nav>Admin Navbar (User Management, Suspension)</nav>
      {children}
    </section>
  );
}