import Link from "next/link";
import { Metadata } from "next";
import Image from 'next/image';

export const metadata: Metadata = {
  title: "Synergetics ZappForm - AI-Powered Form Autofill",
  description: "Synergetics ZappForm uses AI to understand and fill out forms for you, making tedious paperwork a thing of the past. Upload your documents once, and never fill a form manually again.",
};

export default function HomePage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 pt-16 pb-20 sm:pt-24 sm:pb-24 lg:pt-32 lg:pb-28">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                <span className="block">Fill forms instantly with</span>
                <span className="block text-blue-600 dark:text-blue-400">AI that knows you</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Synergetics ZappForm uses AI to understand and fill out forms for you, making tedious paperwork a thing of the past. Upload your documents once, and never fill a form manually again.
              </p>
              <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center md:mt-12">
                <div className="rounded-md shadow">
                  <Link 
                    href="/auth/register"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                  >
                    Get started
                  </Link>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <Link 
                    href="/features" 
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 md:py-4 md:text-lg md:px-10"
                  >
                    Learn more
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-50 dark:from-blue-900/20 to-transparent transform -skew-y-6 origin-top-left"></div>
      </div>

      {/* Feature section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase">How it works</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-4xl">
              Three simple steps to never fill a form again
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-16 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
              <div className="relative">
                <div className="relative h-12 w-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center">Upload your documents</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400 text-center">
                    Upload your resume, ID, and other personal documents securely to our platform. Your data stays private and encrypted.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="relative h-12 w-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center">Train your AI assistant</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400 text-center">
                    Our AI learns from your documents to understand your personal and professional information, ready to fill forms on your behalf.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="relative h-12 w-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center">Automatic form filling</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400 text-center">
                    Install our browser extension and watch as Synergetics ZappForm automatically fills out web forms with your information as you browse.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial section */}
      <div className="bg-white dark:bg-gray-900 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-4xl">
              What our users are saying
            </p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <div className="h-full w-full flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 font-medium text-lg">
                    S
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sarah Johnson</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Marketing Executive</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                "Synergetics ZappForm has saved me countless hours filling out forms for business events and conferences. The AI understands exactly what information goes where!"
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <div className="h-full w-full flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 font-medium text-lg">
                    M
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Michael Chen</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Software Engineer</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                "As someone who applies to lots of tech jobs, Synergetics ZappForm has been a game-changer. It automatically fills out those tedious application forms perfectly every time."
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <div className="h-full w-full flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 font-medium text-lg">
                    J
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Jessica Rivera</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Small Business Owner</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                "Running a business means endless paperwork. Synergetics ZappForm helps me handle everything from taxes to permits, leaving me more time to focus on what matters."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            <span className="block">Ready to save time?</span>
            <span className="block text-blue-200">Start using Synergetics ZappForm today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                Get started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-700"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
