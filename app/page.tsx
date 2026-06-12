import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { Landing } from '@/components/landing/Landing';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Signed-in visitors go straight to their collection; everyone else sees the
  // marketing landing (the homepage is no longer the login screen).
  const user = await getSessionUser();
  if (user) redirect('/collection');
  return <Landing />;
}
