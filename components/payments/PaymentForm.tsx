// components/payments/PaymentForm.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import { User, Event, Attendee, Payment, PaymentMethod } from '../../types'

interface PaymentFormProps {
  eventId: string;
}

interface PaymentFormData {
  paymentMethod: PaymentMethod;
  amount: number;
  paymentProvider: string;
  additionalInfo: string;
}

interface PaymentMethodOption {
  id: PaymentMethod;
  label: string;
}

export default function PaymentForm({ eventId }: PaymentFormProps): JSX.Element {
  const [event, setEvent] = useState<Event | null>(null)
  const [isRegistered, setIsRegistered] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | boolean>(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  
  const [formData, setFormData] = useState<PaymentFormData>({
    paymentMethod: 'credit_card',
    amount: 0, // Will be calculated based on attendees
    paymentProvider: '',
    additionalInfo: ''
  })

  // Payment method options
  const paymentMethods: PaymentMethodOption[] = [
    { id: 'credit_card', label: 'Credit Card' },
    { id: 'debit_card', label: 'Debit Card' },
    { id: 'paypal', label: 'PayPal' },
    { id: 'bank_transfer', label: 'Bank Transfer' },
    { id: 'cash', label: 'Cash (Pay at Event)' }
  ]

  // Check if user is authenticated, registered, and fetch event details
  useEffect(() => {
    async function fetchData(): Promise<void> {
      try {
        setLoading(true)
        
        // Check authentication status
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          // Redirect to login if not authenticated
          router.push(`/auth/signin?redirect=/events/${eventId}/payment`)
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
        
        // Check if user is registered for this event
        const { data: registrationData, error: registrationError } = await supabase
          .from('attendees')
          .select('*')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .single()
        
        if (registrationError) {
          if (registrationError.code === 'PGRST116') {
            // Not registered
            setIsRegistered(false)
            // Redirect to registration
            router.push(`/events/${eventId}/register`)
            return
          }
          throw registrationError
        }
        
        setIsRegistered(true)
        
        // Calculate amount based on number of attendees
        // You can modify this based on your pricing model
        const basePrice = 25 // $25 per person
        const calculatedAmount = basePrice * (1 + registrationData.number_of_family_members)
        
        setFormData(prev => ({
          ...prev,
          amount: calculatedAmount
        }))
        
        // Check if payment already exists
        const { data: existingPayment, error: paymentError } = await supabase
          .from('payments')
          .select('*')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .single()
        
        if (paymentError && paymentError.code !== 'PGRST116') {
          throw paymentError
        }
        
        if (existingPayment) {
          // Payment already exists
          setFormData({
            paymentMethod: existingPayment.payment_method as PaymentMethod,
            amount: existingPayment.amount,
            paymentProvider: existingPayment.provider || '',
            additionalInfo: (existingPayment as Payment).additional_info || ''
          })
          
          if (existingPayment.status === 'completed') {
            setSuccess('You have already paid for this event. Thank you!')
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
  }, [eventId, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    
    if (!user) {
      setError('You must be logged in to make a payment')
      return
    }
    
    if (!isRegistered) {
      setError('You must register for the event before making a payment')
      return
    }
    
    try {
      setSubmitting(true)
      setError(null)
      
      // Process payment
      // In a real application, you would integrate with a payment gateway here
      
      // For now, we'll just record the payment intent in our database
      const { data: existingPayment, error: checkError } = await supabase
        .from('payments')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single()
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }
      
      // Determine payment status
      // In a real app, this would come from the payment processor
      const paymentStatus = formData.paymentMethod === 'cash' ? 'pending' : 'completed'
      
      if (existingPayment) {
        // Update existing payment
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            payment_method: formData.paymentMethod,
            amount: formData.amount,
            provider: formData.paymentProvider,
            status: paymentStatus,
            payment_date: new Date().toISOString(),
            updated_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPayment.id)
        
        if (updateError) throw updateError
      } else {
        // Create new payment record
        const { error: insertError } = await supabase
          .from('payments')
          .insert([
            {
              event_id: eventId,
              user_id: user.id,
              payment_method: formData.paymentMethod,
              amount: formData.amount,
              provider: formData.paymentProvider,
              status: paymentStatus,
              payment_date: new Date().toISOString(),
              created_by: user.id,
              updated_by: user.id
            }
          ])
        
        if (insertError) throw insertError
      }
      
      // Show success message
      setSuccess(
        formData.paymentMethod === 'cash'
          ? 'Your cash payment will be collected at the event. Thank you!'
          : 'Payment processed successfully! Thank you for your payment.'
      )
      
      // Redirect to event details page after short delay
      setTimeout(() => {
        router.push(`/events/${eventId}`)
      }, 3000)
      
    } catch (error: any) {
      console.error('Error processing payment:', error)
      setError('Failed to process payment: ' + error.message)
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

  if (!isRegistered) {
    return (
      <div className="text-center py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          You must register for this event before making a payment.
        </div>
        <button 
          onClick={() => router.push(`/events/${eventId}/register`)}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Register Now
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2">Payment for Event</h2>
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
          <label className="block text-gray-700 mb-2" htmlFor="amount">
            Total Amount ($)
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <p className="text-sm text-gray-500 mt-1">
            Base price: $25 per person
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paymentMethods.map(method => (
              <label key={method.id} className="inline-flex items-center">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={formData.paymentMethod === method.id}
                  onChange={handleChange}
                  className="mr-2"
                />
                {method.label}
              </label>
            ))}
          </div>
        </div>
        
        {formData.paymentMethod !== 'cash' && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="paymentProvider">
              Payment Provider
            </label>
            <input
              id="paymentProvider"
              name="paymentProvider"
              type="text"
              placeholder={
                formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'debit_card'
                  ? 'Visa, Mastercard, etc.'
                  : formData.paymentMethod === 'bank_transfer'
                  ? 'Bank name'
                  : ''
              }
              value={formData.paymentProvider}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="additionalInfo">
            Additional Information
          </label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            rows={3}
            value={formData.additionalInfo}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <button
          type="submit"
          disabled={submitting || success === true}
          className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 ${
            (submitting || success === true) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {submitting ? 'Processing...' : success ? 'Payment Successful' : 'Complete Payment'}
        </button>
      </form>
    </div>
  )
}