// components/layout/Layout.tsx
import React, { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps): JSX.Element {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}