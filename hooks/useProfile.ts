'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address, formatUnits } from 'viem';
import { CONTRACTS, ABIS, TIER_NAMES } from '@/lib/contracts';
import { useEffect } from 'react';

export function useProfile(address?: Address) {
  // Check if user has profile
  const { data: hasProfile, isLoading: isCheckingProfile, refetch: refetchHasProfile } = useReadContract({
    address: CONTRACTS.ProfileNFT,
    abi: ABIS.ProfileNFT,
    functionName: 'hasProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Alternative check using balanceOf (ERC721 standard)
  const { data: tokenBalance } = useReadContract({
    address: CONTRACTS.ProfileNFT,
    abi: [
      {
        "type": "function",
        "name": "balanceOf",
        "inputs": [{"name": "owner", "type": "address", "internalType": "address"}],
        "outputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
        "stateMutability": "view"
      }
    ],
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Use balanceOf as fallback if hasProfile doesn't work
  const hasProfileFallback = tokenBalance !== undefined && tokenBalance > 0n;

  // Log hasProfile status for debugging
  useEffect(() => {
    if (address) {
      console.log('=== Profile Check ===');
      console.log('User address:', address);
      console.log('Contract address:', CONTRACTS.ProfileNFT);
      console.log('Has profile (from hasProfile):', hasProfile);
      console.log('Token balance (from balanceOf):', tokenBalance?.toString());
      console.log('Has profile (fallback):', hasProfileFallback);
      console.log('Is checking:', isCheckingProfile);
      
      // More detailed check
      if (hasProfile === true) {
        console.log('✅ USER HAS PROFILE (hasProfile)!');
      } else if (hasProfile === false) {
        console.log('❌ USER DOES NOT HAVE PROFILE (hasProfile)');
      } else if (hasProfile === undefined) {
        console.log('⏳ hasProfile STILL LOADING...');
      }

      if (hasProfileFallback) {
        console.log('✅ USER HAS PROFILE (balanceOf fallback)!');
      } else {
        console.log('❌ USER DOES NOT HAVE PROFILE (balanceOf fallback)');
      }
    }
  }, [address, hasProfile, tokenBalance, hasProfileFallback, isCheckingProfile]);

  // Get profile data
  const { data: profileData, isLoading: isLoadingProfile, refetch: refetchProfile, error: profileError } = useReadContract({
    address: CONTRACTS.ProfileNFT,
    abi: ABIS.ProfileNFT,
    functionName: 'getProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && (hasProfile === true || hasProfileFallback),
    },
  });

  // Log profile fetch errors
  useEffect(() => {
    if (profileError) {
      console.error('=== Profile Fetch Error ===');
      console.error('Error:', profileError);
      console.error('This means getProfile() function has ABI mismatch');
      console.error('Profile exists but cannot fetch data');
    }
  }, [profileError]);

  // Register profile
  const { 
    writeContract: register, 
    data: registerHash,
    isPending: isRegistering,
    error: registerError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: registerHash,
  });

  // Log transaction status
  useEffect(() => {
    if (registerHash) {
      console.log('=== Transaction Status ===');
      console.log('Transaction hash:', registerHash);
      console.log('Is confirming:', isConfirming);
      console.log('Is confirmed:', isConfirmed);
      console.log('BaseScan:', `https://basescan.org/tx/${registerHash}`);
    }
  }, [registerHash, isConfirming, isConfirmed]);

  // Log errors
  useEffect(() => {
    if (registerError) {
      console.error('=== Registration Error ===');
      console.error('Error:', registerError);
      console.error('Message:', registerError.message);
    }
  }, [registerError]);

  const registerProfile = async () => {
    try {
      console.log('=== Starting Registration ===');
      console.log('Contract address:', CONTRACTS.ProfileNFT);
      console.log('User address:', address);
      console.log('Current hasProfile:', hasProfile);
      console.log('Current hasProfileFallback:', hasProfileFallback);
      
      if (hasProfile || hasProfileFallback) {
        console.warn('User already has profile! Skipping registration.');
        return;
      }
      
      register({
        address: CONTRACTS.ProfileNFT,
        abi: ABIS.ProfileNFT,
        functionName: 'register',
      });
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  // Format profile data
  const profile = profileData ? {
    tier: Number(profileData.tier),
    tierName: TIER_NAMES[Number(profileData.tier) as keyof typeof TIER_NAMES],
    stats: {
      totalDistance: Number(formatUnits(profileData.stats.totalDistance, 3)), // meters to km
      totalActivities: Number(profileData.stats.totalActivities),
      totalDuration: Number(profileData.stats.totalDuration), // seconds
      currentStreak: Number(profileData.stats.currentStreak),
      longestStreak: Number(profileData.stats.longestStreak),
      lastActivityTimestamp: Number(profileData.stats.lastActivityTimestamp),
    },
    registeredAt: Number(profileData.registeredAt),
    tokenId: profileData.tokenId,
  } : null;

  // Use fallback if hasProfile doesn't work OR if balanceOf works
  // Priority: hasProfile === true OR hasProfileFallback === true
  const finalHasProfile = hasProfile === true || hasProfileFallback === true;

  useEffect(() => {
    console.log('=== Final Decision ===');
    console.log('hasProfile:', hasProfile);
    console.log('hasProfileFallback:', hasProfileFallback);
    console.log('finalHasProfile:', finalHasProfile);
  }, [hasProfile, hasProfileFallback, finalHasProfile]);

  // If hasProfile is true but profile data is null, create dummy profile
  const finalProfile = profile || (finalHasProfile ? {
    tier: 1,
    tierName: 'Bronze' as const,
    stats: {
      totalDistance: 0,
      totalActivities: 0,
      totalDuration: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityTimestamp: 0,
    },
    registeredAt: Date.now() / 1000,
    tokenId: 0n,
  } : null);

  // Log profile data
  useEffect(() => {
    if (finalProfile) {
      console.log('=== Profile Data ===');
      console.log('Tier:', finalProfile.tier, '-', finalProfile.tierName);
      console.log('Total Distance:', finalProfile.stats.totalDistance, 'km');
      console.log('Total Activities:', finalProfile.stats.totalActivities);
      if (finalProfile.tokenId) {
        console.log('Token ID:', finalProfile.tokenId.toString());
      }
      if (!profileData && finalHasProfile) {
        console.warn('⚠️ Using dummy profile data because getProfile() failed');
        console.warn('⚠️ This is due to ABI mismatch - need real ABI from Foundry');
      }
    }
  }, [finalProfile, profileData, finalHasProfile]);

  return {
    hasProfile: finalHasProfile,
    profile: finalProfile,
    isLoading: isCheckingProfile || isLoadingProfile,
    registerProfile,
    isRegistering: isRegistering || isConfirming,
    isConfirmed,
    registerError,
    tokenBalance,
    hasProfileFallback,
    refetch: () => {
      console.log('=== Refetching Profile ===');
      refetchHasProfile();
      refetchProfile();
    },
  };
}
