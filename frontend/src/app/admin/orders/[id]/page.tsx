'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store';

// Sipariş tipi
interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    updateTime: string;
    emailAddress?: string;
  };
  items: {
    product: {
      _id: string;
      name: string;
      price: number;
      image?: string;
      sku: string;
    };
    quantity: number;
    price: number;
  }[];
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = params;
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Örnek veri (normalde API'den gelecek)
  const mockOrder: Order = {
    _id: id,
    orderNumber: 'ORD-123456',
    user: {
      _id: 'user1',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      email: 'ahmet@example.com',
      phoneNumber: '555-123-4567',
    },
    shippingAddress: {
      street: 'Atatürk Cad. No:123',
      city: 'İstanbul',
      state: 'İstanbul',
      zipCode: '34000',
      country: 'Türkiye',
    },
    billingAddress: {
      street: 'Atatürk Cad. No:123',
      city: 'İstanbul',
      state: 'İstanbul',
      zipCode: '34000',
      country: 'Türkiye',
    },
    paymentMethod: 'Kredi Kartı',
    paymentResult: {
      id: 'pay_123456',
      status: 'completed',
      updateTime: '2023-06-20T10:35:00Z',
      emailAddress: 'ahmet@example.com',
    },
    items: [
      {
        product: {
          _id: 'prod1',
          name: 'Akıllı Telefon',
          price: 999.99,
          image: 'phone.jpg',
          sku: 'SKU-123',
        },
        quantity: 1,
        price: 999.99,
      },
      {
        product: {
          _id: 'prod2',
          name: 'Telefon Kılıfı',
          price: 49.99,
          image: 'case.jpg',
          sku: 'SKU-456',
        },
        quantity: 1,
        price: 49.99,
      },
      {
        product: {
          _id: 'prod3',
          name: 'Ekran Koruyucu',
          price: 29.99,
          image: 'screen-protector.jpg',
          sku: 'SKU-789',
        },
        quantity: 2,
        price: 59.98,
      },
    ],
    taxPrice: 110.99,
    shippingPrice: 15.00,
    totalPrice: 1235.96,
    status: 'shipped',
    isPaid: true,
    paidAt: '2023-06-20T10:35:00Z',
    isDelivered: false,
    trackingNumber: 'TRK-987654',
    createdAt: '2023-06-20T10:30:00Z',
    updatedAt: '2023-06-21T08:45:00Z',
  };

  // Sipariş verilerini getir
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        
        // Burada normalde API çağrısı olacak
        // const response = await orderService.getOrderById(id);
        
        // Mock veri kullan
        setTimeout(() => {
          setOrder(mockOrder);
          setTrackingNumber(mockOrder.trackingNumber || '');
          setIsLoading(false);
        }, 500);
      } catch (err) {
        setError('Sipariş bilgileri yüklenirken bir hata oluştu.');
        console.error('Sipariş yükleme hatası:', err);
        setIsLoading(false);
      }
    };

    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/admin/orders');
      } else if (user?.role !== 'admin') {
        router.push('/');
      } else {
        fetchOrder();
      }
    }
  }, [id, isAuthenticated, loading, router, user]);

  // Tarihi formatla
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Sipariş durumu güncelleme
  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      
      // Burada normalde API çağrısı olacak
      // await orderService.updateOrderStatus(id, newStatus);
      
      // Mock veri güncelle
      setTimeout(() => {
        setOrder((prevOrder) =>
          prevOrder ? { ...prevOrder, status: newStatus as any } : null
        );
        setIsUpdating(false);
      }, 500);
    } catch (err) {
      setError('Sipariş durumu güncellenirken bir hata oluştu.');
      console.error('Sipariş güncelleme hatası:', err);
      setIsUpdating(false);
    }
  };

  // Takip numarası güncelleme
  const handleUpdateTrackingNumber = async () => {
    try {
      setIsUpdating(true);
      
      // Burada normalde API çağrısı olacak
      // await orderService.updateTrackingNumber(id, trackingNumber);
      
      // Mock veri güncelle
      setTimeout(() => {
        setOrder((prevOrder) =>
          prevOrder ? { ...prevOrder, trackingNumber } : null
        );
        setIsUpdating(false);
      }, 500);
    } catch (err) {
      setError('Takip numarası güncellenirken bir hata oluştu.');
      console.error('Takip numarası güncelleme hatası:', err);
      setIsUpdating(false);
    }
  };

  // Teslimat durumu güncelleme
  const handleToggleDeliveryStatus = async () => {
    if (!order) return;
    
    try {
      setIsUpdating(true);
      
      const newDeliveryStatus = !order.isDelivered;
      const deliveredAt = newDeliveryStatus ? new Date().toISOString() : undefined;
      
      // Burada normalde API çağrısı olacak
      // await orderService.updateDeliveryStatus(id, newDeliveryStatus);
      
      // Mock veri güncelle
      setTimeout(() => {
        setOrder((prevOrder) =>
          prevOrder
            ? {
                ...prevOrder,
                isDelivered: newDeliveryStatus,
                deliveredAt,
                status: newDeliveryStatus ? 'delivered' : 'shipped',
              }
            : null
        );
        setIsUpdating(false);
      }, 500);
    } catch (err) {
      setError('Teslimat durumu güncellenirken bir hata oluştu.');
      console.error('Teslimat durumu güncelleme hatası:', err);
      setIsUpdating(false);
    }
  };

  // Sipariş durumu için renk ve etiketler
  const orderStatusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
    processing: { label: 'İşleniyor', color: 'bg-blue-100 text-blue-800' },
    shipped: { label: 'Kargoya Verildi', color: 'bg-indigo-100 text-indigo-800' },
    delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
  };

  // Yükleniyor durumu
  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Sipariş yüklenirken
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Sipariş Detayları</h1>
            <Button variant="outline" onClick={() => router.back()}>
              Geri Dön
            </Button>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Sipariş bulunamadı
  if (!order) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Sipariş Detayları</h1>
            <Button variant="outline" onClick={() => router.back()}>
              Geri Dön
            </Button>
          </div>
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            Sipariş bulunamadı.
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Sipariş #{order.orderNumber}
          </h1>
          <Button variant="outline" onClick={() => router.back()}>
            Geri Dön
          </Button>
        </div>

        {/* Hata mesajı */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Sipariş özeti */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Sipariş bilgileri */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium mb-4">Sipariş Bilgileri</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Sipariş No:</span>
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tarih:</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Müşteri:</span>
                <Link
                  href={`/admin/customers/${order.user._id}`}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  {order.user.firstName} {order.user.lastName}
                </Link>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">E-posta:</span>
                <span>{order.user.email}</span>
              </div>
              {order.user.phoneNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Telefon:</span>
                  <span>{order.user.phoneNumber}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-600">Durum:</span>
                <select
                  value={order.status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  disabled={isUpdating}
                  className={`text-sm rounded-full px-3 py-1 border ${
                    orderStatusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <option value="pending">Beklemede</option>
                  <option value="processing">İşleniyor</option>
                  <option value="shipped">Kargoya Verildi</option>
                  <option value="delivered">Teslim Edildi</option>
                  <option value="cancelled">İptal Edildi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ödeme bilgileri */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium mb-4">Ödeme Bilgileri</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Ödeme Yöntemi:</span>
                <span>{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ödeme Durumu:</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.isPaid
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {order.isPaid ? 'Ödendi' : 'Bekliyor'}
                </span>
              </div>
              {order.isPaid && order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Ödeme Tarihi:</span>
                  <span>{formatDate(order.paidAt)}</span>
                </div>
              )}
              {order.paymentResult && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">İşlem ID:</span>
                    <span>{order.paymentResult.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">İşlem Durumu:</span>
                    <span>{order.paymentResult.status}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Kargo bilgileri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Teslimat adresi */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium mb-4">Teslimat Adresi</h2>
            <div className="space-y-1">
              <p>
                {order.shippingAddress.street}
              </p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Teslimat Durumu:</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.isDelivered
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {order.isDelivered ? 'Teslim Edildi' : 'Teslim Edilmedi'}
                </span>
              </div>
              {order.isDelivered && order.deliveredAt && (
                <div className="flex justify-between mt-2">
                  <span className="text-gray-600">Teslim Tarihi:</span>
                  <span>{formatDate(order.deliveredAt)}</span>
                </div>
              )}
              <div className="mt-4">
                <Button
                  onClick={handleToggleDeliveryStatus}
                  disabled={isUpdating}
                  variant={order.isDelivered ? 'destructive' : 'default'}
                >
                  {isUpdating ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                      Güncelleniyor...
                    </div>
                  ) : order.isDelivered ? (
                    'Teslim Edilmedi Olarak İşaretle'
                  ) : (
                    'Teslim Edildi Olarak İşaretle'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Fatura adresi ve kargo takibi */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium mb-4">Fatura Adresi</h2>
            <div className="space-y-1">
              <p>
                {order.billingAddress.street}
              </p>
              <p>
                {order.billingAddress.city}, {order.billingAddress.state}{' '}
                {order.billingAddress.zipCode}
              </p>
              <p>{order.billingAddress.country}</p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h2 className="text-lg font-medium mb-2">Kargo Takibi</h2>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Takip numarası girin"
                  className="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  onClick={handleUpdateTrackingNumber}
                  disabled={isUpdating || trackingNumber === order.trackingNumber}
                >
                  {isUpdating ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                      Güncelleniyor...
                    </div>
                  ) : (
                    'Güncelle'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sipariş ürünleri */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Sipariş Ürünleri</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ürün
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fiyat
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adet
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.product.image && (
                          <div className="h-10 w-10 bg-gray-200 rounded-md mr-3">
                            <img
                              src={`/uploads/${item.product.image}`}
                              alt={item.product.name}
                              className="h-10 w-10 object-cover rounded-md"
                            />
                          </div>
                        )}
                        <div className="font-medium text-gray-900">
                          <Link
                            href={`/admin/products/${item.product._id}`}
                            className="hover:text-indigo-600"
                          >
                            {item.product.name}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {item.price.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    Ara Toplam:
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                    {(order.totalPrice - order.taxPrice - order.shippingPrice).toLocaleString('tr-TR')} ₺
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    Vergi:
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                    {order.taxPrice.toLocaleString('tr-TR')} ₺
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    Kargo:
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                    {order.shippingPrice.toLocaleString('tr-TR')} ₺
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                    Toplam:
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                    {order.totalPrice.toLocaleString('tr-TR')} ₺
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}