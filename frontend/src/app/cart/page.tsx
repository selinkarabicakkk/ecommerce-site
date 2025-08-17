'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAssetUrl } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '@/store/slices/cartSlice';
import { Product } from '@/types';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, totalPrice, loading, error } = useAppSelector((state) => state.cart);
  const { isAuthenticated, loading: authLoading } = useAppSelector((state) => state.auth);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Sepeti getir / auth yoksa login'e yönlendir
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/cart');
      return;
    }
    dispatch(fetchCart());
  }, [dispatch, isAuthenticated, authLoading, router]);

  // Ürün miktarını güncelle
  const handleQuantityChange = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setIsUpdating(itemId);
    await dispatch(updateCartItem({ itemId, quantity }));
    setIsUpdating(null);
  };

  // Ürünü sepetten kaldır
  const handleRemoveItem = (itemId: string) => {
    if (window.confirm('Bu ürünü sepetten kaldırmak istediğinize emin misiniz?')) {
      dispatch(removeCartItem(itemId));
    }
  };

  // Sepeti temizle
  const handleClearCart = () => {
    if (window.confirm('Sepetinizi tamamen temizlemek istediğinize emin misiniz?')) {
      dispatch(clearCart());
    }
  };

  // Ödeme sayfasına git
  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Kullanıcı giriş yapmamışsa, giriş sayfasına yönlendir
      router.push('/auth/login?redirect=/checkout');
    } else {
      // Kullanıcı giriş yapmışsa, ödeme sayfasına yönlendir
      router.push('/checkout');
    }
  };

  // Sepet boşsa
  if (!loading && items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Alışveriş Sepeti</h1>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Sepetiniz boş</h2>
            <p className="text-gray-500 mb-6">
              Henüz sepetinize ürün eklemediniz. Alışverişe başlamak için ürünleri keşfedin.
            </p>
            <Link href="/products">
              <Button>Alışverişe Başla</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Alışveriş Sepeti</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sepet ürünleri */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Ürün
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Fiyat
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Adet
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Toplam
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">İşlemler</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => {
                      const product = (item.product as unknown as Product) || null;
                      return (
                        <tr key={item._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-16 w-16 flex-shrink-0 mr-4">
                                {product && product.images && product.images.length > 0 ? (
                                  <div className="relative h-16 w-16">
                                    <Image
                                      src={getAssetUrl(product.images[0])}
                                      alt={product.name}
                                      fill
                                      sizes="64px"
                                      className="object-cover rounded"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
                                    <span className="text-gray-500 text-xs">Görsel yok</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                {product ? (
                                  <Link
                                    href={`/products/${product.slug}`}
                                    className="text-sm font-medium text-gray-900 hover:text-primary"
                                  >
                                    {product.name}
                                  </Link>
                                ) : (
                                  <span className="text-sm font-medium text-gray-900">Ürün mevcut değil</span>
                                )}
                                {item.variantOptions && Object.keys(item.variantOptions).length > 0 && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {Object.entries(item.variantOptions).map(([key, value]) => (
                                      <span key={key} className="mr-2">
                                        {key}: {value}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.price.toLocaleString('tr-TR')} ₺
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <button
                                onClick={() =>
                                  handleQuantityChange(item._id!, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1 || isUpdating === item._id}
                                className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    item._id!,
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                disabled={isUpdating === item._id}
                                className="w-12 h-8 border-t border-b border-gray-300 text-center [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                onClick={() =>
                                  handleQuantityChange(item._id!, item.quantity + 1)
                                }
                                disabled={isUpdating === item._id}
                                className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleRemoveItem(item._id!)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between mt-6">
                <Link href="/products">
                  <Button variant="outline">Alışverişe Devam Et</Button>
                </Link>
                <Button variant="destructive" onClick={handleClearCart}>
                  Sepeti Temizle
                </Button>
              </div>
            </div>

            {/* Sipariş özeti */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Sipariş Özeti</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ara Toplam</span>
                    <span className="font-medium">{totalPrice.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">KDV (%18)</span>
                    <span className="font-medium">
                      {(totalPrice * 0.18).toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kargo</span>
                    <span className="font-medium">
                      {totalPrice >= 500 ? 'Ücretsiz' : '29.90 ₺'}
                    </span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Toplam</span>
                      <span className="text-lg font-semibold text-primary">
                        {(
                          totalPrice +
                          totalPrice * 0.18 +
                          (totalPrice >= 500 ? 0 : 29.9)
                        ).toLocaleString('tr-TR')}{' '}
                        ₺
                      </span>
                    </div>
                  </div>
                </div>
                <Button onClick={handleCheckout} size="lg" className="w-full">
                  {isAuthenticated ? 'Ödemeye Geç' : 'Giriş Yap ve Ödemeye Geç'}
                </Button>
              </div>

              {/* Kupon kodu */}
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-md font-semibold mb-3">Kupon Kodu</h3>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Kupon kodunuz"
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <Button className="rounded-l-none">Uygula</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}