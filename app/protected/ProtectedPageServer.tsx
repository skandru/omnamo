import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ProtectedPageClient from './ProtectedPageClient';

export default async function ProtectedPageServer() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  return <ProtectedPageClient />;
}
