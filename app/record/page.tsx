'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/record/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-100">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

type RecordState = 'idle' | 'recording' | 'paused';

export default function RecordPage() {
  const router = useRouter();
  const [recordState, setRecordState] = useState<RecordState>('idle');
  const [timer, setTimer] = useState(0);
  const [distance, setDistance] = useState(0);
  const [pace, setPace] = useState('0:00');
  const [showMap, setShowMap] = useState(true);
  
  // GPS tracking states
  const [currentPosition, setCurrentPosition] = useState<[number, number]>([-7.7956, 110.3695]); // Default: Yogyakarta
  const [route, setRoute] = useState<[number, number][]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Request location permission on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos: [number, number] = [position.coords.latitude, position.coords.longitude];
          setCurrentPosition(pos);
          setLocationError(null);
        },
        (error) => {
          console.error('Location error:', error);
          setLocationError('Please enable location access');
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLocationError('Geolocation not supported');
    }
  }, []);

  // GPS tracking during recording
  useEffect(() => {
    if (recordState === 'recording' && 'geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const newPos: [number, number] = [position.coords.latitude, position.coords.longitude];
          setCurrentPosition(newPos);
          
          // Add to route
          setRoute((prev) => {
            const newRoute = [...prev, newPos];
            
            // Calculate distance from last point
            if (prev.length > 0) {
              const lastPos = prev[prev.length - 1];
              const dist = calculateDistance(lastPos[0], lastPos[1], newPos[0], newPos[1]);
              setDistance((prevDist) => prevDist + dist);
            }
            
            return newRoute;
          });
        },
        (error) => {
          console.error('Tracking error:', error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
      
      setWatchId(id);
      
      return () => {
        if (id) navigator.geolocation.clearWatch(id);
      };
    } else if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [recordState]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recordState === 'recording') {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recordState]);

  // Calculate pace
  useEffect(() => {
    if (distance > 0 && timer > 0) {
      const minutes = timer / 60;
      const paceValue = minutes / distance;
      const paceMinutes = Math.floor(paceValue);
      const paceSeconds = Math.floor((paceValue - paceMinutes) * 60);
      setPace(`${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`);
    }
  }, [distance, timer]);

  // Calculate distance between two GPS coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleStart = () => {
    setRecordState('recording');
    setShowMap(true);
    // Initialize route with current position
    setRoute([currentPosition]);
    setDistance(0);
    setTimer(0);
  };

  const handlePause = () => {
    setRecordState('paused');
  };

  const handleResume = () => {
    setRecordState('recording');
  };

  const handleStop = () => {
    router.push(`/record/validate?time=${timer}&distance=${distance.toFixed(2)}&pace=${pace}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isIdle = recordState === 'idle';
  const isRecording = recordState === 'recording';

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col pb-28">
        
        {/* Idle State with Map (Default) */}
        {isIdle && showMap && (
          <>
            {/* Full Map - Stop before bottom navigation - Behind everything */}
            <div className="absolute inset-0 pb-28 z-0">
              {locationError ? (
                <div className="flex h-full items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <p className="text-red-500 font-medium">{locationError}</p>
                    <p className="text-sm text-gray-500 mt-2">Enable location to use tracking</p>
                  </div>
                </div>
              ) : (
                <MapView center={currentPosition} route={route} isRecording={false} />
              )}
            </div>

            {/* Stats Overlay on Map - Above map layer */}
            <div className="absolute bottom-32 left-4 right-4 z-50">
              <div className="rounded-2xl bg-white/95 p-5 shadow-lg backdrop-blur-sm">
                {/* Collapse Button at Top of Card */}
                <div className="mb-3 flex justify-center">
                  <button
                    onClick={() => setShowMap(false)}
                    className="flex items-center justify-center text-blue-500"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mb-5 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">00:00</div>
                    <div className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Time</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-gray-900">0</div>
                    <div className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Distance (KM)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">--</div>
                    <div className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Speed (KM/H)</div>
                  </div>
                </div>
                {/* Play Button inside card */}
                <div className="flex justify-center">
                  <button
                    onClick={handleStart}
                    disabled={!!locationError}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-8 w-8 text-white" fill="white" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Idle State without Map (Collapsed) */}
        {isIdle && !showMap && (
          <>
            {/* Expand Button at Top */}
            <div className="flex justify-center pt-5 pb-2">
              <button
                onClick={() => setShowMap(true)}
                className="flex items-center justify-center text-blue-500"
              >
                <ChevronUp className="h-6 w-6" />
              </button>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center pb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-gray-300" />
                <span className="text-xs font-medium text-gray-600">READY</span>
              </div>
            </div>

            {/* Center Stats Display */}
            <div className="flex flex-1 flex-col items-center justify-center px-5">
              <div className="mb-12 text-center">
                <div className="mb-2 text-7xl font-bold text-gray-900">00:00</div>
                <div className="text-xs font-medium uppercase tracking-wide text-gray-400">Time Elapsed</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-6xl font-bold text-gray-900">0.00</div>
                <div className="text-xs font-medium uppercase tracking-wide text-gray-400">Kilometers</div>
              </div>
            </div>

            {/* Play Button */}
            <div className="flex justify-center px-5">
              <button
                onClick={handleStart}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg transition-all hover:scale-105"
              >
                <svg className="h-10 w-10 text-white" fill="white" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </>
        )}

        {/* Recording/Paused State */}
        {!isIdle && (
          <>
            {/* Map View */}
            {showMap && (
              <>
                {/* Map Container - Stop before bottom navigation - Behind everything */}
                <div className="absolute inset-0 pb-28 z-0">
                  <MapView center={currentPosition} route={route} isRecording={isRecording} />
                </div>

                {/* Stats Overlay on Map - Above map layer */}
                <div className="absolute bottom-32 left-4 right-4 z-50">
                  <div className="rounded-2xl bg-white/95 p-5 shadow-lg backdrop-blur-sm">
                    {/* Collapse Button at Top of Card */}
                    <div className="mb-3 flex justify-center">
                      <button
                        onClick={() => setShowMap(false)}
                        className="flex items-center justify-center text-blue-500"
                      >
                        <ChevronDown className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="mb-5 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{formatTime(timer)}</div>
                        <div className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Time</div>
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-gray-900">{distance.toFixed(2)}</div>
                        <div className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Distance (KM)</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{pace}</div>
                        <div className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Pace (MIN/KM)</div>
                      </div>
                    </div>
                    {/* Control Buttons inside card */}
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={handleStop}
                        className="flex h-14 w-28 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-md transition-all hover:scale-105"
                      >
                        <div className="h-4 w-4 rounded bg-white" />
                      </button>
                      <button
                        onClick={isRecording ? handlePause : handleResume}
                        className="flex h-14 w-28 items-center justify-center gap-2 rounded-full bg-white shadow-md transition-all hover:scale-105"
                      >
                        {isRecording ? (
                          <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                          </svg>
                        ) : (
                          <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Stats View (when map collapsed) */}
            {!showMap && (
              <>
                {/* Expand Button at Top */}
                <div className="flex justify-center pt-5 pb-2">
                  <button
                    onClick={() => setShowMap(true)}
                    className="flex items-center justify-center text-blue-500"
                  >
                    <ChevronUp className="h-6 w-6" />
                  </button>
                </div>

                {/* Status Badge */}
                <div className="flex justify-center pb-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
                    <div className={`h-2 w-2 rounded-full ${isRecording ? 'bg-blue-500 animate-pulse' : 'bg-yellow-500'}`} />
                    <span className="text-xs font-bold uppercase text-blue-600">{isRecording ? 'Running' : 'Paused'}</span>
                  </div>
                </div>

                {/* Large Stats */}
                <div className="flex flex-1 flex-col items-center justify-center px-5">
                  <div className="mb-8 text-center">
                    <div className="mb-2 text-7xl font-bold text-gray-900">{formatTime(timer)}</div>
                    <div className="text-sm font-medium uppercase tracking-wide text-blue-500">Time Elapsed</div>
                  </div>
                  <div className="mb-8 text-center">
                    <div className="mb-2 text-6xl font-bold text-gray-900">{distance.toFixed(2)}</div>
                    <div className="text-sm font-medium uppercase tracking-wide text-blue-500">Kilometers</div>
                  </div>
                  <div className="grid grid-cols-2 gap-8 text-center">
                    <div>
                      <div className="mb-1 text-3xl font-bold text-gray-900">{pace}</div>
                      <div className="text-xs font-medium uppercase tracking-wide text-gray-400">Avg Pace</div>
                    </div>
                    <div>
                      <div className="mb-1 text-3xl font-bold text-gray-900">0.00</div>
                      <div className="text-xs font-medium uppercase tracking-wide text-gray-400">BPM</div>
                    </div>
                  </div>
                </div>

                {/* Control Buttons for collapsed view */}
                <div className="px-5">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={handleStop}
                      className="flex h-16 w-32 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-lg transition-all hover:scale-105"
                    >
                      <div className="h-5 w-5 rounded bg-white" />
                    </button>
                    <button
                      onClick={isRecording ? handlePause : handleResume}
                      className="flex h-16 w-32 items-center justify-center gap-2 rounded-full bg-white shadow-lg transition-all hover:scale-105"
                    >
                      {isRecording ? (
                        <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <BottomNavigation activeTab="Record" />
    </div>
  );
}
