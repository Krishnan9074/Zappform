'use client';

import { OnboardingData } from '../OnboardingFlow';

type AiPersonaStepProps = {
  data: OnboardingData;
  updateFields: (fields: Partial<OnboardingData>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  submitForm: () => void;
  isSubmitting: boolean;
};

export default function AiPersonaStep({
  data,
  updateFields,
  goToPreviousStep,
  isLastStep,
  submitForm,
  isSubmitting,
}: AiPersonaStepProps) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFields({ aiPersonaEnabled: e.target.checked });
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        AI Persona Setup
      </h3>
      <p className="text-sm text-gray-700 mb-6">
        Enable your AI persona to automatically fill out forms across the web based on your data.
      </p>
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Your AI persona will learn from your data to intelligently fill out forms. The more data you provide, the better it gets.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="enableAi"
              name="enableAi"
              type="checkbox"
              checked={data.aiPersonaEnabled}
              onChange={handleChange}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="enableAi" className="font-medium text-gray-900">Enable AI Persona</label>
            <p className="text-gray-700">
              Train an AI model based on your data to automatically fill forms for you. This will use the personal information and documents you've provided.
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-2 bg-white text-sm text-gray-700">Privacy & Security</span>
          </div>
        </div>
        
        <ul className="space-y-4 text-sm text-gray-700">
          <li className="flex items-start">
            <svg className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Your data is encrypted and stored securely</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>You control what information is used and where it's applied</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>You can delete your data or disable the AI at any time</span>
          </li>
        </ul>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={goToPreviousStep}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back
        </button>
        <button
          type="button"
          onClick={submitForm}
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Complete Setup'
          )}
        </button>
      </div>
    </div>
  );
} 