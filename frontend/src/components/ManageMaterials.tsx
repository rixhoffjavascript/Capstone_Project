import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch, createData, deleteData } from '../api/apiClient';
import { RefreshCw } from 'lucide-react';

interface Material {
  id: number;
  name: string;
  description: string;
  price_per_unit: number;
  unit: string;
  stock: number;
}

interface FormState {
  name: string;
  description: string;
  price_per_unit: string;
  unit: string;
  stock: string;
}

interface ManageMaterialsProps {
  userRole?: 'customer' | 'employee';
}

const ManageMaterials: React.FC<ManageMaterialsProps> = ({ userRole = 'customer' }) => {
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [localError, setError] = useState<string>('');
  const [newMaterial, setNewMaterial] = useState<FormState>({
    name: '',
    description: '',
    price_per_unit: '',
    unit: '',
    stock: ''
  });

  const { 
    data: materials = [], 
    error: fetchError, 
    loading: dataLoading, 
    refetch: loadMaterials 
  } = useFetch<Material[]>('/api/materials', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Accept': 'application/json'
    }
  });

  // Combine fetch error and local error
  const displayError = localError || fetchError;

  // Loading state combines data loading and action loading
  const loading = dataLoading || actionLoading;

  const clearForm = () => {
    setNewMaterial({
      name: '',
      description: '',
      price_per_unit: '',
      unit: '',
      stock: ''
    });
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMaterial((prev: FormState) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError('');
      setSuccessMessage('');

      await createData('/api/materials', {
        ...newMaterial,
        price_per_unit: parseFloat(newMaterial.price_per_unit),
        stock: parseInt(newMaterial.stock, 10)
      });

      setSuccessMessage('Material added successfully!');
      clearForm();
      await loadMaterials();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`Failed to add material: ${errorMessage}. Please check:
      - All required fields are filled correctly
      - Price and stock values are valid numbers
      - Your internet connection is stable
      If you continue to experience issues, please contact our support team.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setSuccessMessage('');

      await deleteData(`/api/materials/${materialId}`);

      setSuccessMessage('Material deleted successfully!');
      await loadMaterials();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`Failed to delete material: ${errorMessage}. This could be due to:
      - Network connectivity issues
      - The material may be associated with active orders
      - Your session may have expired
      Please verify the material isn't in use and try again. If needed, contact support for assistance.`);
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
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
          <p>You need employee access to manage materials. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  const renderErrorMessage = () => {
    if (!displayError) return null;

    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="font-medium text-lg">Error Managing Materials</p>
              <p className="mt-1">{displayError}</p>
            </div>

            <div className="bg-white p-4 rounded-md border border-red-100">
              <p className="font-medium text-red-700">Employee Access Required</p>
              <p className="mt-1 text-sm">
                To manage materials and inventory:
              </p>
              <ul className="mt-2 text-sm space-y-2">
                <li className="flex items-center">
                  <span className="mr-2">1.</span>
                  <Link to="/login" className="text-primary hover:underline">Sign in</Link>
                  <span className="mx-2">with your employee account</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">2.</span>
                  Contact your administrator if you need employee access
                </li>
              </ul>
            </div>

            <div className="mt-4">
              <p className="font-medium">Common Issues:</p>
              <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                <li>Your session may have expired - please log in again</li>
                <li>You may not have the required employee permissions</li>
                <li>The server may be temporarily unavailable</li>
                <li>There might be network connectivity issues</li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => loadMaterials()}
                className="flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retry Loading Materials</span>
              </button>
              <Link
                to="/contact"
                className="text-red-700 hover:text-red-800 px-4 py-2"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSuccessMessage = () => {
    if (!successMessage) return null;

    return (
      <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6">
        <p>{successMessage}</p>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 sm:mt-8 px-4 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Manage Materials</h1>
      {renderErrorMessage()}
      {renderSuccessMessage()}

      <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Add New Material</h2>
        <form onSubmit={handleAddMaterial} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Material Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="e.g., Oak Hardwood"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                value={newMaterial.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                Unit
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="unit"
                name="unit"
                required
                placeholder="e.g., sq ft, linear ft"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                value={newMaterial.unit}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="price_per_unit" className="block text-sm font-medium text-gray-700">
                Price per Unit ($)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="price_per_unit"
                  name="price_per_unit"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-7 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                  value={newMaterial.price_per_unit}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                Stock
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                required
                min="0"
                placeholder="Enter available quantity"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                value={newMaterial.stock}
                onChange={handleInputChange}
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                placeholder="Describe the material's features and characteristics..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                value={newMaterial.description}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={actionLoading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {actionLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Adding Material...</span>
                </>
              ) : (
                <>
                  <span>Add Material</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={clearForm}
              disabled={actionLoading}
              className="flex-1 sm:flex-none bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Clear Form</span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Existing Materials</h2>
        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {materials?.map((material: Material) => (
              <div key={material.id} className="border rounded p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{material.name}</h3>
                    <p className="text-gray-600">{material.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <p>Price: ${material.price_per_unit} per {material.unit}</p>
                      <p>Stock: {material.stock} {material.unit}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMaterial(material.id)}
                    disabled={actionLoading}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50 px-4 py-2 rounded-md border border-red-200 hover:bg-red-50 transition-colors w-full sm:w-auto"
                  >
                    Delete Material
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMaterials;
