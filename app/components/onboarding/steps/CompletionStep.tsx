'use client';

import { useRouter } from 'next/navigation';
import { OnboardingData } from '../OnboardingFlow';

type CompletionStepProps = {
  data: OnboardingData;
  updateFields: (fields: Partial<OnboardingData>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  submitForm: () => void;
  isSubmitting: boolean;
};

export default function CompletionStep({
  data,
}: CompletionStepProps) {
  const router = useRouter();

  return (
    <div className="text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="mt-6 text-xl font-semibold text-gray-900">
        Setup Complete!
      </h3>
      <p className="mt-2 text-sm text-gray-700">
        Your profile is set up and ready to use. {data.aiPersonaEnabled && 'Your AI persona is now being trained.'}
      </p>
      
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h4 className="text-base font-medium text-gray-900">What happens next?</h4>
        <ul className="mt-4 space-y-4">
          {data.aiPersonaEnabled && (
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">AI training in progress</p>
                <p className="mt-1 text-sm text-gray-700">
                  We're analyzing your data to build your personalized AI assistant. This may take a few minutes.
                </p>
              </div>
            </li>
          )}
          
          <li className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Install browser extension</p>
              <p className="mt-1 text-sm text-gray-700">
                Download and install our browser extension to automatically fill forms as you browse the web.
              </p>
            </div>
          </li>
          
          <li className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a4 4 0 00-4-4H8.8M12 8l-2.5 2.5M12 8l2.5 2.5" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Upload more documents</p>
              <p className="mt-1 text-sm text-gray-700">
                Add more documents to improve your AI's accuracy and ability to fill forms.
              </p>
            </div>
          </li>
        </ul>
      </div>
      
      <div className="mt-8">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
} 