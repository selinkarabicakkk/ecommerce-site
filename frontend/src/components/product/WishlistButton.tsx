'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { addToWishlist, removeFromWishlist } from '@/store/slices/wishlistSlice';
import wishlistService from '@/services/wishlistService';
import useProductTracking from '@/hooks/useProductTracking';
import { useRouter } from 'next/navigation';

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export default function WishlistButton({ productId, className = '' }: WishlistButtonProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { trackProductActivity } = useProductTracking();
  const { isAuthenticated, loading: authLoading } = useAppSelector((state) => state.auth);
  
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // İstek listesinde olup olmadığını kontrol et
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!isAuthenticated || authLoading) return;
      
      try {
        setIsChecking(true);
        const response = await wishlistService.checkInWishlist(productId);
        setInWishlist(response.inWishlist);
        if (response.itemId) {
          setWishlistItemId(response.itemId);
        }
      } catch (error) {
        console.error('İstek listesi kontrolü sırasında hata:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkWishlistStatus();
  }, [productId, isAuthenticated, authLoading]);

  // İstek listesine ekle/çıkar
  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/products/${productId}`);
      return;
    }

    setIsLoading(true);
    try {
      if (inWishlist && wishlistItemId) {
        await dispatch(removeFromWishlist(wishlistItemId)).unwrap();
        setInWishlist(false);
        setWishlistItemId(null);
      } else {
        const result = await dispatch(addToWishlist(productId)).unwrap();
        trackProductActivity(productId, 'wishlist');
        setInWishlist(true);
        
        // İstek listesi durumunu yeniden kontrol et
        const response = await wishlistService.checkInWishlist(productId);
        if (response.itemId) {
          setWishlistItemId(response.itemId);
        }
      }
    } catch (error) {
      console.error('İstek listesi işlemi sırasında hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={isLoading || isChecking}
      className={`flex items-center justify-center rounded-full p-2 transition-colors ${
        inWishlist
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className}`}
      aria-label={inWishlist ? 'İstek listesinden çıkar' : 'İstek listesine ekle'}
      title={inWishlist ? 'İstek listesinden çıkar' : 'İstek listesine ekle'}
    >
      {isLoading || isChecking ? (
        <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-current rounded-full"></div>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill={inWishlist ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          strokeWidth={inWishlist ? 0 : 1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      )}
    </button>
  );
}