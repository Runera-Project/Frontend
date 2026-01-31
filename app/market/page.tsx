'use client';

import { useState } from 'react';
import MarketHeader from '@/components/market/MarketHeader';
import ProfilePreview from '@/components/market/ProfilePreview';
import PreviewTabs from '@/components/market/PreviewTabs';
import BottomNavigation from '@/components/BottomNavigation';
import { useCosmetics, CosmeticCategory } from '@/hooks/useCosmetics';
import { useMarketplace } from '@/hooks/useMarketplace';
import { Sparkles, Package, ShoppingCart, Check } from 'lucide-react';

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState('Frames');
  const { cosmetics, isLoading } = useCosmetics();
  const { handleBuyItem, getListingsByItem, isBuying } = useMarketplace();
  
  // Local state untuk preview - tidak perlu transaksi
  const [selectedFrameId, setSelectedFrameId] = useState<number | null>(null);
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<number | null>(null);
  const [selectedTitleId, setSelectedTitleId] = useState<number | null>(null);
  const [selectedBadgeId, setSelectedBadgeId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="mx-auto max-w-md pb-28">
          <MarketHeader />
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mb-4 h-14 w-14 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto" />
              <p className="text-sm font-medium text-gray-600">Loading cosmetics...</p>
            </div>
          </div>
        </div>
        <BottomNavigation activeTab="Market" />
      </div>
    );
  }

  // Filter by active tab
  const categoryMap: Record<string, CosmeticCategory> = {
    'Frames': CosmeticCategory.FRAME,
    'Backgrounds': CosmeticCategory.BACKGROUND,
    'Titles': CosmeticCategory.TITLE,
    'Badges': CosmeticCategory.BADGE,
  };

  const currentCategory = categoryMap[activeTab];
  
  // Get items for current category
  const categoryItems = cosmetics.filter(item => item.category === currentCategory);
  const ownedItems = categoryItems.filter(item => item.owned);
  const storeItems = categoryItems.filter(item => !item.owned);

  // Get current selection based on category
  const getSelectedId = () => {
    switch (currentCategory) {
      case CosmeticCategory.FRAME: return selectedFrameId;
      case CosmeticCategory.BACKGROUND: return selectedBackgroundId;
      case CosmeticCategory.TITLE: return selectedTitleId;
      case CosmeticCategory.BADGE: return selectedBadgeId;
      default: return null;
    }
  };

  // Handle USE - hanya update local state, TANPA transaksi
  const handleUseItem = (itemId: number) => {
    switch (currentCategory) {
      case CosmeticCategory.FRAME:
        setSelectedFrameId(prev => prev === itemId ? null : itemId);
        break;
      case CosmeticCategory.BACKGROUND:
        setSelectedBackgroundId(prev => prev === itemId ? null : itemId);
        break;
      case CosmeticCategory.TITLE:
        setSelectedTitleId(prev => prev === itemId ? null : itemId);
        break;
      case CosmeticCategory.BADGE:
        setSelectedBadgeId(prev => prev === itemId ? null : itemId);
        break;
    }
  };

  // Handle BUY - ini yang butuh transaksi
  const handleBuyFromStore = async (itemId: number) => {
    try {
      const listings = await getListingsByItem(itemId);
      
      if (listings.length === 0) {
        alert('Item ini belum tersedia di marketplace');
        return;
      }

      // Get cheapest listing
      const cheapestListing = listings.reduce((prev, curr) => 
        BigInt(curr.pricePerUnit) < BigInt(prev.pricePerUnit) ? curr : prev
      );

      await handleBuyItem(
        cheapestListing.listingId,
        1,
        cheapestListing.totalPrice
      );

      alert('Purchase successful! Item sekarang ada di collection kamu.');
    } catch (error) {
      console.error('Error buying item:', error);
      alert('Gagal membeli item. Pastikan kamu punya cukup ETH.');
    }
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const selectedSkin = cosmetics.find(item => item.itemId === getSelectedId());
  const selectedSkinForPreview = selectedSkin ? {
    name: selectedSkin.name,
    type: activeTab.toLowerCase().slice(0, -1),
    gradient: selectedSkin.gradient,
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-md pb-28">
        <MarketHeader />
        <ProfilePreview selectedSkin={selectedSkinForPreview} />
        <PreviewTabs activeTab={activeTab} onTabChange={handleTabChange} />
        
        <div className="px-4">
          {/* My Collection Section - Item yang sudah dimiliki */}
          {ownedItems.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                  <Package className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">My Collection</h2>
                  <p className="text-xs text-gray-500">{ownedItems.length} items • Tap to use</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {ownedItems.map((item) => (
                  <OwnedItemCard
                    key={item.itemId}
                    name={item.name}
                    rarity={['Common', 'Rare', 'Epic', 'Legendary'][item.rarity]}
                    gradient={item.gradient}
                    isUsing={getSelectedId() === item.itemId}
                    onUse={() => handleUseItem(item.itemId)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Store Section - Item yang harus dibeli */}
          {storeItems.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-md">
                  <ShoppingCart className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Store</h2>
                  <p className="text-xs text-gray-500">{storeItems.length} items for sale</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {storeItems.map((item) => (
                  <StoreItemCard
                    key={item.itemId}
                    name={item.name}
                    rarity={['Common', 'Rare', 'Epic', 'Legendary'][item.rarity]}
                    gradient={item.gradient}
                    price={item.price || '0.001 ETH'}
                    isBuying={isBuying}
                    onBuy={() => handleBuyFromStore(item.itemId)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {ownedItems.length === 0 && storeItems.length === 0 && (
            <div className="py-16 text-center">
              <div className="mb-4 mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-4xl">🎨</span>
              </div>
              <p className="text-base font-semibold text-gray-700">No {activeTab.toLowerCase()} available</p>
              <p className="text-sm text-gray-500 mt-2">Check back soon for new items!</p>
            </div>
          )}
        </div>
      </div>
      <BottomNavigation activeTab="Market" />
    </div>
  );
}

// Card untuk item yang SUDAH DIMILIKI - tanpa transaksi
function OwnedItemCard({
  name,
  rarity,
  gradient,
  isUsing,
  onUse
}: {
  name: string;
  rarity: string;
  gradient: string;
  isUsing: boolean;
  onUse: () => void;
}) {
  const getRarityStyle = () => {
    switch (rarity) {
      case 'Legendary': return { bg: 'from-yellow-400 to-orange-500', text: '✨ Legendary' };
      case 'Epic': return { bg: 'from-purple-500 to-pink-500', text: '💎 Epic' };
      case 'Rare': return { bg: 'from-blue-500 to-cyan-500', text: '💫 Rare' };
      default: return { bg: 'from-gray-400 to-gray-500', text: 'Common' };
    }
  };

  const rarityStyle = getRarityStyle();

  return (
    <div 
      onClick={onUse}
      className={`cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 ${
        isUsing ? 'ring-2 ring-green-500 shadow-lg scale-[1.02]' : 'hover:shadow-md hover:scale-[1.01]'
      }`}
    >
      <div className={`relative h-28 bg-gradient-to-br ${gradient}`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)',
            backgroundSize: '16px 16px'
          }} />
        </div>

        {rarity && (
          <div className="absolute right-2 top-2">
            <div className={`rounded-full bg-gradient-to-r ${rarityStyle.bg} px-2 py-0.5 text-[10px] font-bold text-white shadow-md`}>
              {rarityStyle.text}
            </div>
          </div>
        )}

        {isUsing && (
          <div className="absolute left-2 top-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 shadow-md">
              <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
            </div>
          </div>
        )}
      </div>

      <div className="p-3">
        <h4 className="mb-2 text-sm font-bold text-gray-900 truncate">{name}</h4>
        <div
          className={`w-full rounded-xl py-2 text-xs font-semibold text-center transition-all ${
            isUsing
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          {isUsing ? '✓ Using' : 'Use'}
        </div>
      </div>
    </div>
  );
}

// Card untuk item di STORE - butuh transaksi untuk beli
function StoreItemCard({
  name,
  rarity,
  gradient,
  price,
  isBuying,
  onBuy
}: {
  name: string;
  rarity: string;
  gradient: string;
  price: string;
  isBuying: boolean;
  onBuy: () => void;
}) {
  const getRarityStyle = () => {
    switch (rarity) {
      case 'Legendary': return { bg: 'from-yellow-400 to-orange-500', text: '✨ Legendary' };
      case 'Epic': return { bg: 'from-purple-500 to-pink-500', text: '💎 Epic' };
      case 'Rare': return { bg: 'from-blue-500 to-cyan-500', text: '💫 Rare' };
      default: return { bg: 'from-gray-400 to-gray-500', text: 'Common' };
    }
  };

  const rarityStyle = getRarityStyle();

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.01]">
      <div className={`relative h-28 bg-gradient-to-br ${gradient}`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)',
            backgroundSize: '16px 16px'
          }} />
        </div>

        {rarity && (
          <div className="absolute right-2 top-2">
            <div className={`rounded-full bg-gradient-to-r ${rarityStyle.bg} px-2 py-0.5 text-[10px] font-bold text-white shadow-md`}>
              {rarityStyle.text}
            </div>
          </div>
        )}

        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
          <div className="rounded-full bg-white/95 p-2.5 shadow-lg">
            <ShoppingCart className="h-5 w-5 text-gray-600" />
          </div>
        </div>

        {/* Price tag */}
        <div className="absolute bottom-2 left-2 right-2">
          <div className="rounded-lg bg-black/60 px-2 py-1 text-center backdrop-blur-sm">
            <span className="text-xs font-bold text-white">{price}</span>
          </div>
        </div>
      </div>

      <div className="p-3">
        <h4 className="mb-2 text-sm font-bold text-gray-900 truncate">{name}</h4>
        <button
          onClick={onBuy}
          disabled={isBuying}
          className={`w-full rounded-xl py-2 text-xs font-semibold transition-all ${
            isBuying
              ? 'bg-gray-200 text-gray-500 cursor-wait'
              : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-md hover:scale-[1.02]'
          }`}
        >
          {isBuying ? '⏳ Processing...' : `🛒 Buy Now`}
        </button>
      </div>
    </div>
  );
}
