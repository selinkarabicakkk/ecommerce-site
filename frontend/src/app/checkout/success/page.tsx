'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store';
import { orderService } from '@/services';

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
  status: string;
  createdAt: string;
  isPaid: boolean;
  paidAt?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const { isAuthenticated, loading: authLoading } = useAppSelector((state) => state.auth);
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sipariş bilgilerini getir
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Sipariş ID\'si bulunamadı');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await orderService.getOrderById(orderId);
        setOrder(response.data);
      } catch (err: any) {
        console.error('Sipariş bilgileri yüklenirken hata:', err);
        setError(err.message || 'Sipariş bilgileri yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && isAuthenticated) {
      fetchOrder();
    } else if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, orderId, router]);

  // Tarihi formatla
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Yükleniyor durumu
  if (authLoading || isLoading) {
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

  // Hata durumu
  if (error || !order) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-red-600 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-4">An Error Occurred</h1>
              <p className="text-gray-600 mb-6">{error || 'An error occurred while loading the order information'}</p>
              <div className="flex justify-center">
                <Link href="/">
                  <Button>Go to Home</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-8">
              <div className="text-green-600 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2">Your Order is Confirmed!</h1>
              <p className="text-gray-600">Your order has been successfully created and confirmed.</p>
            </div>

            {/* Sipariş bilgileri */}
            <div className="border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <div>
                  <h2 className="font-bold text-lg">Order Information</h2>
                  <p className="text-gray-600">Order No: {order.orderNumber}</p>
                  <p className="text-gray-600">Date: {formatDate(order.createdAt)}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      order.isPaid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {order.isPaid ? 'Paid' : 'Awaiting Payment'}
                  </span>
                  <span
                    className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {order.status === 'pending'
                      ? 'Pending'
                      : order.status === 'processing'
                      ? 'Processing'
                      : order.status === 'shipped'
                      ? 'Shipped'
                      : order.status === 'delivered'
                      ? 'Delivered'
                      : 'Cancelled'}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-medium mb-2">Shipping Address</h3>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>

            {/* Toplam fiyat */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Total Amount</span>
                <span className="font-bold text-xl text-primary">
                  {order.totalPrice.toLocaleString('en-US')} ₺
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-4">
              <Link href="/profile/orders" className="w-full md:w-auto">
                <Button variant="outline" className="w-full">
                  View My Orders
                </Button>
              </Link>
              <Link href="/" className="w-full md:w-auto">
                <Button className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}