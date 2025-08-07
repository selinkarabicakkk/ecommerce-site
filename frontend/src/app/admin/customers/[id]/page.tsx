'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store';
import { adminService, orderService } from '@/services';

// Kullanıcı tipi
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: 'admin' | 'customer';
  isEmailVerified: boolean;
  createdAt: string;
  addresses: {
    _id: string;
    type: 'shipping' | 'billing';
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }[];
}

// Sipariş tipi
interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  isPaid: boolean;
  paidAt?: string;
}

interface CustomerDetailPageProps {
  params: {
    id: string;
  };
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = params;
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  
  const [customer, setCustomer] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Müşteri ve sipariş verilerini getir
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const customerRes: any = await adminService.getCustomerById(id);
        setCustomer((customerRes as any)?.user || (customerRes as any)?.data || null);
        const ordersRes: any = await orderService.getOrders(1, 50);
        const list = (ordersRes?.orders || ordersRes?.data || []).filter((o: any) => o.user?._id === id || o.user === id);
        setOrders(list);
        setIsLoading(false);
      } catch (err) {
        setError('Müşteri bilgileri yüklenirken bir hata oluştu.');
        console.error('Veri yükleme hatası:', err);
        setIsLoading(false);
      }
    };

    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/admin/customers');
      } else if (user?.role !== 'admin') {
        router.push('/');
      } else {
        fetchData();
      }
    }
  }, [id, isAuthenticated, loading, router, user]);

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

  // Müşteri yüklenirken
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Müşteri Detayları</h1>
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

  // Müşteri bulunamadı
  if (!customer) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Müşteri Detayları</h1>
            <Button variant="outline" onClick={() => router.back()}>
              Geri Dön
            </Button>
          </div>
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            Müşteri bulunamadı.
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Müşteri Detayları</h1>
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

        {/* Müşteri bilgileri */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
              <span className="text-gray-600 font-medium text-xl">
                {customer.firstName.charAt(0)}
                {customer.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {customer.firstName} {customer.lastName}
              </h2>
              <p className="text-gray-500">
                {customer.role === 'admin' ? 'Yönetici' : 'Müşteri'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">İletişim Bilgileri</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">E-posta:</span> {customer.email}
                </p>
                <p>
                  <span className="font-medium">Telefon:</span>{' '}
                  {customer.phoneNumber || 'Belirtilmemiş'}
                </p>
                <p>
                  <span className="font-medium">Kayıt Tarihi:</span>{' '}
                  {formatDate(customer.createdAt)}
                </p>
                <p>
                  <span className="font-medium">Durum:</span>{' '}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.isEmailVerified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {customer.isEmailVerified ? 'Doğrulanmış' : 'Doğrulanmamış'}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Adresler</h3>
              {customer.addresses.length === 0 ? (
                <p className="text-gray-500">Kayıtlı adres bulunamadı.</p>
              ) : (
                <div className="space-y-4">
                  {customer.addresses.map((address) => (
                    <div key={address._id} className="border p-3 rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            address.type === 'shipping'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {address.type === 'shipping' ? 'Teslimat' : 'Fatura'}
                        </span>
                        {address.isDefault && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Varsayılan
                          </span>
                        )}
                      </div>
                      <p>{address.street}</p>
                      <p>
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                      <p>{address.country}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Siparişler */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium mb-4">Siparişler</h3>
          
          {orders.length === 0 ? (
            <p className="text-gray-500">Henüz sipariş bulunmuyor.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sipariş No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ödeme
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.totalPrice.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            orderStatusConfig[order.status]?.color ||
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {orderStatusConfig[order.status]?.label || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.isPaid
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {order.isPaid ? 'Ödendi' : 'Bekliyor'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Detaylar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}