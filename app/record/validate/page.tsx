'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, MapPin, Clock, TrendingUp, Share2 } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import { Suspense, useState } from 'react';
import { useAccount } from 'wagmi';
import { submitRun } from '@/lib/api';

function ValidateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { address } = useAccount();
  const [title, setTitle] = useState('Morning Run');
  const [isPosting, setIsPosting] = useState(false);
  
  const time = searchParams.get('time') || '0';
  const distance = searchParams.get('distance') || '0.00';
  const pace = searchParams.get('pace') || '0:00';
  const startTime = searchParams.get('startTime') || String(Date.now() - parseInt(time) * 1000);
  const endTime = searchParams.get('endTime') || String(Date.now());
  const gpsDataStr = searchParams.get('gpsData') || '[]';
  
  let gpsData = [];
  try {
    gpsData = JSON.parse(decodeURIComponent(gpsDataStr));
  } catch (e) {
    console.error('Failed to parse GPS data:', e);
  }

  const formatTime = (seconds: string) => {
    const secs = parseInt(seconds);
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleCancel = () => {
    // Kembali ke record page dengan state paused
    router.push('/record?state=paused');
  };

  const handlePost = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    setIsPosting(true);

    try {
      // Generate device hash (simple hash dari user agent + timestamp)
      const deviceInfo = `${navigator.userAgent}-${address}`;
      const deviceHash = btoa(deviceInfo).substring(0, 32);

      // Prepare data untuk backend
      let distanceInMeters = Math.round(parseFloat(distance) * 1000);
      const durationInSeconds = parseInt(time);
      
      // TEMPORARY: For testing, ensure minimum distance of 1 meter
      if (distanceInMeters === 0) {
        console.warn('Distance is 0, setting to 1 meter for testing');
        distanceInMeters = 1;
      }
      
      const runData = {
        walletAddress: address, // Backend expects walletAddress
        distanceMeters: distanceInMeters, // Backend expects distanceMeters (min 1)
        durationSeconds: durationInSeconds, // Backend expects durationSeconds
        startTime: parseInt(startTime),
        endTime: parseInt(endTime),
        deviceHash,
        gpsData: gpsData.length > 0 ? gpsData : undefined,
      };

      console.log('Submitting run to backend:', runData);

      // Submit ke backend /run/submit
      const result = await submitRun(runData);

      console.log('Run submitted successfully:', result);

      // Show success message
      alert(`Activity posted! +${result.run.xpEarned} XP earned! 🎉`);

      // Redirect to home
      router.push('/');
    } catch (error: any) {
      console.error('Post error:', error);
      
      // Show detailed error message
      const errorMsg = error.message || 'Unknown error';
      alert(`Failed to submit to backend: ${errorMsg}\n\nSaving locally instead...`);
      
      // Fallback: Save to localStorage
      console.warn('Backend error, saving locally');
      const activities = JSON.parse(localStorage.getItem('runera_activities') || '[]');
      activities.push({
        id: Date.now(),
        title,
        distance: parseFloat(distance),
        duration: parseInt(time),
        pace,
        timestamp: Date.now(),
        gpsData: gpsData.length > 0 ? gpsData : undefined,
      });
      localStorage.setItem('runera_activities', JSON.stringify(activities));
      
      router.push('/');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="mx-auto max-w-md pb-28">
        {/* Header */}
        <header className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-sm">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Great Job!</h1>
              <p className="text-xs text-gray-500">Review your activity</p>
            </div>
          </div>
        </header>

        {/* Map Preview */}
        <div className="mx-5 mb-5 overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="flex h-full items-center justify-center">
              <MapPin className="h-10 w-10 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Activity Title */}
        <div className="mx-5 mb-5">
          <label className="mb-2 block text-xs font-semibold text-gray-700">Activity Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Enter activity title"
          />
        </div>

        {/* Stats Summary */}
        <div className="mx-5 mb-5 rounded-xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-gray-900">Summary</h3>
          
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="mb-1 text-[10px] font-medium text-gray-500">Duration</p>
              <p className="text-lg font-bold text-gray-900">{formatTime(time)}</p>
            </div>

            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="mb-1 text-[10px] font-medium text-gray-500">Distance</p>
              <p className="text-lg font-bold text-gray-900">{distance}</p>
              <p className="text-[10px] text-gray-500">km</p>
            </div>

            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <p className="mb-1 text-[10px] font-medium text-gray-500">Avg Pace</p>
              <p className="text-lg font-bold text-gray-900">{pace}</p>
              <p className="text-[10px] text-gray-500">/km</p>
            </div>
          </div>

          {/* XP Earned - Will be calculated by backend */}
          <div className="mb-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 p-3 text-center">
            <p className="mb-1 text-xs font-medium text-orange-600">Estimated XP</p>
            <p className="text-2xl font-bold text-orange-700">+{Math.round(parseFloat(distance) * 10)} XP</p>
            <p className="text-[10px] text-orange-500 mt-1">Final XP will be calculated by backend</p>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="mb-1 text-[10px] font-medium text-gray-500">Calories</p>
              <p className="text-base font-bold text-gray-900">
                {Math.round(parseFloat(distance) * 65)} <span className="text-xs font-normal text-gray-500">kcal</span>
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="mb-1 text-[10px] font-medium text-gray-500">Elevation</p>
              <p className="text-base font-bold text-gray-900">
                {Math.round(parseFloat(distance) * 15)} <span className="text-xs font-normal text-gray-500">m</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mx-5 flex gap-3">
          <button
            onClick={handleCancel}
            disabled={isPosting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={isPosting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Share2 className="h-4 w-4" />
            {isPosting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
      <BottomNavigation activeTab="Record" />
    </div>
  );
}

export default function ValidatePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa]">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <ValidateContent />
    </Suspense>
  );
}
