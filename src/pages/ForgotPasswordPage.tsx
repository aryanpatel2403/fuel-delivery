import React, { useState } from 'react';
import { Fuel, Mail, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordPageProps {
  onBackToSignIn: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBackToSignIn }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleSetNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSuccess(true);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {resetSuccess ? 'Password Reset Complete' : submitted ? 'Enter New Password' : 'Reset Your Password'}
          </h1>
          <p className="text-xs text-slate-500">
            {resetSuccess
              ? 'Your password has been successfully updated. You can now sign in.'
              : submitted
              ? 'Verification code #8821 matched. Please choose a new password.'
              : "Enter your registered email address and we'll send a password recovery code."}
          </p>
        </div>

        {resetSuccess ? (
          <div className="text-center space-y-4 pt-2">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <button
              onClick={onBackToSignIn}
              className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              Sign In to Your Account
            </button>
          </div>
        ) : submitted ? (
          <form onSubmit={handleSetNewPassword} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-600 block mb-1 font-medium">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              Update Password
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequestReset} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-600 block mb-1 font-medium">Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@fuelup.in"
                  className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              Send Recovery Code
            </button>
          </form>
        )}

        <div className="pt-2 text-center border-t border-slate-100">
          <button
            onClick={onBackToSignIn}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
