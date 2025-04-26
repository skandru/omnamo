import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex items-center justify-center min-h-screen bg-white mt-8">
      <div className="w-full max-w-md mx-auto">
        <form className="flex flex-col items-center p-8 space-y-4 bg-white rounded shadow-md">
          <h1 className="text-2xl font-bold text-red-500">Sign in</h1>
          <p className="text-sm text-center">
            Don't have an account?{" "}
            <Link className="font-medium underline text-red-500" href="/sign-up">
              Sign up
            </Link>
          </p>
          <div className="w-full space-y-4">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</Label>
              <Input 
                name="email" 
                placeholder="you@example.com" 
                required 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</Label>
                <Link
                  className="text-xs underline text-red-500"
                  href="/forgot-password"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                type="password"
                name="password"
                placeholder="Your password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="w-full">
              <SubmitButton 
                pendingText="Signing In..." 
                formAction={signInAction} 
                className="w-full px-4 py-2 text-white bg-amber-500 rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400"
              >
                Sign in
              </SubmitButton>
            </div>
            <FormMessage message={searchParams} />
          </div>
        </form>
      </div>
    </div>
  );
}