'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { useAccount, useSignMessage } from 'wagmi';
import { requestNonce, connectWallet } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { ready, authenticated, login } = usePrivy();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (ready && authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  // Auto-authenticate with backend when wallet is connected
  useEffect(() => {
    const authenticateWithBackend = async () => {
      if (!address || !isConnected || isAuthenticating) return;
      
      // Check if already have token
      const existingToken = localStorage.getItem('runera_token');
      if (existingToken) {
        console.log('✅ Already have JWT token');
        return;
      }

      setIsAuthenticating(true);
      
      try {
        console.log('🔐 Requesting nonce from backend...');
        
        // Step 1: Request nonce
        const { nonce, message } = await requestNonce({ walletAddress: address });
        console.log('✅ Nonce received:', nonce);
        
        // Step 2: Sign message
        console.log('✍️ Requesting signature from wallet...');
        const signature = await signMessageAsync({ message });
        console.log('✅ Message signed');
        
        // Step 3: Connect and get JWT
        console.log('🔗 Connecting to backend...');
        const { token } = await connectWallet({
          walletAddress: address,
          signature,
          message,
          nonce,
        });
        
        console.log('✅ JWT token received and saved!');
        
      } catch (error) {
        console.error('❌ Backend authentication failed:', error);
        // Don't block user - they can still use app with localStorage fallback
      } finally {
        setIsAuthenticating(false);
      }
    };

    authenticateWithBackend();
  }, [address, isConnected, signMessageAsync, isAuthenticating]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Activity className="h-10 w-10 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Runera</h1>
          <p className="text-lg text-gray-600">Run, Track & Earn on Base</p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
            Welcome Back
          </h2>
          
          <p className="mb-8 text-center text-gray-600">
            Sign in to track your runs and earn rewards
          </p>

          {/* Login Button */}
          <button
            onClick={login}
            disabled={isAuthenticating}
            className="w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAuthenticating ? 'Authenticating...' : 'Sign In'}
          </button>

          {isAuthenticating && (
            <p className="mt-4 text-center text-sm text-gray-500">
              Please sign the message in your wallet...
            </p>
          )}

          {/* Features */}
          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">GPS Tracking</p>
                <p className="text-sm text-gray-500">Real-time route recording</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Web3 Rewards</p>
                <p className="text-sm text-gray-500">Earn tokens on Base network</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Events & Challenges</p>
                <p className="text-sm text-gray-500">Join exclusive running events</p>
              </div>
            </div>
          </div>

          {/* Login Methods Info */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <p className="text-center text-xs text-gray-500">
              Sign in with Email, Google, or Web3 Wallet
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          By signing in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
