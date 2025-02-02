import React, { useState, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useFetch, createData, updateData, deleteData } from '../api/apiClient';
import ServiceForm from './forms/ServiceForm';

interface ServiceFormData {
  name: string;
  description: string;
  base_price: string;
}

interface Service {
  _id: string;
  name: string;
  description: string;
  base_price: number;
}

interface ManageServicesProps {
  userRole?: 'customer' | 'employee';
}

const ManageServices = ({ userRole = 'customer' }: ManageServicesProps) => {
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [editingService, setEditingService] = useState<(ServiceFormData & { _id: string }) | null>(null);
  const [newService, setNewService] = useState<ServiceFormData>({
    name: '',
    description: '',
    base_price: ''
  });
  const [localError, setError] = useState<string>('');

  const { data: services, error: fetchError, loading, refetch: loadServices } = useFetch<Service[]>('/api/services');

  // Combine fetch error and local error
  const displayError = localError || fetchError;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewService(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError('');
      setSuccessMessage('');

      await createData('/api/services', {
        ...newService,
        base_price: parseFloat(newService.base_price)
      });

      setSuccessMessage('Service added successfully!');
      setNewService({ name: '', description: '', base_price: '' });
      await loadServices();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`Failed to add service: ${errorMessage}. Please verify all fields are filled correctly and try again. If the issue persists, our support team is here to help at support@flooringcrm.com.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      setActionLoading(true);
      setError('');
      setSuccessMessage('');

      await updateData(`/api/services/${editingService._id}`, {
        ...editingService,
        base_price: parseFloat(editingService.base_price)
      });

      setSuccessMessage('Service updated successfully!');
      setEditingService(null);
      await loadServices();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`Failed to update service: ${errorMessage}. This could be due to:
      - Network connectivity issues
      - Invalid field values
      - Session timeout
      Please try again or contact support if the issue continues.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccessMessage('');

      await deleteData(`/api/services/${serviceId}`);

      setSuccessMessage('Service deleted successfully!');
      await loadServices();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`Failed to delete service: ${errorMessage}. This could be due to:
      - Network connectivity issues
      - The service may be in use
      - Your session may have expired
      Please try logging out and back in, then try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (userRole !== 'employee') {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-6 space-y-4">
          <div className="flex items-start space-x-3">
            <svg className="h-6 w-6 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-semibold text-lg text-yellow-800">Employee Access Required</h3>
              <p className="mt-1">You need employee access to manage services. Please contact your administrator or sign in with an employee account.</p>
              <div className="mt-4 flex space-x-4">
                <Link to="/login" className="inline-flex items-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                  Sign In
                </Link>
                <Link to="/contact" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 hover:text-yellow-600 focus:outline-none">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-6 sm:mt-8 px-4 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Manage Services</h1>
      
      {displayError && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 space-y-4">
          <p className="font-medium">Error Managing Services</p>
          <p>{displayError}</p>
          <div className="text-sm">
            <p>This could be due to:</p>
            <ul className="list-disc pl-5 mt-2">
              {[
                'You may not have employee access - contact your administrator',
                'Your session may have expired - please log in again',
                'The server may be temporarily unavailable',
                'There might be network connectivity issues'
              ].map((text, index) => (
                <li key={`error-${index}`}>{text}</li>
              ))}
            </ul>
            <p className="mt-2">
              To manage services, you need to be logged in with an employee account. Please sign in using the Account button in the top right corner.
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => loadServices()}
              className="bg-red-100 text-red-800 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
            >
              Retry Loading Services
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-100 text-red-800 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6">
          <p>{successMessage}</p>
        </div>
      )}

      {editingService ? (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Edit Service</h2>
          <div className="space-y-4">
            <ServiceForm
              formData={editingService}
              onSubmit={handleUpdateService}
              onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
                setEditingService({ ...editingService, [e.target.name]: e.target.value })
              }
              submitLabel="Update Service"
              loading={actionLoading}
              mode="edit"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                disabled={actionLoading}
                className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Add New Service</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Add services that your team can provide to customers</span>
            </div>
          </div>
          
          <ServiceForm
            formData={newService}
            onSubmit={handleAddService}
            onChange={handleInputChange}
            submitLabel="Add New Service"
            loading={actionLoading}
            mode="add"
          />
      </div>
      )}

      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-semibold">Existing Services</h2>
          <button
            onClick={() => loadServices()}
            disabled={actionLoading}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            <svg className={`w-4 h-4 mr-1.5 ${actionLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {actionLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        <div className="grid gap-6">
          {services?.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No services available</h3>
              <p className="mt-2 text-gray-600">Get started by adding your first service offering.</p>
              
              <div className="mt-8 max-w-sm mx-auto bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Quick Start Guide:</h4>
                <ol className="text-sm text-gray-600 space-y-3 list-decimal list-inside">
                  <li>Use the "Add New Service" form above</li>
                  <li>Enter a descriptive name and details</li>
                  <li>Set your base pricing</li>
                  <li>Click "Add Service" to publish</li>
                </ol>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Need assistance? <Link to="/contact" className="text-primary hover:underline">Contact our support team</Link>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            services?.map((service) => (
              <div key={service._id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                      <p className="text-gray-600">{service.description}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        Base Price: ${service.base_price.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => setEditingService({
                          _id: service._id,
                          name: service.name,
                          description: service.description,
                          base_price: service.base_price.toString()
                        })}
                        disabled={actionLoading}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                      >
                        <svg className="mr-2 h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteService(service._id)}
                        disabled={actionLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                      >
                        <svg className="mr-2 h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageServices;
