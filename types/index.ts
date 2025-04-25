// types/index.ts

export interface User {
    id: string;
    username: string | null;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string | null;
    gotram_id: string | null;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
    gotrams?: Gotram;
  }
  
  export interface Gotram {
    id: string;
    gotranamalu: string;
    nakshtram: string;
    rasi: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface Event {
    id: string;
    name: string;
    event_date: string;
    location: string;
    image_url: string | null;
    description: string | null;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
  }
  
  export interface Attendee {
    id: string;
    event_id: string;
    user_id: string;
    number_of_family_members: number;
    additional_notes: string | null;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
    users?: User;
  }
  
  export interface Payment {
    id: string;
    event_id: string;
    user_id: string;
  payment_date: string;
  payment_method: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  provider: string | null;
  additional_info: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  }
  
  export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash';
  
  export interface FormattedEvent extends Event {
    isPast?: boolean;
    formattedDate?: string;
  }
  
  export interface SupabaseAuthResponse {
    data: { 
      user: User | null 
    };
    error: Error | null;
  }