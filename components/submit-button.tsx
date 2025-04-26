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
      className={className}
    >
      {pending ? pendingText : children}
    </button>
  );
}