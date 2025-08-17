'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearCart } from '@/store/slices/cartSlice';
import { orderService } from '@/services';
import useProductTracking from '@/hooks/useProductTracking';

interface PaymentFormData {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { trackProductActivity } = useProductTracking();
  
  const { user, isAuthenticated, loading: authLoading } = useAppSelector((state) => state.auth);
  const { items, totalPrice, loading: cartLoading } = useAppSelector((state) => state.cart);
  
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  // Ödeme sayfası yüklendiğinde sipariş detaylarını kontrol et
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/checkout/payment');
      } else if (!cartLoading && items.length === 0) {
        router.push('/cart');
      } else {
        // Sepet ve teslimat bilgilerini localStorage'dan al
        const shippingInfo = localStorage.getItem('shippingInfo');
        if (!shippingInfo) {
          router.push('/checkout/shipping');
        } else {
          try {
            const parsedShippingInfo = JSON.parse(shippingInfo);
            setOrderDetails({
              items,
              totalPrice,
              shipping: parsedShippingInfo,
              taxPrice: totalPrice * 0.18, // %18 KDV
              shippingPrice: totalPrice > 500 ? 0 : 29.99, // 500 TL üzeri kargo bedava
            });
          } catch (error) {
            console.error('Error while loading shipping info:', error);
            router.push('/checkout/shipping');
          }
        }
      }
    }
  }, [authLoading, isAuthenticated, cartLoading, items, totalPrice, router]);

  // Form değişikliklerini izle
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Kart numarası formatlaması
    if (name === 'cardNumber') {
      // Sadece rakamları al
      const cleaned = value.replace(/\D/g, '');
      // 16 karakterle sınırla
      const limited = cleaned.substring(0, 16);
      // Her 4 rakamdan sonra boşluk ekle
      const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
      
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }));
    }
    // Son kullanma tarihi formatlaması
    else if (name === 'expiryDate') {
      // Sadece rakamları al
      const cleaned = value.replace(/\D/g, '');
      // 4 karakterle sınırla
      const limited = cleaned.substring(0, 4);
      
      // Ay ve yıl formatı (MM/YY)
      let formatted = limited;
      if (limited.length > 2) {
        formatted = `${limited.substring(0, 2)}/${limited.substring(2)}`;
      }
      
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }));
    }
    // CVV formatlaması
    else if (name === 'cvv') {
      // Sadece rakamları al ve 3 karakterle sınırla
      const formatted = value.replace(/\D/g, '').substring(0, 3);
      
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }));
    }
    // Diğer alanlar
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Hata mesajını temizle
    if (errors[name as keyof PaymentFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Form doğrulama
  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentFormData> = {};
    
    // Kart numarası kontrolü
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
    
    // Kart sahibi kontrolü
    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Cardholder name is required';
    }
    
    // Son kullanma tarihi kontrolü
    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Invalid format (MM/YY)';
    } else {
      const [month, year] = formData.expiryDate.split('/').map(Number);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100; // Son iki hane
      const currentMonth = currentDate.getMonth() + 1;
      
      if (month < 1 || month > 12) {
        newErrors.expiryDate = 'Invalid month';
      } else if (
        (year < currentYear) || 
        (year === currentYear && month < currentMonth)
      ) {
        newErrors.expiryDate = 'Your card has expired';
      }
    }
    
    // CVV kontrolü
    if (!formData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (formData.cvv.length !== 3) {
      newErrors.cvv = 'CVV must be 3 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Ödeme işlemi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      if (!orderDetails) {
        throw new Error('Order details not found');
      }
      
      // Ödeme işlemi simülasyonu
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Sipariş oluştur
      const orderData = {
        orderItems: orderDetails.items.map((item: any) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shippingAddress: {
          street: orderDetails.shipping.street,
          city: orderDetails.shipping.city,
          state: orderDetails.shipping.state,
          zipCode: orderDetails.shipping.zipCode,
          country: orderDetails.shipping.country,
        },
        billingAddress: {
          street: orderDetails.shipping.street,
          city: orderDetails.shipping.city,
          state: orderDetails.shipping.state,
          zipCode: orderDetails.shipping.zipCode,
          country: orderDetails.shipping.country,
        },
        paymentMethod: 'Credit Card',
        paymentResult: {
          id: `PAY-${Math.random().toString(36).substring(2, 15)}`,
          status: 'completed',
          updateTime: new Date().toISOString(),
        },
        taxPrice: orderDetails.taxPrice,
        shippingPrice: orderDetails.shippingPrice,
        totalPrice: orderDetails.totalPrice + orderDetails.taxPrice + orderDetails.shippingPrice,
        isPaid: true,
        paidAt: new Date().toISOString(),
      };
      
      const response = await orderService.createOrder(orderData);
      
      // Ürünleri satın alma olarak izle
      orderDetails.items.forEach((item: any) => {
        trackProductActivity(item.product._id, 'purchase');
      });
      
      // Sepeti temizle
      dispatch(clearCart());
      
      // Teslimat bilgilerini temizle
      localStorage.removeItem('shippingInfo');
      
      // Başarı sayfasına yönlendir
      router.push(`/checkout/success?orderId=${response.data._id}`);
    } catch (error: any) {
      console.error('Error during payment:', error);
      setPaymentError(error.message || 'An error occurred during payment');
    } finally {
      setIsProcessing(false);
    }
  };

  // Toplam fiyat hesapla
  const calculateTotal = () => {
    if (!orderDetails) return 0;
    
    return orderDetails.totalPrice + orderDetails.taxPrice + orderDetails.shippingPrice;
  };

  // Yükleniyor durumu
  if (authLoading || cartLoading || !orderDetails) {
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
        <div className="flex flex-col md:flex-row gap-8">
          {/* Ödeme formu */}
          <div className="w-full md:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold mb-6">Payment Information</h1>
              
              {/* Adım göstergesi */}
              <div className="flex items-center mb-8">
                <div className="flex items-center">
                  <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center">
                    1
                  </div>
                  <span className="ml-2 text-primary font-medium">Shipping</span>
                </div>
                <div className="h-1 w-12 bg-primary mx-2"></div>
                <div className="flex items-center">
                  <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center">
                    2
                  </div>
                  <span className="ml-2 text-primary font-medium">Payment</span>
                </div>
                <div className="h-1 w-12 bg-gray-300 mx-2"></div>
                <div className="flex items-center">
                  <div className="bg-gray-300 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center">
                    3
                  </div>
                  <span className="ml-2 text-gray-600">Confirmation</span>
                </div>
              </div>

              {/* Hata mesajı */}
              {paymentError && (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                  {paymentError}
                </div>
              )}

              {/* Ödeme formu */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Kart numarası */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.cardNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                    )}
                  </div>

                  {/* Kart sahibi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      placeholder="Name Surname"
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.cardName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.cardName && (
                      <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Son kullanma tarihi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.expiryDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                      )}
                    </div>

                    {/* CVV */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        placeholder="123"
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.cvv ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.cvv && (
                        <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <Link href="/checkout/shipping">
                      <Button variant="outline">Back</Button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <div className="flex items-center">
                          <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                          Processing Payment...
                        </div>
                      ) : (
                        'Complete Payment'
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Sipariş özeti */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              
              <div className="divide-y divide-gray-200">
                {orderDetails.items.map((item: any) => (
                  <div key={item._id} className="py-3 flex justify-between">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{(item.product.price * item.quantity).toLocaleString('en-US')} ₺</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between py-1">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="font-medium">{orderDetails.totalPrice.toLocaleString('en-US')} ₺</p>
                </div>
                <div className="flex justify-between py-1">
                  <p className="text-gray-600">VAT (18%)</p>
                  <p className="font-medium">{orderDetails.taxPrice.toLocaleString('en-US')} ₺</p>
                </div>
                <div className="flex justify-between py-1">
                  <p className="text-gray-600">Shipping</p>
                  <p className="font-medium">
                    {orderDetails.shippingPrice === 0 
                      ? 'Free' 
                      : `${orderDetails.shippingPrice.toLocaleString('en-US')} ₺`}
                  </p>
                </div>
                <div className="flex justify-between py-3 font-bold text-lg border-t border-gray-200 mt-2">
                  <p>Total</p>
                  <p>{calculateTotal().toLocaleString('en-US')} ₺</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="bg-gray-100 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Shipping Address</h3>
                  <p>{orderDetails.shipping.street}</p>
                  <p>
                    {orderDetails.shipping.city}, {orderDetails.shipping.state}{' '}
                    {orderDetails.shipping.zipCode}
                  </p>
                  <p>{orderDetails.shipping.country}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}