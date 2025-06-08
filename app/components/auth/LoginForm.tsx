'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (!result?.ok) {
        setError('Invalid email or password');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      setError('Something went wrong. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Sign in to ZappForm</h1>
        <p className="mt-2 text-gray-600">
          Fill forms instantly with AI-powered autofill
        </p>
      </div>
      
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email address"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-500">
              Forgot your password?
            </Link>
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M12.545 10.239v3.821h5.445c-0.643 2.783-2.826 4.011-5.445 4.011-3.328 0-6.016-2.687-6.016-6.015s2.688-6.016 6.016-6.016c1.33 0 2.552 0.412 3.515 1.207l2.914-2.914c-1.821-1.548-4.193-2.522-6.729-2.522-5.195 0-9.425 4.23-9.425 9.424s4.23 9.424 9.425 9.424c5.856 0 9.813-4.135 9.813-9.78 0-0.648-0.067-1.296-0.207-1.907l-9.306-0.002z"
                fill="#4285f4"
              />
              <path
                d="M12.545 10.239l-9.305-0.001c-0.139 0.613-0.208 1.258-0.208 1.906 0 5.22 3.078 9.723 7.513 11.803 2.142-2.893 5.401-7.238 5.401-7.238s-3.347-5.674-3.4-6.47z"
                fill="#34a853"
              />
              <path
                d="M12.545 10.239v3.821h5.445l2.133-3.821h-7.578z"
                fill="#fbbc05"
              />
              <path
                d="M21.996 8.336l-7.578 0.001-5.328 9.177c1.854 1.764 4.577 2.699 7.513 2.699 1.835 0 3.537-0.449 5.017-1.233l0.387-10.644z"
                fill="#ea4335"
              />
            </svg>
            Google
          </button>
        </div>
      </div>
      
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:text-blue-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
} 