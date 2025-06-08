'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Only show theme UI after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">ZappForm</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/" 
                className={`border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === '/' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                Home
              </Link>
              <Link 
                href="/features" 
                className={`border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === '/features' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                Features
              </Link>
              <Link 
                href="/pricing" 
                className={`border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === '/pricing' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                Pricing
              </Link>
              {session && (
                <Link 
                  href="/dashboard" 
                  className={`border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname?.startsWith('/dashboard') ? 'border-blue-500 text-blue-600 dark:text-blue-400' : ''
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              type="button"
              className="bg-white dark:bg-gray-800 p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">Toggle dark mode</span>
              {mounted && theme === 'dark' ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Authentication buttons */}
            {status === 'loading' ? (
              <div className="ml-3 relative">
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              </div>
            ) : session ? (
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="bg-white dark:bg-gray-800 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    id="user-menu-button"
                    aria-expanded={isProfileMenuOpen}
                    aria-haspopup="true"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                      {session.user?.image ? (
                        <Image
                          width={32}
                          height={32}
                          className="h-full w-full rounded-full"
                          src={session.user.image}
                          alt={session.user.name || 'User profile'}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 font-medium text-sm">
                          {session.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                  </button>
                </div>
                
                {/* Profile dropdown */}
                {isProfileMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabIndex={-1}
                  >
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                      <div className="font-medium">{session.user?.name}</div>
                      <div className="text-gray-500 dark:text-gray-400 truncate">{session.user?.email}</div>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700"></div>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="ml-6 flex items-center space-x-4">
                <Link
                  href="/auth/signin"
                  className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleDarkMode}
              className="bg-white dark:bg-gray-800 p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
            >
              <span className="sr-only">Toggle dark mode</span>
              {mounted && theme === 'dark' ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMobileMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium ${
                pathname === '/' ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-800' : ''
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/features"
              className={`text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium ${
                pathname === '/features' ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-800' : ''
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className={`text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium ${
                pathname === '/pricing' ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-800' : ''
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            {session && (
              <Link
                href="/dashboard"
                className={`text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium ${
                  pathname?.startsWith('/dashboard') ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-800' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
          </div>
          
          {status !== 'loading' && (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              {session ? (
                <>
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        {session.user?.image ? (
                          <Image
                            width={40}
                            height={40}
                            className="h-full w-full rounded-full"
                            src={session.user.image}
                            alt={session.user.name || 'User profile'}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 font-medium">
                            {session.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800 dark:text-white">{session.user?.name}</div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{session.user?.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-1 px-4">
                  <Link
                    href="/auth/signin"
                    className="block text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block text-base font-medium bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
} 