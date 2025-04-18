import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please enter both username/email and password');
      return;
    }
    
    setLoading(true);
    try {
      const result = await onLogin(username, password);
      if (!result.success) {
        setError(result.message);
      } else if (result.success) {
        // Redirect happens in App component based on verification status
        navigate('/verify-otp');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h2 className="text-left text-3xl font-bold text-gray-800 mb-2">Welcome back !</h2>
        <p className="mb-10 text-left text-gray-600">Please enter your details</p>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username or Email
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username or email"
              className="mt-3 w-full rounded-lg border border-gray-300 p-3 text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="mt-3 w-full rounded-lg border border-gray-300 p-3 text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="my-4 text-right">
            <Link to="/reset-password" className="text-sm text-blue-600 hover:text-blue-800">
              Forgot password?
            </Link>
          </div>
          
          <button
            type="submit"
            className={`w-full rounded-lg bg-[#041F41] px-4 py-3 text-white transition hover:bg-blue-980 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              loading ? 'cursor-not-allowed opacity-70' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            New to organAIze?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;