'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store';

// Örnek sipariş verileri (normalde API'den gelecek)
const mockOrders = [
  {
    _id: 'ord-123456',
    createdAt: '2023-06-15T10:30:00Z',
    totalPrice: 1299.99,
    status: 'delivered',
    orderItems: [
      {
        _id: 'item-1',
        name: 'Akıllı Telefon X',
        price: 999.99,
        quantity: 1,
        image: '/images/products/smartphone.jpg',
      },
      {
        _id: 'item-2',
        name: 'Telefon Kılıfı',
        price: 149.99,
        quantity: 2,
        image: '/images/products/case.jpg',
      },
    ],
  },
  {
    _id: 'ord-789012',
    createdAt: '2023-06-10T14:20:00Z',
    totalPrice: 2499.99,
    status: 'shipped',
    orderItems: [
      {
        _id: 'item-3',
        name: 'Laptop Pro',
        price: 2499.99,
        quantity: 1,
        image: '/images/products/laptop.jpg',
      },
    ],
  },
  {
    _id: 'ord-345678',
    createdAt: '2023-06-05T09:15:00Z',
    totalPrice: 899.97,
    status: 'processing',
    orderItems: [
      {
        _id: 'item-4',
        name: 'Kablosuz Kulaklık',
        price: 299.99,
        quantity: 3,
        image: '/images/products/headphones.jpg',
      },
    ],
  },
];

// Sipariş durumu için renk ve etiketler
const orderStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'İşleniyor', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Kargoya Verildi', color: 'bg-indigo-100 text-indigo-800' },
  delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Kullanıcı giriş yapmamışsa giriş sayfasına yönlendir
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/profile/orders');
    }
  }, [isAuthenticated, loading, router]);

  // Tarihi formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Sipariş detayını göster/gizle
  const toggleOrderDetails = (orderId: string) => {
    if (selectedOrder === orderId) {
      setSelectedOrder(null);
    } else {
      setSelectedOrder(orderId);
    }
  };

  // Yükleniyor durumu
  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/profile" className="text-primary hover:text-primary/80 mr-2">
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold">Siparişlerim</h1>
        </div>

        {orders.length === 0 ? (
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Henüz siparişiniz yok</h2>
            <p className="text-gray-500 mb-6">
              Henüz hiç sipariş vermediniz. Alışverişe başlamak için ürünleri keşfedin.
            </p>
            <Link href="/products">
              <Button>Alışverişe Başla</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div
                  className="p-4 border-b cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleOrderDetails(order._id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <p className="font-medium">Sipariş #{order._id}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center mt-2 sm:mt-0">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          orderStatusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {orderStatusConfig[order.status]?.label || order.status}
                      </span>
                      <span className="ml-4 font-medium">
                        {order.totalPrice.toLocaleString('tr-TR')} ₺
                      </span>
                      <svg
                        className={`ml-2 h-5 w-5 transition-transform ${
                          selectedOrder === order._id ? 'transform rotate-180' : ''
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {selectedOrder === order._id && (
                  <div className="p-4 bg-gray-50">
                    <h3 className="font-medium mb-3">Sipariş Detayları</h3>
                    <div className="space-y-4">
                      {order.orderItems.map((item) => (
                        <div key={item._id} className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0 mr-4 bg-gray-200 rounded">
                            <div className="relative h-16 w-16">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="64px"
                                className="object-cover rounded"
                              />
                            </div>
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-500">
                              {item.quantity} x {item.price.toLocaleString('tr-TR')} ₺
                            </p>
                          </div>
                          <div className="font-medium">
                            {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between">
                        <span className="font-medium">Toplam</span>
                        <span className="font-medium">
                          {order.totalPrice.toLocaleString('tr-TR')} ₺
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        Sipariş Detayları
                      </Button>
                      <Button size="sm">Yardım Al</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}