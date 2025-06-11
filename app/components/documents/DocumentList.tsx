'use client';

import React from 'react';

// This is a placeholder component.
// You can replace this with your actual DocumentList implementation.

const DocumentList = () => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          My Documents
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          A list of all the documents you have uploaded.
        </p>
      </div>
      <div className="border-t border-gray-200">
        <div className="p-6 text-center">
          <p className="text-sm text-gray-500">
            Document list functionality will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentList; 