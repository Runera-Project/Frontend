'use client';

import { useAccount } from 'wagmi';
import Header from '@/components/Header';
import QuestCard from '@/components/QuestCard';
import BottomNavigation from '@/components/BottomNavigation';
import AuthGuard from '@/components/AuthGuard';
import { ProfileRegistration } from '@/components/ProfileRegistration';
import { DebugProfile } from '@/components/DebugProfile';

export default function Home() {
  const { address } = useAccount();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#f5f7fa]">
        <div className="mx-auto max-w-md pb-28">
          <Header />
          <QuestCard />
        </div>
        <BottomNavigation activeTab="Home" />
        
        {/* Show profile registration modal if needed */}
        {address && <ProfileRegistration />}
        
        {/* Debug Panel */}
        <DebugProfile />
      </div>
    </AuthGuard>
  );
}
