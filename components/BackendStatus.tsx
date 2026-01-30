'use client';

import { useEffect, useState } from 'react';
import { isBackendAvailable, checkHealth, getAPIUrl } from '@/lib/api';

export default function BackendStatus() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    async function checkBackend() {
      setIsChecking(true);
      try {
        const online = await isBackendAvailable();
        setIsOnline(online);

        if (online) {
          const health = await checkHealth();
          setHealthData(health);
        }
      } catch (error) {
        console.error('Backend check failed:', error);
        setIsOnline(false);
      } finally {
        setIsChecking(false);
      }
    }

    checkBackend();
  }, []);

  if (isChecking) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300">Checking backend...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-green-500' : 'bg-red-500'
            }`}
          ></div>
          <span className="text-sm font-medium text-white">
            Backend Status
          </span>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded ${
            isOnline
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      <div className="text-xs text-gray-400 space-y-1">
        <div>URL: {getAPIUrl()}</div>
        {healthData && (
          <>
            <div>Status: {healthData.status}</div>
            {healthData.version && <div>Version: {healthData.version}</div>}
          </>
        )}
      </div>
    </div>
  );
}
