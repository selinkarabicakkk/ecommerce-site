'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  
  // Mock veri (normalde API'den gelecek)
  const [stats, setStats] = useState({
    totalSales: 45750.99,
    totalOrders: 187,
    totalCustomers: 124,
    pendingOrders: 12,
    lowStockProducts: 8,
  });

  const [recentOrders, setRecentOrders] = useState([
    {
      id: 'ORD-123456',
      customer: 'Ahmet Yılmaz',
      date: '2023-06-20T10:30:00Z',
      total: 1299.99,
      status: 'processing',
    },
    {
      id: 'ORD-123455',
      customer: 'Ayşe Demir',
      date: '2023-06-19T14:20:00Z',
      total: 2499.99,
      status: 'shipped',
    },
    {
      id: 'ORD-123454',
      customer: 'Mehmet Kaya',
      date: '2023-06-18T09:15:00Z',
      total: 899.97,
      status: 'delivered',
    },
    {
      id: 'ORD-123453',
      customer: 'Zeynep Çelik',
      date: '2023-06-17T16:45:00Z',
      total: 459.98,
      status: 'pending',
    },
  ]);

  const [popularProducts, setPopularProducts] = useState([
    {
      id: 'PROD-001',
      name: 'Akıllı Telefon X',
      sales: 42,
      stock: 18,
      price: 9999.99,
    },
    {
      id: 'PROD-002',
      name: 'Laptop Pro',
      sales: 38,
      stock: 7,
      price: 14999.99,
    },
    {
      id: 'PROD-003',
      name: 'Kablosuz Kulaklık',
      sales: 65,
      stock: 24,
      price: 1299.99,
    },
    {
      id: 'PROD-004',
      name: 'Akıllı Saat',
      sales: 51,
      stock: 15,
      price: 2499.99,
    },
  ]);

  // Kullanıcı giriş yapmamışsa veya admin değilse yönlendir
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/admin');
      } else if (user?.role !== 'admin') {
        router.push('/');
      }
    }
  }, [isAuthenticated, loading, router, user]);

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

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Paneli</h1>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-sm font-medium text-gray-500">Toplam Satış</h2>
            <p className="text-2xl font-bold text-primary mt-1">
              {stats.totalSales.toLocaleString('tr-TR')} ₺
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-sm font-medium text-gray-500">Toplam Sipariş</h2>
            <p className="text-2xl font-bold text-primary mt-1">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-sm font-medium text-gray-500">Toplam Müşteri</h2>
            <p className="text-2xl font-bold text-primary mt-1">{stats.totalCustomers}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-sm font-medium text-gray-500">Bekleyen Sipariş</h2>
            <p className="text-2xl font-bold text-yellow-500 mt-1">{stats.pendingOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-sm font-medium text-gray-500">Düşük Stoklu Ürün</h2>
            <p className="text-2xl font-bold text-red-500 mt-1">{stats.lowStockProducts}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Son Siparişler */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Son Siparişler</h2>
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm">
                  Tümünü Gör
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Sipariş No
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Müşteri
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Tarih
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Tutar
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Durum
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.total.toLocaleString('tr-TR')} ₺
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Popüler Ürünler */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Popüler Ürünler</h2>
              <Link href="/admin/products">
                <Button variant="ghost" size="sm">
                  Tümünü Gör
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto">
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
                      Satış
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Stok
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Fiyat
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {popularProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.sales}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.stock < 10
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.price.toLocaleString('tr-TR')} ₺
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Satış Grafiği - Basit bir görselleştirme */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Satış Trendi</h2>
          <div className="h-64 flex items-end space-x-2">
            {[35, 45, 30, 65, 80, 70, 60, 75, 50, 55, 70, 90].map((value, index) => (
              <div
                key={index}
                className="flex-1 bg-primary hover:bg-primary/80 rounded-t transition-all"
                style={{ height: `${value}%` }}
                title={`Ay ${index + 1}: ${value * 100}`}
              ></div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Oca</span>
            <span>Şub</span>
            <span>Mar</span>
            <span>Nis</span>
            <span>May</span>
            <span>Haz</span>
            <span>Tem</span>
            <span>Ağu</span>
            <span>Eyl</span>
            <span>Eki</span>
            <span>Kas</span>
            <span>Ara</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}