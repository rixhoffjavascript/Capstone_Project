import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

declare global {
  interface Window {
    Square: any;
  }
}

interface CheckoutFormProps {
  amount: number;
  onPaymentComplete: (paymentResult: any) => void;
  onError: (error: string) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ amount, onPaymentComplete, onError }) => {
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState<any>(null);

  useEffect(() => {
    // Load Square Web Payments SDK
    const script = document.createElement('script');
    script.src = process.env.REACT_APP_SQUARE_ENV === 'production' 
      ? 'https://web.squarecdn.com/v1/square.js'
      : 'https://sandbox.web.squarecdn.com/v1/square.js';
    script.onload = initializeSquare;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const initializeSquare = async () => {
    if (!window.Square) {
      onError('Failed to load Square payment system');
      return;
    }

    try {
      const payments = window.Square.payments(
        process.env.REACT_APP_SQUARE_APP_ID,
        process.env.REACT_APP_SQUARE_LOCATION_ID
      );
      
      const card = await payments.card({
        style: {
          '.input-container.is-focus': {
            borderColor: '#E31837'
          },
          '.message-text': {
            color: '#495057'
          },
          '.message-icon': {
            color: '#E31837'
          }
        }
      });
      
      await card.attach('#card-container');
      setCard(card);
      setPaymentForm(payments);
    } catch (e) {
      onError('Failed to initialize payment form');
      console.error('Square initialization error:', e);
    }
  };

  const handlePaymentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!card) {
      onError('Payment form not initialized');
      return;
    }

    setLoading(true);
    try {
      const verificationDetails = {
        amount: amount.toFixed(2),
        currencyCode: 'USD',
        intent: 'CHARGE',
        billingContact: {
          givenName: 'John', // These should come from a billing form
          familyName: 'Doe',
          email: 'john.doe@example.com',
        },
        customerInitiated: true,
      };

      const result = await card.tokenize(verificationDetails);
      if (result.status === 'OK') {
        // Send payment token to your server
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            source_id: result.token,
            amount,
            currency: 'USD',
            verification_token: result.token,
            verification_details: verificationDetails,
          }),
        });

        const paymentResult = await response.json();
        if (!response.ok) {
          throw new Error(paymentResult.detail || 'Payment failed');
        }

        onPaymentComplete(paymentResult);
      } else {
        throw new Error(result.errors[0].message);
      }
    } catch (e: any) {
      onError(e.message || 'Payment failed');
      console.error('Payment error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 w-full max-w-md mx-auto">
      <form onSubmit={handlePaymentSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Payment Details</h3>
          <div className="p-4 border rounded-md bg-white">
            <div id="card-container" className="min-h-[100px]"></div>
          </div>
          <p className="text-sm text-gray-600">
            Amount to be charged: ${amount.toFixed(2)}
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading || !card}
          className="w-full"
        >
          {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </Button>

        <div className="text-center text-sm text-gray-500">
          <p>Your payment is secure and encrypted</p>
          <p className="mt-1">We never store your card details</p>
        </div>
      </form>
    </Card>
  );
};

export default CheckoutForm;
