import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitize and validate a URL
 * - Removes leading/trailing whitespace
 * - Ensures http:// or https:// protocol
 * - Validates URL format and domain structure
 * @returns Valid absolute URL or null if invalid
 */
export function sanitizeAndValidateUrl(input: string): { url: string | null; error: string | null } {
  // Trim whitespace
  const trimmed = input.trim()

  // Check if empty
  if (!trimmed) {
    return { url: null, error: 'URL is required' }
  }

  // Check if has a protocol
  const hasProtocol = trimmed.match(/^[a-z]+:\/\//i)
  
  let urlToValidate: string
  if (hasProtocol) {
    // Has a protocol - validate it's http/https
    if (!trimmed.match(/^https?:\/\//i)) {
      return { url: null, error: 'Only http:// and https:// URLs are supported' }
    }
    urlToValidate = trimmed
  } else {
    // No protocol - add https://
    urlToValidate = `https://${trimmed}`
  }

  // Validate URL format
  try {
    const parsed = new URL(urlToValidate)

    // Ensure it has a valid hostname
    if (!parsed.hostname) {
      return { url: null, error: 'Invalid domain name' }
    }

    // Validate domain structure (must have TLD or be localhost/IP)
    const hostname = parsed.hostname
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
    const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(hostname) // Simple IPv4 check
    const hasTLD = hostname.includes('.') && !hostname.endsWith('.')

    if (!isLocalhost && !isIP && !hasTLD) {
      return { url: null, error: 'Invalid domain. Please use a domain with a TLD (e.g., example.com)' }
    }

    return { url: parsed.toString(), error: null }
  } catch (error) {
    return { url: null, error: 'Invalid URL format. Please enter a valid domain or full URL.' }
  }
}
