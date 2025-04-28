"use client";

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function EventForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('events')
        .insert({
          name,
          description,
          event_date: `${date}T${time}`,
          location,
          image_url: image,
        });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setName('');
        setDescription('');
        setDate('');
        setTime('');
        setLocation('');
        setImage('');
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-500">Event created successfully!</div>}
      <label htmlFor="name">Name:</label>
      <input
        type="text"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="border rounded px-2 py-1"
      />
      <label htmlFor="description">Description:</label>
      <textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        className="border rounded px-2 py-1"
      />
      <label htmlFor="date">Date:</label>
      <input
        type="date"
        id="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        className="border rounded px-2 py-1"
      />
      <label htmlFor="time">Time:</label>
      <input
        type="time"
        id="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        required
        className="border rounded px-2 py-1"
      />
      <label htmlFor="location">Location:</label>
      <input
        type="text"
        id="location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
        className="border rounded px-2 py-1"
      />
      <label htmlFor="image">Image URL:</label>
      <input
        type="text"
        id="image"
        value={image}
        onChange={(e) => setImage(e.target.value)}
        className="border rounded px-2 py-1"
      />
      <button type="submit" disabled={loading} className="bg-blue-500 text-white rounded px-4 py-2">
        {loading ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
}
