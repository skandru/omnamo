// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind CSS
 * @param {ClassValue[]} inputs - Class names to combine
 * @returns {string} Combined class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date for display
 * @param {Date|string} date - Date object or ISO string
 * @param {Intl.DateTimeFormatOptions} options - Formatting options
 * @returns {string} Formatted date string
 */
 export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  }
  
  return dateObj.toLocaleDateString('en-US', defaultOptions)
}

/**
 * Format a date for input[type="date"]
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

/**
 * Generate a human-readable ID
 * @returns {string} Random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

/**
 * Check if user has admin permissions
 * @param {Object|null} user - User object from Supabase
 * @param {string[]} adminEmails - List of admin email addresses
 * @returns {boolean} True if user is an admin
 */
export function isAdmin(user: { email: string } | null, adminEmails: string[] = []): boolean {
  if (!user) return false
  
  // Check if user's email is in the admin list
  return adminEmails.includes(user.email)
}

/**
 * Truncate text to a specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text: string | null | undefined, length: number = 100): string {
  if (!text || text.length <= length) return text || ''
  return text.slice(0, length) + '...'
}

/**
 * Group array items by a specific property
 * @param {Array} array - Array to group
 * @param {string|Function} key - Property name or function to extract key
 * @returns {Object} Grouped items
 */
export function groupBy<T>(array: T[], key: string | ((item: T) => string)): Record<string, T[]> {
  return array.reduce((result: Record<string, T[]>, item: T) => {
    const groupKey = typeof key === 'function' ? key(item) : (item as any)[key]
    result[groupKey] = result[groupKey] || []
    result[groupKey].push(item)
    return result
  }, {})
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Delay execution for specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return regex.test(email)
}

/**
 * Validate phone number format (basic validation)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
export function isValidPhone(phone: string): boolean {
  const regex = /^\+?[0-9]{10,15}$/
  return regex.test(phone.replace(/[\s()-]/g, ''))
}
