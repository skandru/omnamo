// components/events/AttendeeForm.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import { User, Attendee } from '../../types'

interface AttendeeFormProps {
  eventId: string;
}

interface FormData {
  numberOfFamilyMembers: number;
  additionalNotes: string;
}

export default function AttendeeForm({ eventId }: AttendeeFormProps): JSX.Element {
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | boolean>(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  
  const [formData, setFormData] = useState<FormData>({
    numberOfFamilyMembers: 0,
    additionalNotes: ''
  })

  // Check if user is authenticated and fetch event details
  useEffect(() => {
    async function fetchData(): Promise<void> {
      try {
        setLoading(true)
        
        // Check authentication status
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          // Redirect to login if not authenticated
          router.push(`/auth/signin?redirect=/events/${eventId}/register`)
          return
        }
        
        setUser(user as unknown as User)
        
        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single()
        
        if (eventError) throw eventError
        
        if (!eventData) {
          throw new Error('Event not found')
        }
        
        setEvent(eventData)
        
        // Check if user is already registered
        const { data: existingRegistration, error: registrationError } = await supabase
          .from('attendees')
          .select('*')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .single()
        
        if (registrationError && registrationError.code !== 'PGRST116') {
          // PGRST116 means no rows returned, which is expected if user isn't registered
          throw registrationError
        }
        
        if (existingRegistration) {
          setFormData({
            numberOfFamilyMembers: existingRegistration.number_of_family_members,
            additionalNotes: existingRegistration.additional_notes || ''
          })
          setSuccess('You are already registered for this event. You can update your registration details below.')
        }
        
      } catch (error: any) {
        console.error('Error fetching data:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [eventId, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    
    if (!user) {
      setError('You must be logged in to register for an event')
      return
    }
    
    try {
      setSubmitting(true)
      setError(null)
      setSuccess(false)
      
      // Check if user is already registered
      const { data: existingRegistration, error: checkError } = await supabase
        .from('attendees')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single()
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }
      
      if (existingRegistration) {
        // Update existing registration
        const { error: updateError } = await supabase
          .from('attendees')
          .update({
            number_of_family_members: formData.numberOfFamilyMembers,
            additional_notes: formData.additionalNotes,
            updated_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRegistration.id)
        
        if (updateError) throw updateError
        
        setSuccess('Your registration has been updated successfully!')
      } else {
        // Create new registration
        const { error: insertError } = await supabase
          .from('attendees')
          .insert([
            {
              event_id: eventId,
              user_id: user.id,
              number_of_family_members: formData.numberOfFamilyMembers,
              additional_notes: formData.additionalNotes,
              created_by: user.id,
              updated_by: user.id
            }
          ])
        
        if (insertError) throw insertError
        
        setSuccess('You have been registered for this event successfully!')
      }
      
      // Redirect to event details page after short delay
      setTimeout(() => {
        router.push(`/events/${eventId}`)
      }, 2000)
      
    } catch (error: any) {
      console.error('Error registering for event:', error)
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (error && error.includes('Event not found')) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Event not found. Please check the URL and try again.
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Unable to load event details. Please try again later.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2">Register for Event</h2>
      <h3 className="text-lg font-semibold mb-6">{event.name}</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="numberOfFamilyMembers">
            Number of Family Members Attending (including yourself)
          </label>
          <input
            id="numberOfFamilyMembers"
            name="numberOfFamilyMembers"
            type="number"
            min="1"
            required
            value={formData.numberOfFamilyMembers}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="additionalNotes">
            Additional Notes (dietary requirements, accessibility needs, etc.)
          </label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            rows={3}
            value={formData.additionalNotes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <button
          type="submit"
          disabled={submitting}
          className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 ${
            submitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {submitting ? 'Processing...' : success ? 'Update Registration' : 'Register Now'}
        </button>
      </form>
    </div>
  )
}
