import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface OtpVerificationPageProps {
  email: string;
  onVerify: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  onResend: (email: string) => Promise<{ success: boolean; message: string }>;
}

const OtpVerificationPage: React.FC<OtpVerificationPageProps> = ({ email, onVerify, onResend }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && !canResend) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, canResend]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }
    
    setLoading(true);
    try {
      const result = await onVerify(email, otp);
      if (result.success) {
        setSuccess('Verification successful! Redirecting...');
        setTimeout(() => {
          navigate('/home');
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const result = await onResend(email);
      if (result.success) {
        setSuccess('Verification code resent successfully');
        setCanResend(false);
        setCountdown(60);
      } else {
        setError(result.message);
      }
    } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Verify Your Account</h2>
          
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              We've sent a verification code to:
            </p>
            <p className="mt-1 font-medium text-gray-800">{email}</p>
          </div>
          
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-red-700">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 rounded-md bg-green-50 p-3 text-green-700">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                placeholder="Enter the 4-digit code"
                className="mt-1 w-full rounded-lg border border-gray-300 p-3 text-center text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').substring(0, 4))}
                maxLength={4}
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              className={`w-full rounded-lg bg-[#041F41] px-4 py-3 text-white transition hover:bg-blue-980 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                loading ? 'cursor-not-allowed opacity-70' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={!canResend || loading}
                className={`font-medium text-blue-600 hover:text-blue-800 ${
                  !canResend || loading ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                {canResend ? 'Resend Code' : `Resend in ${countdown}s`}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  export default OtpVerificationPage;