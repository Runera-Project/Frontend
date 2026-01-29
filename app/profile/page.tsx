'use client';

import { useAccount } from 'wagmi';
import { useProfile } from '@/hooks/useProfile';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileIdentityCard from '@/components/profile/ProfileIdentityCard';
import RankProgressCard from '@/components/profile/RankProgressCard';
import StatsOverview from '@/components/profile/StatsOverview';
import AchievementsSection from '@/components/profile/AchievementsSection';
import BottomNavigation from '@/components/BottomNavigation';
import AuthGuard from '@/components/AuthGuard';
import { ProfileRegistration } from '@/components/ProfileRegistration';

export default function ProfilePage() {
  const { address } = useAccount();
  const { profile, isLoading } = useProfile(address);

  // TODO: Get selected banner skin from cosmetic NFT
  const selectedBannerGradient = 'from-purple-600 via-pink-500 to-red-500';

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#f5f7fa]">
        <div className="mx-auto max-w-md pb-28">
          <ProfileHeader />
          
          {isLoading ? (
            <div className="px-5 space-y-4">
              <div className="animate-pulse bg-white rounded-2xl h-48" />
              <div className="animate-pulse bg-white rounded-2xl h-32" />
              <div className="animate-pulse bg-white rounded-2xl h-48" />
            </div>
          ) : profile ? (
            <>
              <ProfileIdentityCard 
                bannerGradient={selectedBannerGradient}
                profile={profile}
              />
              <RankProgressCard profile={profile} />
              <StatsOverview profile={profile} />
              <AchievementsSection />
            </>
          ) : (
            <div className="px-5">
              <div className="bg-white rounded-2xl p-6 text-center">
                <p className="text-gray-600">No profile found</p>
              </div>
            </div>
          )}
        </div>
        <BottomNavigation activeTab="User" />
        
        {/* Show profile registration modal if needed */}
        {address && <ProfileRegistration />}
      </div>
    </AuthGuard>
  );
}
