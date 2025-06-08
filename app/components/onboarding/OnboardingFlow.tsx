'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PersonalInfoStep from './steps/PersonalInfoStep';
import DocumentUploadStep from './steps/DocumentUploadStep';
import AiPersonaStep from './steps/AiPersonaStep';
import CustomFieldsStep from './steps/CustomFieldsStep';
import CompletionStep from './steps/CompletionStep';

export type OnboardingData = {
  personalInfo: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth: string;
    occupation: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  customFields: Record<string, string>;
  documents: File[];
  aiPersonaEnabled: boolean;
};

const INITIAL_DATA: OnboardingData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    occupation: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  },
  customFields: {},
  documents: [],
  aiPersonaEnabled: true,
};

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const updateFields = (fields: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...fields }));
  };

  const goToNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const submitOnboarding = async () => {
    setIsSubmitting(true);

    try {
      // Submit personal info
      const personalInfoResponse = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data.personalInfo),
      });

      if (!personalInfoResponse.ok) {
        throw new Error('Failed to save personal information');
      }

      // Upload documents if any
      if (data.documents.length > 0) {
        const formData = new FormData();
        data.documents.forEach(file => {
          formData.append('files', file);
        });

        const documentsResponse = await fetch('/api/user/documents', {
          method: 'POST',
          body: formData,
        });

        if (!documentsResponse.ok) {
          throw new Error('Failed to upload documents');
        }
      }

      // Initialize AI persona if enabled
      if (data.aiPersonaEnabled) {
        const personaResponse = await fetch('/api/user/persona', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ createPersona: true }),
        });

        if (!personaResponse.ok) {
          throw new Error('Failed to create AI persona');
        }
      }

      // Mark onboarding as completed
      const onboardingResponse = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalInfo: data.personalInfo,
          documents: data.documents,
          aiPersonaEnabled: data.aiPersonaEnabled,
          customFields: data.customFields
        }),
      });

      if (!onboardingResponse.ok) {
        const errorData = await onboardingResponse.json();
        throw new Error(errorData.error || 'Failed to complete onboarding');
      }

      // Go to completion step
      setCurrentStep(steps.length - 1);
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('There was an error completing your onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      title: 'Personal Information',
      component: (
        <PersonalInfoStep
          data={data}
          updateFields={updateFields}
          goToNextStep={goToNextStep}
          goToPreviousStep={goToPreviousStep}
          isFirstStep={true}
          isLastStep={false}
          submitForm={submitOnboarding}
          isSubmitting={isSubmitting}
        />
      ),
    },
    {
      title: 'Custom Fields',
      component: (
        <CustomFieldsStep
          data={data}
          updateFields={updateFields}
          goToNextStep={goToNextStep}
          goToPreviousStep={goToPreviousStep}
          isFirstStep={false}
          isLastStep={false}
          submitForm={submitOnboarding}
          isSubmitting={isSubmitting}
        />
      ),
    },
    {
      title: 'Document Upload',
      component: (
        <DocumentUploadStep
          data={data}
          updateFields={updateFields}
          goToNextStep={goToNextStep}
          goToPreviousStep={goToPreviousStep}
          isFirstStep={false}
          isLastStep={false}
          submitForm={submitOnboarding}
          isSubmitting={isSubmitting}
        />
      ),
    },
    {
      title: 'AI Persona',
      component: (
        <AiPersonaStep
          data={data}
          updateFields={updateFields}
          goToNextStep={goToNextStep}
          goToPreviousStep={goToPreviousStep}
          isFirstStep={false}
          isLastStep={true}
          submitForm={submitOnboarding}
          isSubmitting={isSubmitting}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
          <p className="mt-2 text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </p>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          {steps[currentStep].component}
        </div>
      </div>
    </div>
  );
} 