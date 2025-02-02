import { useState, useEffect } from 'react';

interface ApiError extends Error {
  status?: number;
}

interface FetchOptions extends RequestInit {
  skipErrorHandling?: boolean;
}

const MAX_RETRIES = 5;  // Increased retries for better reliability
const INITIAL_RETRY_DELAY = 1000; // 1 second initial delay with exponential backoff
const MAX_RETRY_DELAY = 10000;  // Maximum delay between retries (10 seconds)

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches data from the API with automatic retries for network errors and 5xx responses.
 * Uses exponential backoff for retry delays.
 * @param url - The API endpoint URL
 * @param options - Fetch options including headers and method
 * @param attempt - Current attempt number (internal use)
 */
export async function fetchData<T>(url: string, options: FetchOptions = {}, attempt: number = 1): Promise<T> {
  // Don't retry beyond MAX_RETRIES
  if (attempt > MAX_RETRIES) {
    throw new Error('Maximum retry attempts exceeded. Please try again later.');
  }

  try {
    const token = localStorage.getItem('token');
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    const apiUrl = process.env.REACT_APP_API_URL || 'https://flooring-crm-api.onrender.com';
    console.log(`Fetching from ${apiUrl}${url}, attempt ${attempt}/${MAX_RETRIES}`, { 
      headers: defaultHeaders,
      method: options.method || 'GET'
    });
    
    const response = await fetch(`${apiUrl}${url}`, {
      ...options,
      credentials: 'same-origin',  // Only send credentials if same origin
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'An error occurred') as ApiError;
      error.status = response.status;
      
      // Don't retry 4xx errors as they are client errors
      if (response.status >= 400 && response.status < 500) {
        if (response.status === 401) {
          error.message = 'Please log in to access this content';
        } else if (response.status === 403) {
          error.message = 'You do not have permission to access this content';
        } else if (response.status === 404) {
          error.message = 'The requested resource was not found. Please try again later.';
        }
        throw error;
      }
      
      // Retry on 5xx errors if we haven't exceeded max retries
      if (attempt < MAX_RETRIES) {
        const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1), MAX_RETRY_DELAY); // Exponential backoff with max delay
        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, { url, status: response.status });
        await sleep(delay);
        return fetchData(url, options, attempt + 1);
      }
      
      throw error;
    }

    return data;
  } catch (error) {
    if (options.skipErrorHandling) {
      throw error;
    }

    const apiError = error as ApiError;
    
    // Network errors or other non-HTTP errors
    if (!apiError.status && attempt < MAX_RETRIES) {
      const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1), MAX_RETRY_DELAY);
      console.warn(`Network error on attempt ${attempt}, retrying in ${delay}ms...`, { url, error: apiError.message });
      await sleep(delay);
      return fetchData(url, options, attempt + 1);
    }

    if (apiError.message.toLowerCase().includes('redis')) {
      throw new Error('Unable to load data due to a temporary caching issue. Please try again in a few minutes.');
    }
    
    throw new Error(
      apiError.message || 
      'Unable to load data. Please check your internet connection and try again. If the problem persists, contact support.'
    );
  }
}

interface UseFetchResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useFetch<T>(url: string, options: FetchOptions = {}): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  async function fetchDataWrapper() {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchData<T>(url, options);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDataWrapper();
  }, [url]);

  return { data, error, loading, refetch: fetchDataWrapper };
}

interface AuthResponse {
  access_token: string;
  token_type: string;
}

export async function createData<T = AuthResponse>(url: string, data: any, isFormData: boolean = false): Promise<T> {
  const headers: Record<string, string> = {};
  let body: string | FormData;

  if (isFormData) {
    // Convert data object to URLSearchParams for form submission
    const formData = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    body = formData.toString();
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  } else {
    body = JSON.stringify(data);
    headers['Content-Type'] = 'application/json';
  }

  return fetchData<T>(url, {
    method: 'POST',
    body,
    headers,
  });
}

export async function updateData<T>(url: string, data: any): Promise<T> {
  return fetchData<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteData(url: string): Promise<void> {
  return fetchData(url, {
    method: 'DELETE',
  });
}
