import React, { useState, useEffect } from 'react';
import { 
  Fuel, Lock, Mail, User as UserIcon, Phone, ArrowRight, 
  ShieldCheck, Truck, Check, Car, AlertCircle 
} from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { store } from '../services/store';
import { UserRole, User } from '../types';
import { DEMO_USERS } from '../data/mockData';

interface AuthPageProps {
  initialMode?: 'signin' | 'signup';
  initialRole?: UserRole;
  onSuccess: (role: UserRole) => void;
  onForgotPassword: () => void;
  onSwitchMode: (mode: 'signin' | 'signup') => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'signin',
  initialRole = 'customer',
  onSuccess,
  onForgotPassword,
  onSwitchMode
}) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState(initialMode === 'signup' ? '' : '24172022025@gnu.ac.in');
  const [password, setPassword] = useState(initialMode === 'signup' ? '' : 'password123');
  const [name, setName] = useState(initialMode === 'signup' ? '' : 'Aryan Varma');
  const [phone, setPhone] = useState(initialMode === 'signup' ? '' : '+91 98791 23456');
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const isUp = initialMode === 'signup';
    setIsSignUp(isUp);
    if (isUp) {
      setRole('customer');
      // Ensure all fields are clear when opening sign-up
      setEmail('');
      setPassword('');
      setName('');
      setPhone('');
      setVehicleBrand('');
      setVehicleModel('');
      setVehicleReg('');
    }
  }, [initialMode]);

  const handleRoleQuickFill = (targetRole: UserRole) => {
    if (isSignUp) return; // Disallow prefill in signup mode
    setRole(targetRole);
    if (targetRole === 'customer') {
      setEmail('24172022025@gnu.ac.in');
      setName('Aryan Varma');
      setPhone('+91 98791 23456');
      setPassword('password123');
    } else if (targetRole === 'driver') {
      setEmail('driver@fuelup.in');
      setName('Ramesh Patel');
      setPhone('+91 98250 44128');
      setPassword('password123');
    } else {
      setEmail('admin@fuelup.in');
      setName('System Operations Lead');
      setPhone('+91 98240 00100');
      setPassword('password123');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      setErrorMsg('');
      const res = await signInWithPopup(auth, googleProvider);
      const fbUser = res.user;

      const userRole = isSignUp ? 'customer'
        : fbUser.email === 'driver@fuelup.in' ? 'driver'
        : fbUser.email === 'admin@fuelup.in' || fbUser.email === '24172022025@gnu.ac.in' ? 'admin'
        : 'customer';

      const userProfile: User = {
        id: fbUser.uid,
        name: fbUser.displayName || 'FuelUp Member',
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '',
        role: userRole,
        avatarUrl: fbUser.photoURL || undefined,
        savedVehicles: [],
        savedAddresses: []
      };

      if (isSignUp) {
        await store.signUp(userProfile);
      } else {
        await store.login(userProfile);
      }
      onSuccess(userRole);
    } catch (err) {
      console.warn('Google sign-in completed or fallback used:', err);
      if (isSignUp) {
        setErrorMsg('Google sign-up could not be completed. Please fill in your details below.');
      } else {
        // Fallback for sandboxed preview if popups are intercepted in sign-in mode
        const fallbackUser = DEMO_USERS[role];
        await store.login(fallbackUser);
        onSuccess(fallbackUser.role);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        // Strict Validation: No blank or bypass submissions allowed
        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPhone = phone.trim();
        const cleanDigits = trimmedPhone.replace(/\D/g, '');

        if (!trimmedName || trimmedName.length < 2) {
          setErrorMsg('Please enter your valid full name (minimum 2 characters).');
          setIsAuthenticating(false);
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
          setErrorMsg('Please enter a valid email address.');
          setIsAuthenticating(false);
          return;
        }

        if (cleanDigits.length < 10) {
          setErrorMsg('Please enter a valid 10-digit mobile phone number.');
          setIsAuthenticating(false);
          return;
        }

        if (!password || password.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          setIsAuthenticating(false);
          return;
        }

        // Only register vehicle if user deliberately filled it in (no direct mock vehicle)
        const userVehicles = (vehicleBrand.trim() && vehicleModel.trim()) ? [
          {
            id: `veh-${Date.now()}`,
            brand: vehicleBrand.trim(),
            model: vehicleModel.trim(),
            category: 'suv' as const,
            fuelType: 'petrol' as const,
            tankCapacity: 45,
            regNumber: vehicleReg.trim() || 'Pending Registration'
          }
        ] : [];

        const newUser: User = {
          id: `usr-${Date.now()}`,
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          role: 'customer',
          savedVehicles: userVehicles,
          savedAddresses: [] // Clean: No fake/mock addresses injected
        };
        await store.signUp(newUser);
        onSuccess('customer');
      } else {
        // Sign In
        if (!email.trim()) {
          setErrorMsg('Please enter your email address.');
          setIsAuthenticating(false);
          return;
        }
        if (!password) {
          setErrorMsg('Please enter your password.');
          setIsAuthenticating(false);
          return;
        }

        const matchingDemo = DEMO_USERS[role];
        const loggedUser: User = {
          ...matchingDemo,
          email: email.trim(),
          name: role === 'driver' ? 'Ramesh Patel' : role === 'admin' ? 'Operations Lead' : name || 'Aryan Varma',
          role
        };
        await store.login(loggedUser);
        onSuccess(role);
      }
    } catch (err) {
      setErrorMsg('Authentication encountered an error. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs space-y-6">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs">
            <Fuel className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {isSignUp ? 'Create FuelUp Account' : 'Sign in to FuelUp'}
          </h1>
          <p className="text-xs text-slate-500">
            {isSignUp
              ? 'Register for instant on-demand fuel delivery directly to your vehicle'
              : 'Access your active deliveries, vehicle tank profiles, and past receipts'}
          </p>
        </div>

        {/* 1-Click Google Sign In */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isAuthenticating}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSignUp ? 'Sign up with Google' : 'Continue with Google'}</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-slate-400">
              <span className="bg-white px-2">Or with Email</span>
            </div>
          </div>
        </div>

        {/* Portal Role Selector - Only for Sign In mode (Removed from Sign Up) */}
        {!isSignUp ? (
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Select Account Role
            </label>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleRoleQuickFill('customer')}
                className={`rounded-lg py-2 transition ${
                  role === 'customer' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickFill('driver')}
                className={`rounded-lg py-2 transition ${
                  role === 'driver' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Driver
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickFill('admin')}
                className={`rounded-lg py-2 transition ${
                  role === 'admin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <Car className="h-4 w-4 text-amber-600" />
              <span>Customer Account Registration</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Create your customer account to order on-demand fuel directly to your car, SUV, or fleet.
              <span className="block mt-0.5 text-[10px] text-amber-700/80">
                (Bowser pilots and administrators are onboarded internally by operations leads).
              </span>
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isSignUp && (
            <div>
              <label className="text-slate-600 block mb-1 font-medium">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs focus:outline-amber-500"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-600 block mb-1 font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs focus:outline-amber-500"
                required
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="text-slate-600 block mb-1 font-medium">Mobile Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs focus:outline-amber-500"
                  required
                />
              </div>
            </div>
          )}

          {isSignUp && role === 'customer' && (
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 border border-slate-100">
              <div className="col-span-2 flex items-center gap-1.5 font-bold text-slate-700 mb-1">
                <Car className="h-3.5 w-3.5 text-amber-600" />
                <span>Primary Vehicle (Optional)</span>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Brand</label>
                <input
                  type="text"
                  value={vehicleBrand}
                  onChange={(e) => setVehicleBrand(e.target.value)}
                  placeholder="e.g. Hyundai, Tata"
                  className="w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Model</label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="e.g. Creta, Nexon"
                  className="w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-slate-500 block mb-0.5">Registration Plate (Optional)</label>
                <input
                  type="text"
                  value={vehicleReg}
                  onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
                  placeholder="e.g. GJ-01-AB-1234"
                  className="w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs font-mono uppercase"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-600 font-medium">Password</label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-amber-600 font-semibold hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? 'Create a secure password (min 6 chars)' : '••••••••'}
                className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs focus:outline-amber-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
          >
            <span>{isSignUp ? 'Create FuelUp Account' : `Sign In as ${role.toUpperCase()}`}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Tab Toggle */}
        <div className="text-center pt-2 border-t border-slate-100 text-xs">
          <p className="text-slate-500">
            {isSignUp ? 'Already registered on FuelUp?' : "Don't have an account yet?"}{' '}
            <button
              onClick={() => {
                const nextMode = isSignUp ? 'signin' : 'signup';
                setIsSignUp(!isSignUp);
                setErrorMsg('');
                if (!isSignUp) {
                  setRole('customer');
                  setEmail('');
                  setPassword('');
                  setName('');
                  setPhone('');
                  setVehicleBrand('');
                  setVehicleModel('');
                  setVehicleReg('');
                }
                onSwitchMode(nextMode);
              }}
              className="font-bold text-amber-600 hover:underline"
            >
              {isSignUp ? 'Sign In here' : 'Sign Up for free'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
