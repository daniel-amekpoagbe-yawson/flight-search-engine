import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { X, Check, AlertCircle } from 'lucide-react';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (payment: { name: string; cardNumber: string }) => Promise<void>;
  flightSummary: string;
}

interface BookingState {
  status: 'form' | 'processing' | 'success' | 'error';
  bookingReference?: string;
  errorMessage?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({ open, onClose, onConfirm, flightSummary }) => {
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [bookingState, setBookingState] = useState<BookingState>({ status: 'form' });

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingState({ status: 'processing' });
    try {
      await onConfirm({ name, cardNumber });
      // Generate a realistic booking reference
      const bookingRef = `BK${Date.now().toString().slice(-6).toUpperCase()}`;
      setBookingState({ status: 'success', bookingReference: bookingRef });
    } catch (err: any) {
      setBookingState({
        status: 'error',
        errorMessage: err?.message || 'Booking failed. Please try again.',
      });
    }
  };

  const handleClose = () => {
    setBookingState({ status: 'form' });
    setName('');
    setCardNumber('');
    onClose();
  };

  // Form view
  if (bookingState.status === 'form') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
        <Card className="relative z-10 w-full max-w-md bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
            <h2 className="text-lg font-bold text-gray-900">Confirm Booking</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Flight Summary */}
          <div className="mb-6 p-4 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-lg">
            <p className="text-sm text-gray-600 font-medium">Flight Summary</p>
            <p className="text-sm text-gray-900 font-semibold mt-1">{flightSummary}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Card Number</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-500"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').slice(0, 16))}
                placeholder="Enter your card details"
                maxLength={16}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Mock payment - use test card</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
              >
                Confirm & Pay
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // Processing view
  if (bookingState.status === 'processing') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <Card className="relative z-10 w-full max-w-md bg-white shadow-2xl flex flex-col items-center justify-center py-8">
          <div className="animate-spin mb-4">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-black rounded-full"></div>
          </div>
          <p className="text-gray-900 font-semibold">Processing your payment...</p>
          <p className="text-sm text-gray-600 mt-2">Please wait</p>
        </Card>
      </div>
    );
  }

  // Success view
  if (bookingState.status === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
        <Card className="relative z-10 w-full max-w-md bg-white shadow-2xl">
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
            <p className="text-gray-600 text-sm mb-6">Your flight has been successfully booked.</p>

            {/* Booking Reference */}
            <div className="w-full bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-xs text-blue-600 font-medium mb-1">Booking Reference</p>
              <p className="text-2xl font-bold text-blue-900 font-mono">{bookingState.bookingReference}</p>
            </div>

            <p className="text-xs text-gray-500 mb-6">
              A confirmation email has been sent to your registered email address.
            </p>

            <Button
              onClick={handleClose}
              variant="primary"
              fullWidth
            >
              Done
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Error view
  if (bookingState.status === 'error') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
        <Card className="relative z-10 w-full max-w-md bg-white shadow-2xl">
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Failed</h3>
            <p className="text-gray-600 text-sm mb-6">{bookingState.errorMessage}</p>

            <div className="flex gap-3 w-full">
              <Button
                onClick={() => setBookingState({ status: 'form' })}
                variant="primary"
                fullWidth
              >
                Try Again
              </Button>
              <Button
                onClick={handleClose}
                variant="secondary"
                fullWidth
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};

export default BookingModal;
