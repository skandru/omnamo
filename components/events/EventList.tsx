"use client";

// components/events/EventList.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { EventCard } from './EventCard'
import { Event } from '../../types'

export default function EventList(): JSX.Element {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvents(): Promise<void> {
      try {
        setLoading(true)
        
        // Get future events
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .gte('event_date', new Date().toISOString())
          .order('event_date', { ascending: true })
        
        if (error) throw error
        
        setEvents(data || [])
      } catch (error) {
        console.error('Error fetching events:', error)
        setError('Failed to load events. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchEvents()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading events...</div>
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
        {error}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No upcoming events found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}