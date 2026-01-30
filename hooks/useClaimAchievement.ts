import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { requestClaimAchievementSignature } from '@/lib/api';
import { CONTRACTS, ABIS } from '@/lib/contracts';

export function useClaimAchievement() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claimAchievement = async (
    eventId: string,
    tier: number,
    metadataHash: string
  ) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Request signature dari backend
      console.log('Requesting claim signature from backend...');
      const { signature, deadline } = await requestClaimAchievementSignature({
        userAddress: address,
        eventId,
        tier,
        metadataHash,
      });

      console.log('Signature received:', signature);
      console.log('Deadline:', deadline);

      // 2. Call smart contract dengan signature
      console.log('Calling claim on contract...');
      const hash = await writeContractAsync({
        address: CONTRACTS.AchievementNFT,
        abi: ABIS.AchievementNFT,
        functionName: 'claim',
        args: [address, eventId, tier, metadataHash, BigInt(deadline), signature],
      });

      console.log('Transaction hash:', hash);

      setIsLoading(false);
      return { success: true, hash };
    } catch (err: any) {
      console.error('Claim achievement error:', err);
      const errorMessage = err.message || 'Failed to claim achievement';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  };

  return {
    claimAchievement,
    isLoading,
    error,
  };
}
