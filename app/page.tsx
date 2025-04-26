import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to protected page if user is already logged in
  if (user) {
    redirect('/protected')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white py-2">
      <main className="flex flex-col items-center justify-center w-full max-w-md px-4">
        <h1 className="text-3xl font-bold text-red-500 mb-8 text-center whitespace-nowrap">
          Welcome to Sri Venkateswara Temple
        </h1>
        
        <div className="w-full bg-white rounded shadow-md p-8 flex flex-col items-center">
          <p className="text-lg mb-6">Please sign in to access temple services</p>
          
          <Link href="/sign-in">
            <button className="w-full px-4 py-2 text-white bg-amber-500 rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400">
              Sign In
            </button>
          </Link>
          
          <p className="mt-4 text-sm">
            Don't have an account?{" "}
            <Link className="font-medium underline text-red-500" href="/sign-up">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}