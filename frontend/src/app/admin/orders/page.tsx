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
  };
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  isPaid: boolean;
  paidAt?: string;
  items: {
    product: {
      _id: string;
      name: string;
      price: number;
      image?: string;
    };
    quantity: number;
    price: number;
  }[];
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Örnek veri (normalde API'den gelecek)
  const mockOrders: Order[] = [
    {
      _id: 'ord1',
      orderNumber: 'ORD-123456',
      user: {
        _id: 'user1',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        email: 'ahmet@example.com',
      },
      totalPrice: 1299.99,
      status: 'delivered',
      createdAt: '2023-06-20T10:30:00Z',
      isPaid: true,
      paidAt: '2023-06-20T10:35:00Z',
      items: [
        {
          product: {
            _id: 'prod1',
            name: 'Akıllı Telefon',
            price: 1299.99,
            image: 'phone.jpg',
          },
          quantity: 1,
          price: 1299.99,
        },
      ],
    },
    {
      _id: 'ord2',
      orderNumber: 'ORD-123457',
      user: {
        _id: 'user2',
        firstName: 'Ayşe',
        lastName: 'Demir',
        email: 'ayse@example.com',
      },
      totalPrice: 499.99,
      status: 'shipped',
      createdAt: '2023-07-05T14:20:00Z',
      isPaid: true,
      paidAt: '2023-07-05T14:25:00Z',
      items: [
        {
          product: {
            _id: 'prod2',
            name: 'Kablosuz Kulaklık',
            price: 499.99,
            image: 'headphones.jpg',
          },
          quantity: 1,
          price: 499.99,
        },
      ],
    },
    {
      _id: 'ord3',
      orderNumber: 'ORD-123458',
      user: {
        _id: 'user3',
        firstName: 'Mehmet',
        lastName: 'Kaya',
        email: 'mehmet@example.com',
      },
      totalPrice: 2499.99,
      status: 'pending',
      createdAt: '2023-07-15T09:15:00Z',
      isPaid: false,
      items: [
        {
          product: {
            _id: 'prod3',
            name: 'Laptop',
            price: 2499.99,
            image: 'laptop.jpg',
          },
          quantity: 1,
          price: 2499.99,
        },
      ],
    },
    {
      _id: 'ord4',
      orderNumber: 'ORD-123459',
      user: {
        _id: 'user4',
        firstName: 'Zeynep',
        lastName: 'Çelik',
        email: 'zeynep@example.com',
      },
      totalPrice: 349.98,
      status: 'processing',
      createdAt: '2023-07-18T16:45:00Z',
      isPaid: true,
      paidAt: '2023-07-18T16:50:00Z',
      items: [
        {
          product: {
            _id: 'prod4',
            name: 'Akıllı Saat',
            price: 349.99,
            image: 'smartwatch.jpg',
          },
          quantity: 1,
          price: 349.99,
        },
      ],
    },
    {
      _id: 'ord5',
      orderNumber: 'ORD-123460',
      user: {
        _id: 'user5',
        firstName: 'Ali',
        lastName: 'Öztürk',
        email: 'ali@example.com',
      },
      totalPrice: 799.99,
      status: 'cancelled',
      createdAt: '2023-07-10T11:30:00Z',
      isPaid: false,
      items: [
        {
          product: {
            _id: 'prod5',
            name: 'Tablet',
            price: 799.99,
            image: 'tablet.jpg',
          },
          quantity: 1,
          price: 799.99,
        },
      ],
    },
  ];

  // Siparişleri getir
  const fetchOrders = async (page = 1, search = '', status = 'all') => {
    setIsLoading(true);
    try {
      // Burada normalde API çağrısı olacak
      // const response = await orderService.getOrders({
      //   page,
      //   limit: 10,
      //   search,
      //   status: status !== 'all' ? status : undefined,
      // });
      
      // Mock veri kullan
      setTimeout(() => {
        let filteredOrders = [...mockOrders];
        
        // Durum filtresi
        if (status !== 'all') {
          filteredOrders = filteredOrders.filter((order) => order.status === status);
        }
        
        // Arama filtresi
        if (search) {
          const searchLower = search.toLowerCase();
          filteredOrders = filteredOrders.filter(
            (order) =>
              order.orderNumber.toLowerCase().includes(searchLower) ||
              `${order.user.firstName} ${order.user.lastName}`.toLowerCase().includes(searchLower) ||
              order.user.email.toLowerCase().includes(searchLower)
          );
        }
        
        setOrders(filteredOrders);
        setTotalPages(1); // Mock veri için 1 sayfa
        setCurrentPage(page);
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError('Siparişler yüklenirken bir hata oluştu.');
      console.error('Siparişler yüklenirken hata:', err);
      setIsLoading(false);
    }
  };

  // Sayfa yüklendiğinde siparişleri getir
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/admin/orders');
      } else if (user?.role !== 'admin') {
        router.push('/');
      } else {
        fetchOrders(currentPage, searchQuery, statusFilter);
      }
    }
  }, [isAuthenticated, loading, router, user]);

  // Arama işlemi
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(1, searchQuery, statusFilter);
  };

  // Durum filtresi değiştiğinde
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    fetchOrders(1, searchQuery, newStatus);
  };

  // Sayfa değiştirme
  const handlePageChange = (page: number) => {
    fetchOrders(page, searchQuery, statusFilter);
  };

  // Sipariş seçme
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) => {
      if (prev.includes(orderId)) {
        return prev.filter((id) => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  // Tüm siparişleri seç/kaldır
  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((order) => order._id));
    }
  };

  // Sipariş durumunu güncelleme
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      // Burada normalde API çağrısı olacak
      // await orderService.updateOrderStatus(orderId, newStatus);
      
      // Mock veri güncelle
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? { ...order, status: newStatus as any }
            : order
        )
      );
    } catch (err) {
      setError('Sipariş durumu güncellenirken bir hata oluştu.');
      console.error('Sipariş güncelleme hatası:', err);
    }
  };

  // Seçili siparişlerin durumunu toplu güncelleme
  const handleBulkUpdateStatus = async (newStatus: string) => {
    if (selectedOrders.length === 0) return;
    
    try {
      // Burada normalde bir bulk update API çağrısı olabilir
      // Şimdilik her siparişi tek tek güncelliyoruz
      for (const orderId of selectedOrders) {
        // await orderService.updateOrderStatus(orderId, newStatus);
      }
      
      // Mock veri güncelle
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          selectedOrders.includes(order._id)
            ? { ...order, status: newStatus as any }
            : order
        )
      );
      
      setSelectedOrders([]);
    } catch (err) {
      setError('Siparişler güncellenirken bir hata oluştu.');
      console.error('Toplu güncelleme hatası:', err);
    }
  };

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sipariş Yönetimi</h1>
        </div>

        {/* Arama ve filtreler */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Sipariş no, müşteri adı veya e-posta ara..."
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">Beklemede</option>
                <option value="processing">İşleniyor</option>
                <option value="shipped">Kargoya Verildi</option>
                <option value="delivered">Teslim Edildi</option>
                <option value="cancelled">İptal Edildi</option>
              </select>
            </div>
            <div>
              <Button type="submit">Ara</Button>
            </div>
          </form>
        </div>

        {/* Toplu işlemler */}
        {selectedOrders.length > 0 && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <span>{selectedOrders.length} sipariş seçildi</span>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setSelectedOrders([])}>
                Seçimi Temizle
              </Button>
              <select
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                onChange={(e) => handleBulkUpdateStatus(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>
                  Durum Güncelle
                </option>
                <option value="pending">Beklemede</option>
                <option value="processing">İşleniyor</option>
                <option value="shipped">Kargoya Verildi</option>
                <option value="delivered">Teslim Edildi</option>
                <option value="cancelled">İptal Edildi</option>
              </select>
            </div>
          </div>
        )}

        {/* Hata mesajı */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Sipariş tablosu */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Sipariş bulunamadı.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === orders.length && orders.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sipariş No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order._id)}
                          onChange={() => handleSelectOrder(order._id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.user.firstName} {order.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{order.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.totalPrice.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          className={`text-xs rounded-full px-2 py-1 border ${
                            orderStatusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <option value="pending">Beklemede</option>
                          <option value="processing">İşleniyor</option>
                          <option value="shipped">Kargoya Verildi</option>
                          <option value="delivered">Teslim Edildi</option>
                          <option value="cancelled">İptal Edildi</option>
                        </select>
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

        {/* Sayfalama */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Önceki
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 border rounded-md ${
                    currentPage === page
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}