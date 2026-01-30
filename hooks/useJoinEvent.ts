import { useState } from 'react';
import { useAccount } from 'wagmi';
import { joinEvent } from '@/lib/api';

export function useJoinEvent() {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const join = async (eventId: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Joining event:', eventId);
      
      // Try to join via backend
      try {
        const result = await joinEvent({
          userAddress: address,
          eventId,
        });
        console.log('Join event result:', result);
        setIsLoading(false);
        return result;
      } catch (backendError: any) {
        console.warn('Backend not available, saving locally:', backendError.message);
        
        // Fallback: Save to localStorage
        const joinedEvents = JSON.parse(localStorage.getItem('runera_joined_events') || '[]');
        if (!joinedEvents.includes(eventId)) {
          joinedEvents.push(eventId);
          localStorage.setItem('runera_joined_events', JSON.stringify(joinedEvents));
        }
        
        setIsLoading(false);
        return {
          success: true,
          message: 'Joined event locally (backend unavailable)',
          eventId,
        };
      }
    } catch (err: any) {
      console.error('Join event error:', err);
      const errorMessage = err.message || 'Failed to join event';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  };

  return {
    join,
    isLoading,
    error,
  };
}
