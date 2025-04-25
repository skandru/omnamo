'use client';

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
  formAction?: any;
  pendingText?: string;
};

export function SubmitButton({ children, className = '', formAction, pendingText = 'Processing...' }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      formAction={formAction}
      // Remove w-full from the default classes
      className={`py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      {pending ? pendingText : children}
    </button>
  );
}