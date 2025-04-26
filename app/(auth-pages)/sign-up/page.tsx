"use client";

import { createClient } from '@supabase/supabase-js';
import React, { useState } from 'react';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        // Insert user data into the 'users' table
        const { data: insertData, error: insertError } = await supabase
          .from('users')
          .insert([{ email: email }]); // Only store email, password is handled by Supabase Auth

        if (insertError) {
          setError(insertError.message);
        } else {
          setSuccess(true);
        }
      }
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white mt-8">
      <div className="w-full max-w-md mx-auto">
        <form onSubmit={handleSignUp} className="flex flex-col items-center p-8 space-y-4 bg-white rounded shadow-md">
          <h2 className="text-2xl font-bold text-red-500">Sign Up</h2>
          <p className="text-sm text-center">
            Already have an account?{" "}
            <Link className="font-medium underline text-red-500" href="/sign-in">
              Sign in
            </Link>
          </p>
          <div className="w-full space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <button 
              type="submit" 
              className="w-full px-4 py-2 text-white bg-amber-500 rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400"
            >
              Sign Up
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">Sign up successful! Please confirm your email.</p>}
          </div>
        </form>
      </div>
    </div>
  );
}