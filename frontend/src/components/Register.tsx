import React, { useState, ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createData } from '../api/apiClient';

const SPECIAL_CHARS = "!@#$%^&*(),.?\":{}|<>";

const Register = () => {
  const navigate = useNavigate();
  interface FormData {
    username: string;
    password: string;
    email: string;
    role: 'customer' | 'employee';
    phone: string;
    address: string;
  }

  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    email: '',
    role: 'customer',
    phone: '',
    address: ''
  });
  const [error, setError] = useState<string | ReactNode>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{
    password?: string[];
    email?: string;
    username?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);

    // Validate password before submission
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      setValidationErrors(prev => ({
        ...prev,
        password: passwordErrors
      }));
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Ensure data matches backend UserCreate schema
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone || undefined,  // Optional fields should be undefined if empty
        address: formData.address || undefined
      };

      console.log('Sending registration request to:', `${process.env.REACT_APP_API_URL}/api/auth/register`);
      
      try {
        setLoading(true);
        setError('');
        
        const data = await createData('/api/auth/register', userData);

        // Registration successful - data contains the token
        localStorage.setItem('token', data.access_token);
        window.dispatchEvent(new Event('auth-change'));

        // Registration successful
        navigate('/');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
        
        if (errorMessage.includes('Password validation failed:')) {
          const passwordErrors = errorMessage
            .split('Password validation failed:')[1]
            .trim()
            .split(';')
            .map(err => err.trim())
            .filter(err => err.length > 0);
          setValidationErrors(prev => ({
            ...prev,
            password: passwordErrors
          }));
        } else if (errorMessage.includes('email is already registered')) {
          setValidationErrors(prev => ({
            ...prev,
            email: 'This email is already registered. Please use a different email or login to your existing account.'
          }));
        } else if (errorMessage.includes('username is already registered')) {
          setValidationErrors(prev => ({
            ...prev,
            username: 'This username is already taken. Please choose a different username.'
          }));
        } else if (errorMessage.includes('Registration failed:')) {
          const specificError = errorMessage.split('Registration failed:')[1].trim();
          setError(
            <div className="space-y-2">
              <p>Registration failed: {specificError}</p>
              <div className="text-sm">
                <p className="font-medium">Troubleshooting steps:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Check that all required fields are filled correctly</li>
                  <li>Ensure your password meets the security requirements</li>
                  <li>Try using a different email address</li>
                </ul>
                <p className="mt-2">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          );
        } else {
          setError(
            <div className="space-y-2">
              <p>We encountered an issue during registration.</p>
              <div className="text-sm">
                <p className="font-medium">This could be due to:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Network connectivity issues</li>
                  <li>Server maintenance</li>
                  <li>Invalid or missing information</li>
                </ul>
                <p className="mt-2">
                  Please try again in a few minutes. If the problem persists,{' '}
                  <Link to="/contact" className="text-blue-600 hover:underline">
                    contact our support team
                  </Link>
                  .
                </p>
              </div>
            </div>
          );
        }
      } finally {
        setLoading(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      
      if (errorMessage.includes('Password validation failed:')) {
        const passwordErrors = errorMessage
          .split('Password validation failed:')[1]
          .trim()
          .split(';')
          .map(err => err.trim())
          .filter(err => err.length > 0);
        setValidationErrors(prev => ({
          ...prev,
          password: passwordErrors
        }));
      } else if (errorMessage.includes('email is already registered')) {
        setValidationErrors(prev => ({
          ...prev,
          email: 'This email is already registered. Please use a different email or login to your existing account.'
        }));
      } else if (errorMessage.includes('username is already registered')) {
        setValidationErrors(prev => ({
          ...prev,
          username: 'This username is already taken. Please choose a different username.'
        }));
      } else if (errorMessage.includes('Registration failed:')) {
        const specificError = errorMessage.split('Registration failed:')[1].trim();
        setError(
          <div className="space-y-2">
            <p>Registration failed: {specificError}</p>
            <div className="text-sm">
              <p className="font-medium">Troubleshooting steps:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Check that all required fields are filled correctly</li>
                <li>Ensure your password meets the security requirements</li>
                <li>Try using a different email address</li>
              </ul>
              <p className="mt-2">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        );
      } else {
        setError(
          <div className="space-y-2">
            <p>We encountered an issue during registration.</p>
            <div className="text-sm">
              <p className="font-medium">This could be due to:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Network connectivity issues</li>
                <li>Server maintenance</li>
                <li>Invalid or missing information</li>
              </ul>
              <p className="mt-2">
                Please try again in a few minutes. If the problem persists,{' '}
                <Link to="/contact" className="text-blue-600 hover:underline">
                  contact our support team
                </Link>
                .
              </p>
            </div>
          </div>
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('Password is required');
      return errors;
    }

    // Basic requirements with detailed messages
    if (password.length < 8) {
      errors.push(`Password must be at least 8 characters long (currently ${password.length} characters)`);
    }
    
    if (!password.split('').some(c => c.match(/[A-Z]/))) {
      errors.push('Password must contain at least one uppercase letter (A-Z)');
    }
    
    if (!password.split('').some(c => c.match(/[a-z]/))) {
      errors.push('Password must contain at least one lowercase letter (a-z)');
    }
    
    if (!password.split('').some(c => c.match(/[0-9]/))) {
      errors.push('Password must contain at least one number (0-9)');
    }
    
    if (!password.split('').some(c => SPECIAL_CHARS.includes(c))) {
      errors.push(`Password must contain at least one special character from: ${SPECIAL_CHARS}`);
    }
    
    if (password.toLowerCase().includes('password')) {
      errors.push('Password cannot contain the word "password" (try using a unique phrase instead)');
    }
    
    if (password.match(/(.)\1{2,}/)) {
      errors.push('Password cannot contain repeated characters (e.g., "aaa" - try mixing different characters)');
    }
    
    if (password.match(/^[A-Z][a-z]+\d+[!@#$%^&*(),.?":{}|<>]?$/)) {
      errors.push('Password is too predictable (avoid patterns like "Password123!")');
    }
    
    if (password.match(/^\d+$/)) {
      errors.push('Password cannot consist of only numbers - mix in letters and special characters');
    }
    
    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear previous validation errors and validate immediately
    setValidationErrors(prev => {
      const newErrors = { ...prev, [name]: undefined };
      
      // Validate password on change
      if (name === 'password') {
        const passwordErrors = validatePassword(value);
        if (passwordErrors.length > 0) {
          newErrors.password = passwordErrors;
        }
      }
      
      // Validate email format
      if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      // Validate username
      if (name === 'username' && value && value.length < 3) {
        newErrors.username = 'Username must be at least 3 characters long';
      }
      
      return newErrors;
    });
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          {typeof error === 'string' ? <p>{error}</p> : error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            {validationErrors.username && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
            )}
            <input
              type="text"
              id="username"
              name="username"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
              <div className="block text-xs text-gray-500 mt-1">
                <p>Password must:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Be at least 8 characters long</li>
                  <li>Include uppercase and lowercase letters</li>
                  <li>Include at least one number</li>
                  <li>Include at least one special character ({SPECIAL_CHARS})</li>
                  <li>Not contain the word "password"</li>
                  <li>Not contain repeated characters (e.g., "aaa")</li>
                </ul>
              </div>
            </label>
            {validationErrors.password && (
              <ul className="mt-1 text-sm text-red-600 list-disc pl-5">
                {validationErrors.password.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
            <input
              type="password"
              id="password"
              name="password"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
            )}
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
            <select
              id="role"
              name="role"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="customer">Customer</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone (optional)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address (optional)</label>
            <input
              type="text"
              id="address"
              name="address"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;
