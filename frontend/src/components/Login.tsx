import React, { useState, ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState<string | ReactNode>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    password?: string[];
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          username: formData.username,
          password: formData.password,
          grant_type: 'password'
        }).toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Store the token and fetch user info
      localStorage.setItem('token', data.access_token);
      
      // Fetch user info to get role
      const userResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user information');
      }
      
      const userData = await userResponse.json();
      localStorage.setItem('userRole', userData.role);
      
      // Dispatch auth event and redirect
      window.dispatchEvent(new Event('auth-change'));
      setTimeout(() => navigate('/'), 100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      
      if (errorMessage.toLowerCase().includes('incorrect') || errorMessage.toLowerCase().includes('invalid')) {
        setValidationErrors({
          password: ['Invalid username or password combination'],
        });
        setError(
          <div className="space-y-2">
            <p>Login failed: Invalid credentials</p>
            <div className="text-sm">
              <p className="font-medium">Troubleshooting steps:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Check that your username is spelled correctly</li>
                <li>Verify your password is correct</li>
                <li>Check your Caps Lock key</li>
              </ul>
              <p className="mt-2">
                Forgot your password?{' '}
                <Link to="/reset-password" className="text-blue-600 hover:underline">
                  Reset it here
                </Link>
              </p>
            </div>
          </div>
        );
      } else if (errorMessage.toLowerCase().includes('validate credentials')) {
        setError(
          <div className="space-y-2">
            <p>Session expired</p>
            <div className="text-sm">
              <p>Your session has expired for security reasons. Please log in again.</p>
            </div>
          </div>
        );
      } else {
        setError(
          <div className="space-y-2">
            <p>Login Error</p>
            <div className="text-sm">
              <p className="font-medium">This could be due to:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Network connectivity issues</li>
                <li>Server maintenance</li>
                <li>Temporary service disruption</li>
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear previous validation errors
    setValidationErrors(prev => ({
      ...prev,
      [name]: undefined
    }));

    // Validate username
    if (name === 'username') {
      if (value && value.length < 3) {
        setValidationErrors(prev => ({
          ...prev,
          username: 'Username must be at least 3 characters long'
        }));
      }
    }

    // Validate password format
    if (name === 'password') {
      if (value && value.length < 8) {
        setValidationErrors(prev => ({
          ...prev,
          password: ['Password must be at least 8 characters long']
        }));
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              {typeof error === 'string' ? <p>{error}</p> : error}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="space-y-1">
              <input
                type="text"
                id="username"
                name="username"
                required
                autoComplete="username"
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary sm:text-sm ${
                  validationErrors.username 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-primary'
                }`}
                value={formData.username}
                onChange={handleChange}
              />
              {validationErrors.username && (
                <p className="text-sm text-red-600">{validationErrors.username}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="space-y-1">
              <input
                type="password"
                id="password"
                name="password"
                required
                autoComplete="current-password"
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary sm:text-sm ${
                  validationErrors.password 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-primary'
                }`}
                value={formData.password}
                onChange={handleChange}
              />
              {validationErrors.password && (
                <ul className="mt-1 text-sm text-red-600 list-disc pl-5">
                  {validationErrors.password.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Logging in...</span>
            </div>
          ) : (
            'Login'
          )}
        </button>

        <div className="text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-primary-dark hover:underline transition-colors duration-200">
              Register here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
