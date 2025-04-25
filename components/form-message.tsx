import React from 'react';

export type Message = {
  type: 'error' | 'success';
  text: string;
};

type FormMessageProps = {
  message?: Message;
};

export function FormMessage({ message }: FormMessageProps) {
  if (!message || !message.text) return null;

  const colors = {
    error: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <div
      className={`${colors[message.type]} p-3 rounded-md border my-4 text-sm`}
      role={message.type === 'error' ? 'alert' : 'status'}
    >
      {message.text}
    </div>
  );
}
