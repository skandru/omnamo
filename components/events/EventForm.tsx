// components/events/EventForm.tsx
import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import { formatDateForInput } from '../../lib/utils'
import { User, Event } from '../../types'

interface EventFormProps {
  eventId?: string;
}

interface EventFormData {
  name: string;
  eventDate: string;
  eventTime: string;
  location: string;
  description: string;
}

export default function EventForm({ eventId }: EventFormProps): JSX.Element {
  const isEditMode = !!eventId
  const [loading, setLoading] = useState<boolean>(isEditMode)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | boolean>(false)
  const [user, setUser] = useState<User | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const router = useRouter()
  
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    eventDate: formatDateForInput(new Date()),
    eventTime: '18:00',
    location: '',
    description: ''
  })

  // Check if user is authenticated and fetch event details if in edit mode
  useEffect(() => {
    async function fetchData(): Promise<void> {
      try {
        // Check authentication status
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          // Redirect to login if not authenticated
          router.push('/auth/signin?redirect=' + (isEditMode ? `/events/${eventId}/edit` : '/events/new'))
          return
        }
        
        setUser(user as unknown as User)
        
        // Check if user is an admin (you'll need to implement this based on your authorization logic)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (userError) throw userError
        
        // Here you would check if user has admin rights
        // This is just a placeholder - implement your own logic
        const isAdmin = true // userData.role === 'admin'
        
        if (!isAdmin) {
          setError('You do not have permission to create or edit events')
          return
        }
        
        // If in edit mode, fetch event details
        if (isEditMode && eventId) {
          const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single()
          
          if (eventError) throw eventError
          
          if (!eventData) {
            throw new Error('Event not found')
          }
          
          // Parse date and time
          const eventDateTime = new Date(eventData.event_date)
          const eventDate = formatDateForInput(eventDateTime)
          const hours = eventDateTime.getHours().toString().padStart(2, '0')
          const minutes = eventDateTime.getMinutes().toString().padStart(2, '0')
          const eventTime = `${hours}:${minutes}`
          
          setFormData({
            name: eventData.name,
            eventDate,
            eventTime,
            location: eventData.location,
            description: eventData.description || ''
          })
          
          if (eventData.image_url) {
            setImagePreview(eventData.image_url)
          }
        }
        
      } catch (error: any) {
        console.error('Error fetching data:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [eventId, isEditMode, router])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const file = files[0]
    setImageFile(file)
    
    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `event-images/${fileName}`
    
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    // Get public URL
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)
    
    return data.publicUrl
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    
    if (!user) {
      setError('You must be logged in to create or edit events')
      return
    }
    
    try {
      setSubmitting(true)
      setError(null)
      setSuccess(false)
      
      // Combine date and time
      const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`)
      
      // Upload image if selected
      let imageUrl: string | null = null
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }
      
      if (isEditMode && eventId) {
        // Update existing event
        const updates: Partial<Event> = {
          name: formData.name,
          event_date: eventDateTime.toISOString(),
          location: formData.location,
          description: formData.description,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        }
        
        // Only update image if a new one was uploaded
        if (imageUrl) {
          updates.image_url = imageUrl
        }
        
        const { error: updateError } = await supabase
          .from('events')
          .update(updates)
          .eq('id', eventId)
        
        if (updateError) throw updateError
        
        setSuccess('Event updated successfully!')
      } else {
        // Create new event
        const { error: insertError } = await supabase
          .from('events')
          .insert([
            {
              name: formData.name,
              event_date: eventDateTime.toISOString(),
              location: formData.location,
              description: formData.description,
              image_url: imageUrl,
              created_by: user.id,
              updated_by: user.id
            }
          ])
        
        if (insertError) throw insertError
        
        setSuccess('Event created successfully!')
        
        // Reset form
        setFormData({
          name: '',
          eventDate: formatDateForInput(new Date()),
          eventTime: '18:00',
          location: '',
          description: ''
        })
        setImageFile(null)
        setImagePreview(null)
      }
      
      // Redirect to events page after short delay
      setTimeout(() => {
        router.push('/events')
      }, 2000)
      
    } catch (error: any) {
      console.error('Error saving event:', error)
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (error && error.includes('permission')) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button 
          onClick={() => router.push('/events')}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Back to Events
        </button>
      </div>
    )
  }

  if (isEditMode && error && error.includes('Event not found')) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Event not found. Please check the URL and try again.
        </div>
        <button 
          onClick={() => router.push('/events')}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Back to Events
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Edit Event' : 'Create New Event'}
      </h2>
      
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
          <label className="block text-gray-700 mb-2" htmlFor="name">
            Event Name*
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="eventDate">
              Event Date*
            </label>
            <input
              id="eventDate"
              name="eventDate"
              type="date"
              required
              value={formData.eventDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="eventTime">
              Event Time*
            </label>
            <input
              id="eventTime"
              name="eventTime"
              type="time"
              required
              value={formData.eventTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="location">
            Location*
          </label>
          <input
            id="location"
            name="location"
            type="text"
            required
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="eventImage">
            Event Image
          </label>
          <input
            id="eventImage"
            name="eventImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          
          {imagePreview && (
            <div className="mt-3">
              <p className="text-sm text-gray-500 mb-2">Preview:</p>
              <img 
                src={imagePreview} 
                alt="Event image preview" 
                className="w-full max-h-64 object-cover rounded-md"
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.push('/events')}
            className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={submitting}
            className={`bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting 
              ? 'Saving...' 
              : isEditMode 
                ? 'Update Event' 
                : 'Create Event'
            }
          </button>
        </div>
      </form>
    </div>
  )
}
