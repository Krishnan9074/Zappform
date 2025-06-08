'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react'; 
import { redirect } from 'next/navigation';
import EditPersonaForm from '@/app/components/persona/EditPersonaForm';

export default function PersonaPage() {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch user data when component mounts
  useState(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (session?.user?.id) {
      fetchUserData();
    }
  });
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }
  
  // Extract AI persona status from userData
  const persona = userData?.aiPersona?.[0];
  
  return (
    <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
      <h1 className="text-2xl font-semibold text-gray-900">AI Persona</h1>
      
      {isEditing ? (
        <EditPersonaForm 
          userId={session?.user?.id || ''} 
          initialCustomFields={userData?.customFields || {}} 
          onClose={() => setIsEditing(false)} 
        />
      ) : (
        <>
          <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">AI Persona Status</h2>
              <p className="mt-1 text-sm text-gray-500">Manage your personal AI assistant for form filling</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
                  persona?.status === "TRAINED" 
                    ? "bg-green-100" 
                    : persona?.status === "FAILED" 
                    ? "bg-red-100" 
                    : "bg-yellow-100"
                }`}>
                  <svg 
                    className={`h-6 w-6 ${
                      persona?.status === "TRAINED" 
                        ? "text-green-600" 
                        : persona?.status === "FAILED" 
                        ? "text-red-600" 
                        : "text-yellow-600"
                    }`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    {persona?.status === "TRAINED" ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : persona?.status === "FAILED" ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {persona?.status === "TRAINED" 
                      ? "Ready to use" 
                      : persona?.status === "FAILED" 
                      ? "Training failed" 
                      : persona?.status === "PROCESSING"
                      ? "Training in progress"
                      : "Not trained yet"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {persona?.status === "TRAINED" 
                      ? "Your AI persona is trained and ready to fill forms" 
                      : persona?.status === "FAILED" 
                      ? "There was an issue training your AI persona" 
                      : persona?.status === "PROCESSING"
                      ? "We're training your AI persona, this might take a few minutes"
                      : "Add more personal data or documents to train your AI persona"}
                  </p>
                </div>
              </div>
              
              {!persona || persona?.status !== "TRAINED" ? (
                <div className="mt-8">
                  <button
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setIsEditing(true)}
                  >
                    {!persona ? "Start Training" : persona.status === "FAILED" ? "Retry Training" : "Check Progress"}
                  </button>
                </div>
              ) : (
                <div className="mt-8 space-y-8">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">AI Model Details</h4>
                    <dl className="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                      <div className="py-3 flex justify-between text-sm font-medium">
                        <dt className="text-gray-500">Last Updated</dt>
                        <dd className="text-gray-900">{new Date(persona.updatedAt).toLocaleDateString()}</dd>
                      </div>
                      {persona.metadata?.confidenceScore && (
                        <div className="py-3 flex justify-between text-sm font-medium">
                          <dt className="text-gray-500">Confidence Score</dt>
                          <dd className="text-gray-900">{persona.metadata.confidenceScore}%</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Actions</h4>
                    <div className="mt-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Update AI Persona
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Training Data</h2>
              <p className="mt-1 text-sm text-gray-500">Information used to train your AI persona</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Personal Information</h3>
                      <p className="text-sm text-gray-500">Basic details like name, address, etc.</p>
                    </div>
                  </div>
                  <div className="mt-4 bg-gray-50 px-4 py-3 sm:px-6 rounded-md">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</div>
                    <div className="mt-1 text-sm text-gray-900">Complete</div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Documents</h3>
                      <p className="text-sm text-gray-500">Resumes, IDs, and other uploads</p>
                    </div>
                  </div>
                  <div className="mt-4 bg-gray-50 px-4 py-3 sm:px-6 rounded-md">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</div>
                    <div className="mt-1 text-sm text-gray-900">
                      {userData?.documents?.length ? `${userData.documents.length} Document(s) Processed` : 'No documents yet'}
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">Custom Fields</h3>
                      <p className="text-sm text-gray-500">Additional information you've added</p>
                    </div>
                  </div>
                  <div className="mt-4 bg-gray-50 px-4 py-3 sm:px-6 rounded-md">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</div>
                    <div className="mt-1 text-sm text-gray-900">
                      {userData?.customFields && Object.keys(userData.customFields).length > 0
                        ? `${Object.keys(userData.customFields).length} Field(s) Added`
                        : 'No custom fields yet'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add More Training Data
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 