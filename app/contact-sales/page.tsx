import Link from 'next/link';

export default function ContactSalesPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white sm:text-3xl sm:tracking-tight lg:col-span-2">
              Get in touch with our Enterprise sales team
            </h2>
          </div>
          <div className="mt-8 pt-8">
            <div className="max-w-3xl mx-auto lg:max-w-none">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-3">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Enterprise Information</h3>
                  <div className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    <p>Looking for custom pricing, team accounts, or specific features?</p>
                    <p className="mt-1">Our Enterprise sales team is here to help create the perfect solution for your organization.</p>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <form className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Company
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="company"
                          id="company"
                          className="py-3 px-4 block w-full shadow-sm rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        First name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="first-name"
                          id="first-name"
                          autoComplete="given-name"
                          className="py-3 px-4 block w-full shadow-sm rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Last name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="last-name"
                          id="last-name"
                          autoComplete="family-name"
                          className="py-3 px-4 block w-full shadow-sm rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <div className="mt-1">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          className="py-3 px-4 block w-full shadow-sm rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="phone"
                          id="phone"
                          autoComplete="tel"
                          className="py-3 px-4 block w-full shadow-sm rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="team-size" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Team size
                      </label>
                      <div className="mt-1">
                        <select
                          id="team-size"
                          name="team-size"
                          className="py-3 px-4 block w-full shadow-sm rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option>1-10</option>
                          <option>11-50</option>
                          <option>51-100</option>
                          <option>101-500</option>
                          <option>500+</option>
                        </select>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Message
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="message"
                          name="message"
                          rows={4}
                          className="py-3 px-4 block w-full shadow-sm rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                          defaultValue={''}
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700 rounded"
                          />
                        </div>
                        <div className="ml-3">
                          <p className="text-base text-gray-500 dark:text-gray-400">
                            By selecting this, you agree to our{' '}
                            <Link href="/privacy" className="font-medium text-gray-700 dark:text-gray-300 underline">
                              Privacy Policy
                            </Link>{' '}
                            and{' '}
                            <Link href="/terms" className="font-medium text-gray-700 dark:text-gray-300 underline">
                              Terms of Service
                            </Link>
                            .
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Let's talk
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            <span className="block">Not sure about Enterprise yet?</span>
            <span className="block text-blue-600 dark:text-blue-400">Try our Pro plan first.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                View all plans
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/auth/register?plan=pro"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Try Pro plan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 