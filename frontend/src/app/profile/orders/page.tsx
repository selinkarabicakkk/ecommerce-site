'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';
import { useAppSelector } from '@/store';
import { orderService } from '@/services';
import { Order } from '@/types';

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sipariş listesini yükle
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/profile/orders');
      } else {
        const fetchOrders = async () => {
          try {
            const response = await orderService.getUserOrders();
            if (response.success && response.data) {
              setOrders(response.data);
            }
          } catch (err: any) {
            console.error('Siparişler yüklenirken hata:', err);
            setError('Siparişler yüklenirken bir hata oluştu');
          } finally {
            setIsLoading(false);
          }
        };
        
        fetchOrders();
      }
    }
  }, [isAuthenticated, loading, router]);

  // Sipariş durumu için renk ve etiket
  const getOrderStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Beklemede' };
      case 'processing':
        return { color: 'bg-blue-100 text-blue-800', label: 'İşleniyor' };
      case 'shipped':
        return { color: 'bg-indigo-100 text-indigo-800', label: 'Kargoda' };
      case 'delivered':
        return { color: 'bg-green-100 text-green-800', label: 'Teslim Edildi' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800', label: 'İptal Edildi' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: 'Bilinmiyor' };
    }
  };

  // Tarih formatı
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Yükleniyor durumu
  if (loading) {
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

  // Kullanıcı giriş yapmamışsa
  if (!isAuthenticated || !user) {
    return null; // Router zaten yönlendirme yapacak
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Hesabım</h1>
          
          {/* Profil navigasyonu */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <Link href="/profile" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">
                Profil Bilgilerim
              </Link>
              <Link href="/profile/addresses" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">
                Adreslerim
              </Link>
              <Link href="/profile/orders" className="px-4 py-2 bg-primary text-white rounded-md">
                Siparişlerim
              </Link>
              <Link href="/wishlist" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">
                İstek Listem
              </Link>
            </div>
          </div>
          
          {/* Hata mesajı */}
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          {/* Sipariş listesi */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium mb-6">Siparişlerim</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500 mb-4">Henüz hiç siparişiniz bulunmuyor.</p>
                <Link href="/products" className="text-primary hover:underline">
                  Alışverişe Başla
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order._id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Sipariş başlığı */}
                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <div>
                          <p className="text-sm text-gray-500">Sipariş No: <span className="font-medium text-gray-700">{order._id}</span></p>
                          <p className="text-sm text-gray-500">Tarih: <span className="font-medium text-gray-700">{formatDate(order.createdAt)}</span></p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusInfo(order.status).color}`}>
                            {getOrderStatusInfo(order.status).label}
                          </span>
                          <Link href={`/profile/orders/${order._id}`} className="text-primary hover:underline text-sm">
                            Detayları Görüntüle
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    {/* Sipariş ürünleri */}
                    <div className="p-4">
                      <div className="space-y-4">
                        {order.orderItems.slice(0, 2).map((item, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className="w-16 h-16 relative flex-shrink-0">
                              <Image
                                src={typeof item.image === 'string' ? item.image : '/placeholder.png'}
                                alt={item.name}
                                fill
                                sizes="64px"
                                className="object-cover rounded-md"
                              />
                            </div>
                            <div className="flex-grow">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">
                                {item.quantity} adet x {item.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {/* Daha fazla ürün varsa */}
                        {order.orderItems.length > 2 && (
                          <p className="text-sm text-gray-500">
                            + {order.orderItems.length - 2} ürün daha
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Sipariş toplamı */}
                    <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Toplam Tutar:</p>
                        <p className="font-bold text-lg">
                          {order.totalPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </p>
                      </div>
                      {order.status === 'delivered' && (
                        <Link
                          href={`/products/${typeof order.orderItems[0].product === 'string' 
                            ? order.orderItems[0].product 
                            : order.orderItems[0].product._id}/review`}
                          className="px-4 py-2 bg-primary text-white rounded-md text-sm"
                        >
                          Değerlendirme Yap
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}