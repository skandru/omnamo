"use client";
import Link from 'next/link';
import EventList from '@/components/events/EventList';
import EventForm from '@/components/events/EventForm'; // Import EventList
import { useState } from 'react';

export default function ProtectedPageClient() {
  const [showEventForm, setShowEventForm] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold mb-8">Events</h1>

        <button
          className="bg-green-500 text-white rounded px-4 py-2 mb-4"
          onClick={() => setShowEventForm(!showEventForm)}
        >
          {showEventForm ? 'Hide Event Form' : 'Create Event'}
        </button>

        {showEventForm && <EventForm />}

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
