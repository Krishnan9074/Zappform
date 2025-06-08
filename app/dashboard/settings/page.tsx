'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('account');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Redirect to sign-in if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }
  
  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('Settings saved successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 1000);
  };

  return (
    <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
      <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      
      <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('account')}
              className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'account'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Account
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'privacy'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Privacy
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'preferences'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Preferences
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notifications
            </button>
          </nav>
        </div>
        
        {/* Account Settings */}
        {activeTab === 'account' && (
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Account Information</h3>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    defaultValue={session?.user?.name || ''}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    defaultValue={session?.user?.email || ''}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    disabled
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Email cannot be changed. This is your login identifier.
                </p>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="new-password"
                    id="new-password"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Enter new password"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="confirm-password"
                    id="confirm-password"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 py-6 border-t border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Danger Zone</h3>
              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Account
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  This will permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Privacy Settings */}
        {activeTab === 'privacy' && (
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Privacy Settings</h3>
            <div className="mt-6 space-y-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="data-collection"
                    name="data-collection"
                    type="checkbox"
                    defaultChecked
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="data-collection" className="font-medium text-gray-700">Data Collection</label>
                  <p className="text-gray-500">Allow ZappForm to collect anonymized usage data to improve the service.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="third-party"
                    name="third-party"
                    type="checkbox"
                    defaultChecked
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="third-party" className="font-medium text-gray-700">Third-Party Integrations</label>
                  <p className="text-gray-500">Allow ZappForm to connect with third-party services for enhanced functionality.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="personalization"
                    name="personalization"
                    type="checkbox"
                    defaultChecked
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="personalization" className="font-medium text-gray-700">Personalization</label>
                  <p className="text-gray-500">Allow ZappForm to analyze your form filling patterns to provide personalized experiences.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Preferences Settings */}
        {activeTab === 'preferences' && (
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Preferences</h3>
            <div className="mt-6 space-y-6">
              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                  Theme
                </label>
                <select
                  id="theme"
                  name="theme"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  defaultValue="system"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                  Language
                </label>
                <select
                  id="language"
                  name="language"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  defaultValue="en"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="auto-fill"
                    name="auto-fill"
                    type="checkbox"
                    defaultChecked
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="auto-fill" className="font-medium text-gray-700">Automatic Form Filling</label>
                  <p className="text-gray-500">Automatically fill forms when ZappForm detects a compatible form.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Notification Preferences</h3>
            <div className="mt-6 space-y-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="email-notifications"
                    name="email-notifications"
                    type="checkbox"
                    defaultChecked
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="email-notifications" className="font-medium text-gray-700">Email Notifications</label>
                  <p className="text-gray-500">Receive email notifications about account activity and updates.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="product-updates"
                    name="product-updates"
                    type="checkbox"
                    defaultChecked
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="product-updates" className="font-medium text-gray-700">Product Updates</label>
                  <p className="text-gray-500">Receive notifications about new features and improvements.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="security-alerts"
                    name="security-alerts"
                    type="checkbox"
                    defaultChecked
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="security-alerts" className="font-medium text-gray-700">Security Alerts</label>
                  <p className="text-gray-500">Receive notifications about important security-related events.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          {saveMessage && (
            <div className="mb-3 text-sm text-green-600">{saveMessage}</div>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
} 