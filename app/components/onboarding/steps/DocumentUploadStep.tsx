'use client';

import { useState, useRef } from 'react';
import { OnboardingData } from '../OnboardingFlow';

type DocumentUploadStepProps = {
  data: OnboardingData;
  updateFields: (fields: Partial<OnboardingData>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  submitForm: () => void;
  isSubmitting: boolean;
};

export default function DocumentUploadStep({
  data,
  updateFields,
  goToNextStep,
  goToPreviousStep,
  isSubmitting,
}: DocumentUploadStepProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const newFiles = Array.from(files);
    updateFields({ documents: [...data.documents, ...newFiles] });
  };

  const removeFile = (index: number) => {
    const newFiles = [...data.documents];
    newFiles.splice(index, 1);
    updateFields({ documents: newFiles });
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return size + ' bytes';
    else if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    else return (size / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Upload Documents
      </h3>
      <p className="text-sm text-gray-700 mb-6">
        Upload your resume, ID, and other documents to help ZappForm fill out forms automatically for you.
      </p>

      <div 
        className={`mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10 ${
          dragActive ? 'border-blue-400 bg-blue-50' : ''
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <div className="mt-4 flex text-sm text-gray-700">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500"
            >
              <span>Upload files</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                ref={inputRef}
                className="sr-only"
                onChange={handleChange}
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-600">
            PDF, Word, JPG, PNG up to 10MB each
          </p>
        </div>
      </div>

      {data.documents.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900">Uploaded Documents</h4>
          <ul className="mt-3 divide-y divide-gray-100 border-t border-b border-gray-200">
            {data.documents.map((file, index) => (
              <li key={index} className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <svg className="h-5 w-5 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="ml-2 truncate text-sm text-gray-700">{file.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-gray-600">{formatFileSize(file.size)}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

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
          onClick={goToNextStep}
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Next
        </button>
      </div>
    </div>
  );
} 