import React from 'react';

interface ServiceFormData {
  name: string;
  description: string;
  base_price: string;
}

interface ServiceFormProps {
  formData: ServiceFormData;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  submitLabel: string;
  loading: boolean;
  mode: 'add' | 'edit';
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  formData,
  onSubmit,
  onChange,
  submitLabel,
  loading,
  mode
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 md:col-span-2">
          <div>
            <label htmlFor={`${mode}-name`} className="block text-sm font-medium text-gray-700">
              Service Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              id={`${mode}-name`}
              name="name"
              required
              placeholder="e.g., Floor Installation"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
              value={formData.name}
              onChange={onChange}
            />
            <p className="mt-1 text-sm text-gray-500">Choose a clear, descriptive name for your service</p>
          </div>

          <div>
            <label htmlFor={`${mode}-description`} className="block text-sm font-medium text-gray-700">
              Description
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              id={`${mode}-description`}
              name="description"
              required
              rows={3}
              placeholder="Describe what this service includes..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
              value={formData.description}
              onChange={onChange}
            />
            <p className="mt-1 text-sm text-gray-500">Include key details about what's included in the service</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <label htmlFor={`${mode}-base_price`} className="block text-sm font-medium text-gray-700">
            Base Price ($)
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id={`${mode}-base_price`}
              name="base_price"
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className="pl-7 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
              value={formData.base_price}
              onChange={onChange}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">Set the starting price for this service</p>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            All fields marked with <span className="text-red-500">*</span> are required
          </p>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{mode === 'add' ? 'Adding' : 'Updating'} Service...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ServiceForm;
