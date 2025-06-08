'use client';

import { useState } from 'react';
import { OnboardingData } from '../OnboardingFlow';

type PersonalInfoStepProps = {
  data: OnboardingData;
  updateFields: (fields: Partial<OnboardingData>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  submitForm: () => void;
  isSubmitting: boolean;
};

export default function PersonalInfoStep({
  data,
  updateFields,
  goToNextStep,
  isSubmitting,
}: PersonalInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.personalInfo.firstName) newErrors.firstName = 'First name is required';
    if (!data.personalInfo.lastName) newErrors.lastName = 'Last name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      goToNextStep();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFields({
      personalInfo: {
        ...data.personalInfo,
        [e.target.name]: e.target.value,
      },
    });

    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Personal Information
      </h3>
      <p className="text-sm text-gray-900 mb-6">
        Please provide your personal information. This data will be used to fill forms automatically.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-900">
              First Name <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={data.personalInfo.firstName}
                onChange={handleChange}
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 bg-white ${errors.firstName ? 'border-red-300' : ''}`}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-900">
              Last Name <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={data.personalInfo.lastName}
                onChange={handleChange}
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 bg-white ${errors.lastName ? 'border-red-300' : ''}`}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-900">
              Phone Number
            </label>
            <div className="mt-1">
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                value={data.personalInfo.phoneNumber}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-900">
              Date of Birth
            </label>
            <div className="mt-1">
              <input
                type="date"
                name="dateOfBirth"
                id="dateOfBirth"
                value={data.personalInfo.dateOfBirth}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="occupation" className="block text-sm font-medium text-gray-900">
              Occupation
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="occupation"
                id="occupation"
                value={data.personalInfo.occupation}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 bg-white"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-900">
              Address
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="addressLine1"
                id="addressLine1"
                value={data.personalInfo.addressLine1}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-900">
              City
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="city"
                id="city"
                value={data.personalInfo.city}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-900">
              State / Province
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="state"
                id="state"
                value={data.personalInfo.state}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-900">
              Postal Code
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="postalCode"
                id="postalCode"
                value={data.personalInfo.postalCode}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-900">
              Country
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="country"
                id="country"
                value={data.personalInfo.country}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 bg-white"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}
