import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <a className="text-blue-600" href="https://nextjs.org">
            Next.js
          </a>{' '}
          with{' '}
          <a className="text-green-600" href="https://supabase.com">
            Supabase
          </a>
        </h1>

        <p className="mt-3 text-2xl">
          Get started by navigating to the{' '}
          {user ? (
            <Link href="/protected" className="text-blue-600 hover:underline">
              protected page
            </Link>
          ) : (
            <Link href="/sign-in" className="text-blue-600 hover:underline">
              login page
            </Link>
          )}
        </p>

        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          {user ? (
            <div className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600">
              <h3 className="text-2xl font-bold">You are logged in</h3>
              <p className="mt-4 text-xl">
                Email: {user.email}
              </p>
              <form action="/auth/signout" method="post">
                <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <div className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600">
              <h3 className="text-2xl font-bold">Authentication</h3>
              <p className="mt-4 text-xl">
                Sign in to access protected content.
              </p>
              <Link href="/sign-in">
                <span className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block">
                  Sign in
                </span>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
