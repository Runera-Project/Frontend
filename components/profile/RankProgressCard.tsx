'use client';

import { TIER_REQUIREMENTS, TIER_NAMES, TIER_COLORS } from '@/lib/contracts';

interface RankProgressCardProps {
  profile?: {
    tier: number;
    tierName: string;
    stats: {
      totalDistance: number;
    };
  };
}

export default function RankProgressCard({ profile }: RankProgressCardProps) {
  if (!profile) {
    return (
      <div className="mx-6 mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-24 w-24 bg-gray-200 rounded-2xl mx-auto mb-4" />
          <div className="h-6 bg-gray-200 rounded mb-4 w-32 mx-auto" />
          <div className="h-3 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto" />
        </div>
      </div>
    );
  }

  const currentTier = profile.tier;
  const nextTier = currentTier < 5 ? currentTier + 1 : 5;
  const currentDistance = profile.stats.totalDistance;
  const currentRequirement = TIER_REQUIREMENTS[currentTier as keyof typeof TIER_REQUIREMENTS];
  const nextTierRequirement = TIER_REQUIREMENTS[nextTier as keyof typeof TIER_REQUIREMENTS];
  
  // Calculate progress within current tier
  const progress = nextTier <= 5 && currentTier < 5
    ? ((currentDistance - currentRequirement) / (nextTierRequirement - currentRequirement)) * 100
    : 100;
  
  const tierGradient = TIER_COLORS[currentTier as keyof typeof TIER_COLORS];
  const isMaxTier = currentTier >= 5;

  return (
    <div className="mx-6 mb-6 rounded-2xl bg-white p-6 shadow-sm">
      {/* Tier Badge */}
      <div className="mb-4 flex justify-center">
        <div className="relative">
          <div className={`flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br ${tierGradient} shadow-lg`}>
            <span className="text-5xl font-black text-white">{currentTier}</span>
          </div>
        </div>
      </div>

      {/* Tier Title */}
      <h3 className={`mb-4 text-center text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${tierGradient}`}>
        {profile.tierName} Tier
      </h3>

      {/* Progress Bar */}
      {!isMaxTier && (
        <>
          <div className="mb-2">
            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${tierGradient} transition-all duration-500`}
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              />
            </div>
          </div>

          {/* Distance Text */}
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-900">{currentDistance.toFixed(1)} km</span>
            <span className="text-gray-500">Next Tier • {nextTierRequirement} km</span>
          </div>
          
          <div className="mt-2 text-center text-xs text-gray-500">
            {(nextTierRequirement - currentDistance).toFixed(1)} km to {TIER_NAMES[nextTier]}
          </div>
        </>
      )}
      
      {isMaxTier && (
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900 mb-1">{currentDistance.toFixed(1)} km</p>
          <p className="text-sm text-gray-500">Max Tier Reached! 🎉</p>
        </div>
      )}
    </div>
  );
}
