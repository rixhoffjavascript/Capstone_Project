import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../api/apiClient';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { ServiceCard } from './ui/service-card';
import { Button } from './ui/button';
import { Calculator, RefreshCw } from 'lucide-react';
import CheckoutForm from './CheckoutForm.tsx';

interface Material {
  _id: string;
  name: string;
  price_per_unit: number;
  unit: string;
}

interface Service {
  _id: string;
  name: string;
  base_price: number;
  description: string;
}

const RequestQuote = (): React.JSX.Element => {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { 
    data: materials, 
    error: materialsError, 
    loading: materialsLoading,
    refetch: refetchMaterials 
  } = useFetch<Material[]>('/api/materials');
  
  const { 
    data: services, 
    error: servicesError, 
    loading: servicesLoading,
    refetch: refetchServices 
  } = useFetch<Service[]>('/api/services');

  const handleRetry = async (type: 'materials' | 'services') => {
    try {
      if (type === 'materials') {
        await refetchMaterials();
      } else {
        await refetchServices();
      }
    } catch (err) {
      console.error(`Failed to retry loading ${type}:`, err);
    }
  };

  const ErrorMessage = ({ 
    type, 
    error, 
    onRetry 
  }: { 
    type: string; 
    error: string; 
    onRetry: () => void;
  }) => {
    const isAuthError = error.toLowerCase().includes('log in') || error.toLowerCase().includes('permission');
    const isNetworkError = error.toLowerCase().includes('network') || error.toLowerCase().includes('unavailable');
    
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 space-y-4 mb-8">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-lg">Unable to load {type}</p>
            <p className="mt-1">{error}</p>
            
            {isAuthError && (
              <div className="mt-4 bg-white p-4 rounded-md border border-red-100">
                <p className="font-medium text-red-700">Authentication Required</p>
                <p className="mt-1 text-sm">
                  To access our {type} and pricing information:
                </p>
                <ul className="mt-2 text-sm space-y-2">
                  <li className="flex items-center">
                    <span className="mr-2">1.</span>
                    <Link to="/login" className="text-primary hover:underline">Sign in</Link>
                    <span className="mx-2">or</span>
                    <Link to="/register" className="text-primary hover:underline">create an account</Link>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">2.</span>
                    Return to this page to view pricing and request quotes
                  </li>
                </ul>
              </div>
            )}
            
            {isNetworkError && (
              <div className="mt-4">
                <p className="font-medium">Troubleshooting Steps:</p>
                <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                  <li>Check your internet connection</li>
                  <li>Try refreshing the page</li>
                  <li>Clear your browser cache</li>
                  <li>If the problem persists, our servers might be experiencing issues</li>
                </ul>
              </div>
            )}
            
            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={onRetry}
                className="flex items-center space-x-2 bg-white text-red-600 border border-red-200 px-4 py-2 rounded-md hover:bg-red-50 transition-colors duration-200 font-medium shadow-sm"
              >
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Retry Loading {type}</span>
              </button>
              {isNetworkError && (
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center space-x-2 bg-white text-red-600 border border-red-200 px-4 py-2 rounded-md hover:bg-red-50 transition-colors duration-200 font-medium shadow-sm"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh Page</span>
                </button>
              )}
              <Link
                to="/contact"
                className="inline-flex items-center px-4 py-2 text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl mb-4">
          Request a Custom Quote
        </h1>
        <p className="text-lg text-neutral-600">
          Choose from our premium materials and professional installation services to get a customized quote for your project.
        </p>
      </div>
      
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-6">Premium Materials</h2>
          {materialsLoading ? (
            <LoadingSpinner />
          ) : materialsError ? (
            <ErrorMessage 
              type="materials" 
              error={materialsError} 
              onRetry={() => handleRetry('materials')} 
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {materials?.map((material) => (
                <Card key={material._id} className="transition-all hover:shadow-lg">
                  <CardHeader>
                    <CardTitle>{material.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">
                      ${material.price_per_unit}
                      <span className="text-sm text-neutral-600 font-normal">
                        {' '}per {material.unit}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Professional Services</h2>
          {servicesLoading ? (
            <LoadingSpinner />
          ) : servicesError ? (
            <ErrorMessage 
              type="services" 
              error={servicesError} 
              onRetry={() => handleRetry('services')} 
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {services?.map((service, index) => (
                <ServiceCard
                  key={service._id}
                  name={service.name}
                  description={service.description}
                  base_price={service.base_price}
                  type={index === 0 ? "installation" : index === 1 ? "measurement" : "finishing"}
                />
              ))}
            </div>
          )}
        </section>

        <div className="text-center">
          {!showPayment ? (
            <Button 
              size="lg" 
              className="gap-2"
              disabled={materialsLoading || servicesLoading || !!materialsError || !!servicesError}
              onClick={() => {
                if (!localStorage.getItem('token')) {
                  window.location.href = '/register';
                } else {
                  // Calculate total from selected materials and services
                  const total = 1000; // This should be calculated based on selections
                  setPaymentAmount(total);
                  setShowPayment(true);
                }
              }}
            >
              {!localStorage.getItem('token') ? 'Sign In to Calculate Quote' : 'Calculate Quote'}
              <Calculator className="h-5 w-5" />
            </Button>
          ) : (
            <div className="space-y-6">
              {paymentError && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
                  <p>{paymentError}</p>
                </div>
              )}
              
              {paymentSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 text-center">
                  <p className="font-medium">Payment Successful!</p>
                  <p className="mt-2">Thank you for your order. We'll be in touch shortly.</p>
                  <Button
                    onClick={() => {
                      setShowPayment(false);
                      setPaymentSuccess(false);
                      setPaymentError(null);
                    }}
                    className="mt-4"
                  >
                    Start New Quote
                  </Button>
                </div>
              ) : (
                <CheckoutForm
                  amount={paymentAmount}
                  onPaymentComplete={(result) => {
                    console.log('Payment complete:', result);
                    setPaymentSuccess(true);
                  }}
                  onError={(error) => {
                    console.error('Payment error:', error);
                    setPaymentError(error);
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestQuote;
