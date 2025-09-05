import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../utils/api';
import Link from 'next/link';

export default function VerifyEmail() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState('verifying'); // verifying, success, error, resent
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!token) return;
    const verify = async () => {
      try {
        await api.post('/auth/verify-email', { token });
        setStatus('success');
      } catch (err) {
        setError(err.response?.data?.error || 'Verification failed.');
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  const handleResend = async () => {
    setStatus('verifying');
    setError('');
    try {
      await api.post('/auth/resend-verification', { token });
      setResent(true);
      setStatus('resent');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend verification email.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
      <div className="bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-6"></div>
            <h2 className="text-xl font-bold text-white mb-2">Verifying your email...</h2>
            <p className="text-gray-400">Please wait while we verify your email address.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-orange-400 mb-2">Email Verified!</h2>
            <p className="text-gray-300 mb-6">Your email has been successfully verified. You can now log in.</p>
            <Link href="/auth/login" className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg hover:from-orange-600 hover:to-red-600 transition-all">Go to Login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">Verification Failed</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <button onClick={handleResend} className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg hover:from-orange-600 hover:to-red-600 transition-all">Resend Verification Email</button>
          </>
        )}
        {status === 'resent' && (
          <>
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-2xl font-bold text-orange-400 mb-2">Verification Email Sent</h2>
            <p className="text-gray-300 mb-6">A new verification email has been sent. Please check your inbox.</p>
          </>
        )}
      </div>
    </div>
  );
} 