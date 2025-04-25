// pages/events/index.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from '../../components/layout/Layout'
import { supabase } from '../../lib/supabase'
import { EventCard } from '../../components/events/EventCard'
import { User, Event } from '../../types'

type FilterType = 'upcoming' | 'past' | 'all';

export default function EventsPage(): JSX.Element {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  
  // Filter state
  const [filter, setFilter] = useState<FilterType>('upcoming') // 'upcoming', 'past', 'all'
  
  useEffect(() => {
    async function fetchData(): Promise<void> {
      try {
        setLoading(true)
        
        // Check authentication status
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user as User | null)
        
        // Check if user is admin (placeholder - implement your own logic)
        if (user) {
          setIsAdmin(true) // For demonstration purposes, making all users admin
        }
        
        // Prepare query based on filter
        let query = supabase.from('events').select('*')
        
        if (filter === 'upcoming') {
          query = query.gte('event_date', new Date().toISOString())
            .order('event_date', { ascending: true })
        } else if (filter === 'past') {
          query = query.lt('event_date', new Date().toISOString())
            .order('event_date', { ascending: false })
        } else {
          // 'all' filter
          query = query.order('event_date', { ascending: true })
        }
        
        // Execute query
        const { data, error: eventsError } = await query
        
        if (eventsError) throw eventsError
        
        setEvents(data || [])
      } catch (error: any) {
        console.error('Error fetching events:', error)
        setError('Failed to load events')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [filter]) // Re-fetch when filter changes

  const handleFilterChange = (newFilter: FilterType): void => {
    setFilter(newFilter)
  }

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Community Events</h1>
          
          {isAdmin && (
            <Link href="/events/new">
              <a className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Create Event
              </a>
            </Link>
          )}
        </div>
        
        <div className="mt-4">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              className={`py-2 px-4 font-medium ${
                filter === 'upcoming'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleFilterChange('upcoming')}
            >
              Upcoming Events
            </button>
            <button
              className={`py-2 px-4 font-medium ${
                filter === 'past'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleFilterChange('past')}
            >
              Past Events
            </button>
            <button
              className={`py-2 px-4 font-medium ${
                filter === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleFilterChange('all')}
            >
              All Events
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2">Loading events...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            {filter === 'upcoming'
              ? 'No upcoming events found.'
              : filter === 'past'
              ? 'No past events found.'
              : 'No events found.'}
          </p>
          {isAdmin && (
            <Link href="/events/new">
              <a className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                Create an Event
              </a>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </Layout>
  )
}