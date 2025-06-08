'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type CustomField = {
  key: string;
  value: string;
};

type EditPersonaFormProps = {
  userId: string;
  initialCustomFields?: Record<string, string>;
  onClose: () => void;
};

export default function EditPersonaForm({ userId, initialCustomFields = {}, onClose }: EditPersonaFormProps) {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Add custom styles
  const customStyles = `
    .dark-input {
      color: black !important;
      caret-color: black !important;
    }
    .dark-input::placeholder {
      color: #666 !important;
      opacity: 1 !important;
    }
  `;

  useEffect(() => {
    // Convert initialCustomFields object to array format for editing
    const initialFields = Object.entries(initialCustomFields || {}).map(
      ([key, value]) => ({ key, value: value.toString() })
    );
    
    if (initialFields.length === 0) {
      // Start with one empty field if none exist
      setCustomFields([{ key: '', value: '' }]);
    } else {
      setCustomFields(initialFields);
    }
  }, [initialCustomFields]);

  const handleAddField = () => {
    if (newFieldKey.trim() === '') {
      setError('Field name cannot be empty');
      return;
    }

    if (customFields.some(field => field.key === newFieldKey)) {
      setError('Field name already exists');
      return;
    }

    setCustomFields([...customFields, { key: newFieldKey, value: newFieldValue }]);
    setNewFieldKey('');
    setNewFieldValue('');
    setError('');
  };

  const handleRemoveField = (index: number) => {
    const newFields = customFields.filter((_, i) => i !== index);
    setCustomFields(newFields);
  };

  const handleFieldChange = (index: number, field: Partial<CustomField>) => {
    const newFields = [...customFields];
    newFields[index] = { ...newFields[index], ...field };
    setCustomFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Convert customFields array back to object format
      const customFieldsObject = customFields.reduce((acc, field) => {
        if (field.key.trim() !== '') {
          acc[field.key] = field.value;
        }
        return acc;
      }, {} as Record<string, string>);

      // Update user's custom fields
      const userResponse = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customFields: customFieldsObject,
        }),
      });

      if (!userResponse.ok) {
        throw new Error('Failed to update custom fields');
      }

      // Retrain AI persona with updated data
      const personaResponse = await fetch('/api/user/persona', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          createPersona: true,
        }),
      });

      if (!personaResponse.ok) {
        throw new Error('Failed to update AI persona');
      }

      // Refresh the page data
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error updating AI persona:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <style>{customStyles}</style>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Update AI Persona</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Custom Fields</h3>
          <p className="text-sm text-gray-500 mb-4">
            Add any additional information that your AI should know about you
          </p>

          {customFields.map((field, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                placeholder="Field Name"
                value={field.key}
                onChange={(e) => handleFieldChange(index, { key: e.target.value })}
                className="w-1/3 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black dark-input"
                style={{ color: 'black', caretColor: 'black', fontWeight: '500' }}
              />
              <input
                type="text"
                placeholder="Value"
                value={field.value}
                onChange={(e) => handleFieldChange(index, { value: e.target.value })}
                className="w-2/3 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black dark-input"
                style={{ color: 'black', caretColor: 'black', fontWeight: '500' }}
              />
              <button
                type="button"
                onClick={() => handleRemoveField(index)}
                className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          <div className="flex space-x-2 mt-4">
            <input
              type="text"
              placeholder="New Field Name"
              value={newFieldKey}
              onChange={(e) => setNewFieldKey(e.target.value)}
              className="w-1/3 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black dark-input"
              style={{ color: 'black', caretColor: 'black', fontWeight: '500' }}
            />
            <input
              type="text"
              placeholder="Value"
              value={newFieldValue}
              onChange={(e) => setNewFieldValue(e.target.value)}
              className="w-2/3 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-black dark-input"
              style={{ color: 'black', caretColor: 'black', fontWeight: '500' }}
            />
            <button
              type="button"
              onClick={handleAddField}
              className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              'Update & Retrain'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 