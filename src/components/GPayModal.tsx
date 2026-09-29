import React, { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, QrCode, Smartphone, Loader2, X } from 'lucide-react';

interface GPayModalProps {
  isOpen: boolean;
  amount: number;
  orderNumber: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const GPayModal: React.FC<GPayModalProps> = ({
  isOpen,
  amount,
  orderNumber,
  onSuccess,
  onCancel
}) => {
  const [step, setStep] = useState<'scan' | 'verifying' | 'success'>('scan');
  const [upiId] = useState('fuelup.logistics@okaxis');

  useEffect(() => {
    if (isOpen) {
      setStep('scan');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setStep('verifying');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 1200);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
              G
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Google Pay UPI Gateway</h3>
              <p className="text-[11px] text-slate-500">Secure 256-bit Encrypted Transaction</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={step === 'verifying'}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'scan' && (
            <div className="space-y-5 text-center">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Paying FuelUp Logistics</p>
                <div className="mt-1 flex items-baseline justify-center gap-1">
                  <span className="text-lg font-semibold text-slate-700">₹</span>
                  <span className="text-3xl font-extrabold text-slate-950 tabular-nums">
                    {amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Order Ref: {orderNumber}</p>
              </div>

              {/* QR Code Container */}
              <div className="mx-auto flex w-48 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                <div className="relative flex aspect-square w-full items-center justify-center rounded-lg bg-slate-50 p-2">
                  {/* Generated clean SVG QR Code representation */}
                  <svg className="h-full w-full" viewBox="0 0 100 100" fill="none">
                    <rect width="100" height="100" fill="white" />
                    {/* Corner 1 */}
                    <rect x="10" y="10" width="26" height="26" fill="#0f172a" rx="2" />
                    <rect x="14" y="14" width="18" height="18" fill="white" rx="1" />
                    <rect x="18" y="18" width="10" height="10" fill="#0f172a" rx="1" />
                    {/* Corner 2 */}
                    <rect x="64" y="10" width="26" height="26" fill="#0f172a" rx="2" />
                    <rect x="68" y="14" width="18" height="18" fill="white" rx="1" />
                    <rect x="72" y="18" width="10" height="10" fill="#0f172a" rx="1" />
                    {/* Corner 3 */}
                    <rect x="10" y="64" width="26" height="26" fill="#0f172a" rx="2" />
                    <rect x="14" y="68" width="18" height="18" fill="white" rx="1" />
                    <rect x="18" y="72" width="10" height="10" fill="#0f172a" rx="1" />
                    {/* Center dot pattern */}
                    <rect x="42" y="14" width="6" height="6" fill="#0f172a" />
                    <rect x="52" y="14" width="6" height="6" fill="#0f172a" />
                    <rect x="42" y="24" width="12" height="6" fill="#0f172a" />
                    <rect x="42" y="42" width="16" height="16" fill="#0f172a" rx="2" />
                    <rect x="46" y="46" width="8" height="8" fill="white" />
                    <rect x="14" y="44" width="12" height="6" fill="#0f172a" />
                    <rect x="74" y="44" width="12" height="6" fill="#0f172a" />
                    <rect x="44" y="66" width="6" height="16" fill="#0f172a" />
                    <rect x="54" y="74" width="12" height="6" fill="#0f172a" />
                    <rect x="74" y="68" width="12" height="12" fill="#0f172a" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-md bg-white p-1 shadow-sm">
                      <span className="font-bold text-xs text-blue-600">GPay</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-[11px] font-semibold text-slate-700">Scan via any UPI App</p>
                  <p className="text-[10px] text-slate-400">Google Pay, PhonePe, Paytm</p>
                </div>
              </div>

              {/* UPI ID Pill */}
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2 text-xs border border-slate-200/80">
                <span className="text-slate-500">UPI ID:</span>
                <span className="font-mono font-medium text-slate-800">{upiId}</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleSimulatePayment}
                  className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 flex items-center justify-center gap-2"
                >
                  <Smartphone className="h-4 w-4" />
                  Approve in Google Pay App
                </button>
                <p className="text-[11px] text-slate-400">
                  Instant webhook callback simulates verified bank confirmation
                </p>
              </div>
            </div>
          )}

          {step === 'verifying' && (
            <div className="py-10 text-center space-y-4">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
              <div>
                <h4 className="font-bold text-slate-900">Verifying UPI Transaction...</h4>
                <p className="text-xs text-slate-500 mt-1">Waiting for banking response from NPCI</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
              <div>
                <h4 className="text-lg font-bold text-slate-900">Payment Verified!</h4>
                <p className="text-xs text-slate-500 mt-1">₹{amount.toFixed(2)} received · Dispatching bowser</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-slate-50 px-5 py-2.5 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>NPCI & RBI Compliant Payment Gateway</span>
        </div>
      </div>
    </div>
  );
};
