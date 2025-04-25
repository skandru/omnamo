// components/events/EventCard.tsx
import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '../../lib/utils'
import { Event } from '../../types'

interface EventCardProps {
  event: Event;
  showRegisterButton?: boolean;
}

export function EventCard({ event, showRegisterButton = true }: EventCardProps): JSX.Element {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {event.image_url ? (
        <div className="relative h-48 w-full">
          <Image
            src={event.image_url}
            alt={event.name}
            layout="fill"
            objectFit="cover"
          />
        </div>
      ) : (
        <div className="bg-gray-200 h-48 flex items-center justify-center">
          <p className="text-gray-500">No image available</p>
        </div>
      )}

      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
        
        <div className="text-gray-600 mb-2">
          <p><strong>Date:</strong> {formatDate(event.event_date)}</p>
          <p><strong>Location:</strong> {event.location}</p>
        </div>
        
        {event.description && (
          <p className="text-gray-600 mb-4">{event.description}</p>
        )}
        
        <div className="flex justify-between">
          <Link href={`/events/${event.id}`}>
            <a className="text-blue-500 hover:underline">View Details</a>
          </Link>
          
          {showRegisterButton && (
            <Link href={`/events/${event.id}/register`}>
              <a className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">
                Register
              </a>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
