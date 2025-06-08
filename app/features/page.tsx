import Link from 'next/link';

export default function FeaturesPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8">
        <div className="lg:text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
            Features
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            ZappForm is packed with powerful features designed to save you time and eliminate the frustration of repetitive form filling.
          </p>
        </div>
      </div>

      {/* Feature list */}
      <div className="pb-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-12 grid gap-16 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
            <div>
              <div>
                <span className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 dark:bg-blue-600 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </span>
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI-Powered Form Detection</h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  ZappForm's AI automatically detects forms on any website and identifies the purpose of each field, even when field labels are unclear or missing.
                </p>
              </div>
            </div>

            <div>
              <div>
                <span className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 dark:bg-blue-600 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </span>
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Privacy First Design</h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Your data never leaves your device. ZappForm processes all information locally in your browser, ensuring your sensitive information remains secure.
                </p>
              </div>
            </div>

            <div>
              <div>
                <span className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 dark:bg-blue-600 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </span>
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Intelligent Field Mapping</h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  ZappForm intelligently maps your personal information to the right form fields, even when field labels vary across different websites.
                </p>
              </div>
            </div>

            <div>
              <div>
                <span className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 dark:bg-blue-600 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Document Parsing</h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Upload documents like your resume, ID, or passport, and ZappForm will automatically extract relevant information to enhance your profile.
                </p>
              </div>
            </div>

            <div>
              <div>
                <span className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 dark:bg-blue-600 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </span>
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Cross-Platform Support</h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Available as a browser extension for Chrome, Firefox, and Edge, with mobile support coming soon for iOS and Android.
                </p>
              </div>
            </div>

            <div>
              <div>
                <span className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 dark:bg-blue-600 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Customizable Settings</h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Control which information is shared, set up multiple profiles for different use cases, and customize field mappings for special forms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="py-16 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase">Advanced Features</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Beyond basic form filling
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
              ZappForm goes beyond just filling forms with intelligent features designed for modern professionals
            </p>
          </div>

          <div className="mt-16">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 dark:bg-blue-600 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">Form History and Synchronization</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                  ZappForm keeps track of all forms you've filled out and synchronizes your data across devices, so you can access your form history anywhere.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 dark:bg-blue-600 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">Smart Suggestions</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                  For fields that require unique inputs, ZappForm provides smart suggestions based on the context of the form and your previous entries.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 dark:bg-blue-600 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">Mobile Companion App</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                  The ZappForm mobile app allows you to fill forms on your phone and update your profile on the go with our camera-based document scanning.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 dark:bg-blue-600 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">Enterprise Security</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                  For business users, ZappForm offers enterprise-grade security features including SSO, audit logs, and compliance with major data protection regulations.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-blue-600">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to save time?</span>
            <span className="block">Start using ZappForm today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-200">
            Join thousands of users who have already simplified their form-filling experience.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                Get started for free
              </Link>
            </div>
            <div className="ml-3 inline-flex">
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