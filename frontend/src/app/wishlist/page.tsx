'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchWishlist, removeFromWishlist, clearWishlist } from '@/store/slices/wishlistSlice';
import { addToCart } from '@/store/slices/cartSlice';
import useProductTracking from '@/hooks/useProductTracking';

export default function WishlistPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { trackProductActivity } = useProductTracking();
  
  const { user, isAuthenticated, loading: authLoading } = useAppSelector((state) => state.auth);
  const { items, loading, error, totalCount } = useAppSelector((state) => state.wishlist);
  
  const [isRemoving, setIsRemoving] = useState<Record<string, boolean>>({});
  const [isAddingToCart, setIsAddingToCart] = useState<Record<string, boolean>>({});
  const [isClearingWishlist, setIsClearingWishlist] = useState(false);

  // İstek listesini yükle
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/wishlist');
      } else {
        dispatch(fetchWishlist());
      }
    }
  }, [authLoading, isAuthenticated, dispatch, router]);

  // İstek listesinden ürün kaldır
  const handleRemoveFromWishlist = async (itemId: string) => {
    setIsRemoving((prev) => ({ ...prev, [itemId]: true }));
    try {
      await dispatch(removeFromWishlist(itemId)).unwrap();
    } finally {
      setIsRemoving((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // Ürünü sepete ekle
  const handleAddToCart = async (productId: string, itemId: string) => {
    setIsAddingToCart((prev) => ({ ...prev, [itemId]: true }));
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      trackProductActivity(productId, 'cart');
      await handleRemoveFromWishlist(itemId);
    } finally {
      setIsAddingToCart((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // İstek listesini temizle
  const handleClearWishlist = async () => {
    if (window.confirm('İstek listenizi temizlemek istediğinize emin misiniz?')) {
      setIsClearingWishlist(true);
      try {
        await dispatch(clearWishlist()).unwrap();
      } finally {
        setIsClearingWishlist(false);
      }
    }
  };

  // Yükleniyor durumu
  if (authLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">İstek Listem</h1>

        {/* Hata mesajı */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* İstek listesi boş */}
        {!loading && items.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-500 mb-4">
              İstek listenizde henüz ürün bulunmuyor.
            </div>
            <Link href="/products">
              <Button>Alışverişe Başla</Button>
            </Link>
          </div>
        )}

        {/* İstek listesi yükleniyor */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {/* İstek listesi */}
        {!loading && items.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="text-gray-600">
                {totalCount} ürün bulundu
              </div>
              <Button
                variant="outline"
                onClick={handleClearWishlist}
                disabled={isClearingWishlist}
              >
                {isClearingWishlist ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-primary rounded-full"></div>
                    Temizleniyor...
                  </div>
                ) : (
                  'Listeyi Temizle'
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Link href={`/products/${item.product.slug}`}>
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      {item.product.image ? (
                        <img
                          src={`/uploads/${item.product.image}`}
                          alt={item.product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          Resim Yok
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link href={`/products/${item.product.slug}`}>
                      <h2 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">
                        {item.product.name}
                      </h2>
                    </Link>
                    <div className="text-xl font-bold text-primary mb-4">
                      {item.product.price.toLocaleString('tr-TR')} ₺
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Button
                        onClick={() => handleAddToCart(item.product._id, item._id)}
                        disabled={isAddingToCart[item._id]}
                        className="w-full"
                      >
                        {isAddingToCart[item._id] ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                            Ekleniyor...
                          </div>
                        ) : (
                          'Sepete Ekle'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRemoveFromWishlist(item._id)}
                        disabled={isRemoving[item._id]}
                        className="w-full"
                      >
                        {isRemoving[item._id] ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-primary rounded-full"></div>
                            Kaldırılıyor...
                          </div>
                        ) : (
                          'Kaldır'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}