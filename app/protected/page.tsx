import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import EventList from '@/components/events/EventList'; // Import EventList

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to sign-in if not authenticated (middleware should handle this first)
    redirect('/sign-in');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold mb-8">Events</h1>
        
        {/* Render the EventList component */}
        <EventList /> 

        {/* Optional: Keep a link back home or add other navigation */}
        <div className="mt-8">
           <Link href="/">
             <span className="text-blue-600 hover:underline">
               Back to Home
             </span>
           </Link>
         </div>
      </main>
    </div>
  );
}