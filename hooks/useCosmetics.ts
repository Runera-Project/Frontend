'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { useAccount } from 'wagmi';
import { CONTRACTS, ABIS, RARITY_COLORS } from '@/lib/contracts';
import { useState, useEffect } from 'react';

// Category enum matching smart contract
export enum CosmeticCategory {
  FRAME = 0,
  BACKGROUND = 1,
  TITLE = 2,
  BADGE = 3,
}

// Rarity enum matching smart contract
export enum CosmeticRarity {
  COMMON = 0,
  RARE = 1,
  EPIC = 2,
  LEGENDARY = 3,
}

export interface CosmeticItem {
  itemId: number;
  name: string;
  category: CosmeticCategory;
  rarity: CosmeticRarity;
  // Frontend fields
  owned: boolean;
  equipped: boolean;
  gradient: string;
  price?: string; // For marketplace
  // Contract fields
  maxSupply?: number;
  currentSupply?: number;
  minTierRequired?: number;
}

export function useCosmetics() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [cosmetics, setCosmetics] = useState<CosmeticItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get equipped items for each category
  const { data: equippedFrame } = useReadContract({
    address: CONTRACTS.CosmeticNFT,
    abi: ABIS.CosmeticNFT,
    functionName: 'getEquipped',
    args: address ? [address, CosmeticCategory.FRAME] : undefined,
  });

  const { data: equippedBackground } = useReadContract({
    address: CONTRACTS.CosmeticNFT,
    abi: ABIS.CosmeticNFT,
    functionName: 'getEquipped',
    args: address ? [address, CosmeticCategory.BACKGROUND] : undefined,
  });

  const { data: equippedTitle } = useReadContract({
    address: CONTRACTS.CosmeticNFT,
    abi: ABIS.CosmeticNFT,
    functionName: 'getEquipped',
    args: address ? [address, CosmeticCategory.TITLE] : undefined,
  });

  const { data: equippedBadge } = useReadContract({
    address: CONTRACTS.CosmeticNFT,
    abi: ABIS.CosmeticNFT,
    functionName: 'getEquipped',
    args: address ? [address, CosmeticCategory.BADGE] : undefined,
  });

  // Equip item
  const { writeContract: equipItem, data: equipHash } = useWriteContract();
  const { isLoading: isEquipping, isSuccess: equipSuccess } = useWaitForTransactionReceipt({
    hash: equipHash,
  });

  // Unequip item
  const { writeContract: unequipItem, data: unequipHash } = useWriteContract();
  const { isLoading: isUnequipping, isSuccess: unequipSuccess } = useWaitForTransactionReceipt({
    hash: unequipHash,
  });

  useEffect(() => {
    async function fetchCosmetics() {
      // Cek apakah contract address valid
      if (!CONTRACTS.CosmeticNFT || CONTRACTS.CosmeticNFT === '0x0000000000000000000000000000000000000000') {
        console.warn('CosmeticNFT contract address not configured, using dummy data');
        setCosmetics(getDummyCosmetics());
        setIsLoading(false);
        return;
      }

      if (!publicClient) {
        console.warn('Public client not available, using dummy data');
        setCosmetics(getDummyCosmetics());
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Item IDs yang ada di contract (bisa didapat dari backend atau hardcode dulu)
      // Untuk MVP, kita coba fetch item 1-10
      const ITEM_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const items: CosmeticItem[] = [];

      for (const itemId of ITEM_IDS) {
        try {
          // 1. Cek apakah item exists
          const exists = await publicClient.readContract({
            address: CONTRACTS.CosmeticNFT,
            abi: ABIS.CosmeticNFT,
            functionName: 'itemExists',
            args: [BigInt(itemId)],
          }) as boolean;

          if (!exists) continue;

          // 2. Ambil data item dari contract
          const itemData = await publicClient.readContract({
            address: CONTRACTS.CosmeticNFT,
            abi: ABIS.CosmeticNFT,
            functionName: 'getItem',
            args: [BigInt(itemId)],
          }) as any;

          if (!itemData.exists) continue;

          // 3. Cek kepemilikan user (jika ada address)
          let owned = false;
          if (address) {
            const balance = await publicClient.readContract({
              address: CONTRACTS.CosmeticNFT,
              abi: ABIS.CosmeticNFT,
              functionName: 'balanceOf',
              args: [address, BigInt(itemId)],
            }) as bigint;
            owned = balance > BigInt(0);
          }

          // 4. Cek apakah item ini sedang di-equip
          const equipped = 
            (itemData.category === CosmeticCategory.FRAME && equippedFrame === BigInt(itemId)) ||
            (itemData.category === CosmeticCategory.BACKGROUND && equippedBackground === BigInt(itemId)) ||
            (itemData.category === CosmeticCategory.TITLE && equippedTitle === BigInt(itemId)) ||
            (itemData.category === CosmeticCategory.BADGE && equippedBadge === BigInt(itemId));

          // 5. Generate gradient berdasarkan rarity
          const gradient = RARITY_COLORS[itemData.rarity as keyof typeof RARITY_COLORS] || 'from-gray-400 to-gray-600';

          items.push({
            itemId,
            name: itemData.name,
            category: itemData.category,
            rarity: itemData.rarity,
            owned,
            equipped,
            gradient,
            maxSupply: Number(itemData.maxSupply),
            currentSupply: Number(itemData.currentSupply),
            minTierRequired: itemData.minTierRequired,
          });
        } catch (error) {
          console.error(`Error fetching item ${itemId}:`, error);
          // Skip item jika error
        }
      }

      // Jika tidak ada item dari contract, gunakan dummy data sebagai fallback
      if (items.length === 0) {
        console.warn('No items found from contract, using dummy data');
        setCosmetics(getDummyCosmetics());
      } else {
        console.log(`✅ Loaded ${items.length} cosmetic items from contract`);
        setCosmetics(items);
      }

      setIsLoading(false);
    }

    fetchCosmetics();
  }, [address, equippedFrame, equippedBackground, equippedTitle, equippedBadge, publicClient]);

  // Helper function untuk dummy data
  const getDummyCosmetics = (): CosmeticItem[] => {
    return [
      {
        itemId: 1,
        name: 'Spacy Warp',
        category: CosmeticCategory.BACKGROUND,
        rarity: CosmeticRarity.EPIC,
        owned: true,
        equipped: equippedBackground === BigInt(1),
        gradient: 'from-purple-900 via-blue-900 to-black',
      },
      {
        itemId: 2,
        name: 'Blurry Sunny',
        category: CosmeticCategory.BACKGROUND,
        rarity: CosmeticRarity.RARE,
        owned: true,
        equipped: equippedBackground === BigInt(2),
        gradient: 'from-orange-300 via-pink-300 to-purple-300',
      },
      {
        itemId: 3,
        name: 'Ocean Wave',
        category: CosmeticCategory.BACKGROUND,
        rarity: CosmeticRarity.RARE,
        owned: true,
        equipped: equippedBackground === BigInt(3),
        gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
      },
      {
        itemId: 4,
        name: 'Sunset Glow',
        category: CosmeticCategory.BACKGROUND,
        rarity: CosmeticRarity.EPIC,
        owned: true,
        equipped: equippedBackground === BigInt(4),
        gradient: 'from-yellow-400 via-orange-500 to-red-600',
      },
    ];
  };

  const handleEquip = async (category: CosmeticCategory, itemId: number) => {
    if (!address) return;

    try {
      await equipItem({
        address: CONTRACTS.CosmeticNFT,
        abi: ABIS.CosmeticNFT,
        functionName: 'equipItem',
        args: [category, BigInt(itemId)],
      });
    } catch (error) {
      console.error('Error equipping item:', error);
      alert('Failed to equip item. Make sure you own it!');
    }
  };

  const handleUnequip = async (category: CosmeticCategory) => {
    if (!address) return;

    try {
      await unequipItem({
        address: CONTRACTS.CosmeticNFT,
        abi: ABIS.CosmeticNFT,
        functionName: 'unequipItem',
        args: [category],
      });
    } catch (error) {
      console.error('Error unequipping item:', error);
      alert('Failed to unequip item.');
    }
  };

  // Filter helpers
  const getByCategory = (category: CosmeticCategory) => {
    return cosmetics.filter(item => item.category === category);
  };

  const getOwned = () => {
    return cosmetics.filter(item => item.owned);
  };

  const getStore = () => {
    return cosmetics.filter(item => !item.owned);
  };

  const getEquipped = () => {
    return cosmetics.filter(item => item.equipped);
  };

  return {
    cosmetics,
    isLoading,
    isEquipping,
    isUnequipping,
    equipSuccess,
    unequipSuccess,
    equippedFrame: equippedFrame ? Number(equippedFrame) : 0,
    equippedBackground: equippedBackground ? Number(equippedBackground) : 0,
    equippedTitle: equippedTitle ? Number(equippedTitle) : 0,
    equippedBadge: equippedBadge ? Number(equippedBadge) : 0,
    handleEquip,
    handleUnequip,
    getByCategory,
    getOwned,
    getStore,
    getEquipped,
  };
}
