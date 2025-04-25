// components/profile/ProfileForm.tsx
import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import { isValidEmail, isValidPhone } from '../../lib/utils'
import { User, Gotram } from '../../types'

interface ProfileFormData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  existingGotram: 'existing' | 'new';
  gotramId: string;
  // For new gotram entry
  gotranamalu: string;
  nakshtram: string;
  rasi: string;
}

export default function ProfileForm(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | boolean>(false)
  const [user, setUser] = useState<User | null>(null)
  const [gotrams, setGotrams] = useState<Gotram[]>([])
  const router = useRouter()
  
  const [formData, setFormData] = useState<ProfileFormData>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    existingGotram: 'existing', // 'existing' or 'new'
    gotramId: '',
    // For new gotram entry
    gotranamalu: '',
    nakshtram: '',
    rasi: ''
  })

  // Fetch user data and gotrams on component mount
  useEffect(() => {
    async function fetchData(): Promise<void> {
      try {
        setLoading(true)
        
        // Check authentication status
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          // Redirect to login if not authenticated
          router.push('/auth/signin?redirect=/profile')
          return
        }
        
        // Create a valid User object with the properties we need
        setUser({
          id: user.id,
          email: user.email || '',
          // Provide default values for required fields
          username: null,
          first_name: '',
          last_name: '',
          phone_number: null,
          gotram_id: null,
          created_at: user.created_at || new Date().toISOString(),
          updated_at: user.updated_at || new Date().toISOString(),
          created_by: null,
          updated_by: null
        })
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*, gotrams(*)')
          .eq('id', user.id)
          .single()
        
        if (profileError) throw profileError
        
        // Fetch all gotrams for dropdown
        const { data: gotramsData, error: gotramsError } = await supabase
          .from('gotrams')
          .select('*')
        
        if (gotramsError) throw gotramsError
        
        setGotrams(gotramsData || [])
        
        // Set form data from profile
        setFormData({
          username: profileData.username || '',
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          email: profileData.email || '',
          phoneNumber: profileData.phone_number || '',
          existingGotram: profileData.gotram_id ? 'existing' : 'new',
          gotramId: profileData.gotram_id || '',
          gotranamalu: profileData.gotrams?.gotranamalu || '',
          nakshtram: profileData.gotrams?.nakshtram || '',
          rasi: profileData.gotrams?.rasi || ''
        })
        
      } catch (error: any) {
        console.error('Error fetching profile:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [router])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = (): boolean => {
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('First name, last name, and email are required')
      return false
    }
    
    // Validate email format
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    
    // Validate phone format if provided
    if (formData.phoneNumber && !isValidPhone(formData.phoneNumber)) {
      setError('Please enter a valid phone number')
      return false
    }
    
    // Validate gotram details if adding new
    if (formData.existingGotram === 'new') {
      if (!formData.gotranamalu || !formData.nakshtram || !formData.rasi) {
        setError('All gotram details are required when adding a new gotram')
        return false
      }
    } else if (!formData.gotramId) {
      setError('Please select a gotram')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    
    if (!user) {
      setError('You must be logged in to update your profile')
      return
    }
    
    if (!validateForm()) {
      return
    }
    
    try {
      setSubmitting(true)
      setError(null)
      setSuccess(false)
      
      // Determine gotram ID - use existing or create new
      let gotramId = formData.gotramId
      
      if (formData.existingGotram === 'new') {
        // Create new gotram record
        const { data: newGotram, error: gotramError } = await supabase
          .from('gotrams')
          .insert([
            {
              gotranamalu: formData.gotranamalu,
              nakshtram: formData.nakshtram,
              rasi: formData.rasi
            }
          ])
          .select()
        
        if (gotramError) throw gotramError
        gotramId = newGotram[0].id
      }

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: formData.username,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone_number: formData.phoneNumber,
          gotram_id: gotramId,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (updateError) throw updateError

      // If email changed, update auth email
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        })
        
        if (emailError) throw emailError
      }
      
      setSuccess('Profile updated successfully!')
      
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
      
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
          <label className="block text-gray-700 mb-2" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="firstName">
              First Name*
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="lastName">
              Last Name*
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Email*
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          {user && formData.email !== user.email && (
            <p className="text-sm text-yellow-600 mt-1">
              Note: Changing your email will require verification of the new email address.
            </p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="phoneNumber">
            Phone Number
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Gotram Information
          </label>
          
          <div className="flex gap-4 mb-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="existingGotram"
                value="existing"
                checked={formData.existingGotram === 'existing'}
                onChange={handleChange}
                className="mr-2"
              />
              Select existing
            </label>
            
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="existingGotram"
                value="new"
                checked={formData.existingGotram === 'new'}
                onChange={handleChange}
                className="mr-2"
              />
              Add new
            </label>
          </div>
          
          {formData.existingGotram === 'existing' ? (
            <div>
              <select
                name="gotramId"
                value={formData.gotramId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">-- Select Gotram --</option>
                {gotrams.map(gotram => (
                  <option key={gotram.id} value={gotram.id}>
                    {gotram.gotranamalu} - {gotram.nakshtram} - {gotram.rasi}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="gotranamalu">
                  Gotranamalu
                </label>
                <input
                  id="gotranamalu"
                  name="gotranamalu"
                  type="text"
                  value={formData.gotranamalu}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="nakshtram">
                  Nakshtram
                </label>
                <input
                  id="nakshtram"
                  name="nakshtram"
                  type="text"
                  value={formData.nakshtram}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="rasi">
                  Rasi
                </label>
                <input
                  id="rasi"
                  name="rasi"
                  type="text"
                  value={formData.rasi}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.push('/')}
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
            {submitting ? 'Saving...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}