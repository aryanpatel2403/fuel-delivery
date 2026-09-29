import React from 'react';
import { Fuel, ArrowLeft, Home } from 'lucide-react';

interface NotFoundPageProps {
  onGoHome: () => void;
  onOrderFuel: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome, onOrderFuel }) => {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-600">
        <Fuel className="h-8 w-8" />
      </div>
      <div>
        <p className="text-sm font-bold uppercase tracking-wider text-amber-600">404 Error</p>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Page Not Found</h1>
        <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
          The requested fuel delivery destination could not be located. Head back to the homepage or dispatch an on-demand refuel.
        </p>
      </div>

      <div className="flex justify-center gap-3 pt-2">
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
        >
          <Home className="h-4 w-4" />
          <span>Back to Home</span>
        </button>
        <button
          onClick={onOrderFuel}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <span>Order Fuel Delivery</span>
        </button>
      </div>
    </div>
  );
};
