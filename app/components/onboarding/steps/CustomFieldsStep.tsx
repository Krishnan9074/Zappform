import { useState } from 'react';
import { OnboardingData } from '../OnboardingFlow';

type CustomFieldsStepProps = {
  data: OnboardingData;
  updateFields: (fields: Partial<OnboardingData>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  submitForm: () => void;
  isSubmitting: boolean;
};

export default function CustomFieldsStep({
  data,
  updateFields,
  goToNextStep,
  goToPreviousStep,
  isFirstStep,
  isLastStep,
  submitForm,
  isSubmitting,
}: CustomFieldsStepProps) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAddField = () => {
    if (newKey.trim() && newValue.trim()) {
      const updatedCustomFields = {
        ...data.customFields,
        [newKey.trim()]: newValue.trim(),
      };
      updateFields({ customFields: updatedCustomFields });
      setNewKey('');
      setNewValue('');
    }
  };

  const handleRemoveField = (key: string) => {
    const updatedCustomFields = { ...data.customFields };
    delete updatedCustomFields[key];
    updateFields({ customFields: updatedCustomFields });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLastStep) {
      submitForm();
    } else {
      goToNextStep();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Additional Information
      </h3>
      <p className="text-sm text-gray-900 mb-6">
        Add any additional information you'd like to store for form filling. This can include preferences, 
        specific details, or any other information you frequently use in forms.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Existing custom fields */}
          {Object.entries(data.customFields || {}).length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Your Custom Fields</h4>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(data.customFields || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <span className="font-medium text-gray-900">{key}:</span>
                      <span className="ml-2 text-gray-600">{value}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveField(key)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add new field form */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Add New Field</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="newKey" className="block text-sm font-medium text-gray-900">
                  Field Name
                </label>
                <input
                  type="text"
                  id="newKey"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="e.g., Preferred Name"
                />
              </div>
              <div>
                <label htmlFor="newValue" className="block text-sm font-medium text-gray-900">
                  Value
                </label>
                <input
                  type="text"
                  id="newValue"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="e.g., John"
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleAddField}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Field
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          {!isFirstStep && (
            <button
              type="button"
              onClick={goToPreviousStep}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Previous
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLastStep ? 'Complete' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
} 