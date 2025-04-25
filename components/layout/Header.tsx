// components/layout/Header.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import { User } from '../../types'

export default function Header(): JSX.Element {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    // Check authentication status on mount and on auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
     // setUser(session?.user.last_name as User || undefined)
      setLoading(false)
    })
    
    // Initial check
    const checkUser = async (): Promise<void> => {
      const { data: { user } } = await supabase.auth.getUser()
     // setUser(user as User)
      setLoading(false)
    }
    
    checkUser()
    
    // Cleanup subscription
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-blue-600 text-white shadow">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/">
            <a className="text-xl font-bold">Community Organization</a>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/">
              <a className="hover:text-blue-200">Home</a>
            </Link>
            <Link href="/events">
              <a className="hover:text-blue-200">Events</a>
            </Link>
            
            {!loading && (
              user ? (
                <>
                  <Link href="/profile">
                    <a className="hover:text-blue-200">Profile</a>
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="hover:text-blue-200"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <a className="hover:text-blue-200">Sign In</a>
                  </Link>
                  <Link href="/auth/signup">
                    <a className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100">
                      Sign Up
                    </a>
                  </Link>
                </>
              )
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-3 space-y-3 pb-3">
            <Link href="/">
              <a className="block hover:text-blue-200">Home</a>
            </Link>
            <Link href="/events">
              <a className="block hover:text-blue-200">Events</a>
            </Link>
            
            {!loading && (
              user ? (
                <>
                  <Link href="/profile">
                    <a className="block hover:text-blue-200">Profile</a>
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="block hover:text-blue-200 w-full text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <a className="block hover:text-blue-200">Sign In</a>
                  </Link>
                  <Link href="/auth/signup">
                    <a className="block bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 inline-block">
                      Sign Up
                    </a>
                  </Link>
                </>
              )
            )}
          </nav>
        )}
      </div>
    </header>
  )
}



