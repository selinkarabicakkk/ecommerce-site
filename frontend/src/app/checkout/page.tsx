'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchCart, clearCart } from '@/store/slices/cartSlice';
import { Address } from '@/types';

// Form şeması
const checkoutSchema = z.object({
  shippingAddress: z.object({
    type: z.literal('shipping'),
    street: z.string().min(5, 'Adres en az 5 karakter olmalıdır'),
    city: z.string().min(2, 'Şehir en az 2 karakter olmalıdır'),
    state: z.string().min(2, 'İlçe en az 2 karakter olmalıdır'),
    zipCode: z.string().min(5, 'Posta kodu en az 5 karakter olmalıdır'),
    country: z.string().min(2, 'Ülke en az 2 karakter olmalıdır'),
    isDefault: z.boolean().optional(),
  }),
  billingAddress: z.object({
    type: z.literal('billing'),
    street: z.string().min(5, 'Adres en az 5 karakter olmalıdır'),
    city: z.string().min(2, 'Şehir en az 2 karakter olmalıdır'),
    state: z.string().min(2, 'İlçe en az 2 karakter olmalıdır'),
    zipCode: z.string().min(5, 'Posta kodu en az 5 karakter olmalıdır'),
    country: z.string().min(2, 'Ülke en az 2 karakter olmalıdır'),
    isDefault: z.boolean().optional(),
  }),
  sameAsBilling: z.boolean(),
  paymentMethod: z.enum(['credit_card', 'bank_transfer', 'cash_on_delivery']),
  cardNumber: z.string().optional(),
  cardName: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, totalPrice, loading, error } = useAppSelector((state) => state.cart);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [processingOrder, setProcessingOrder] = useState(false);

  // Kullanıcı giriş yapmamışsa giriş sayfasına yönlendir
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/checkout');
    }
  }, [isAuthenticated, router]);

  // Sepeti getir
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Form hook'u
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: {
        type: 'shipping',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Türkiye',
        isDefault: false,
      },
      billingAddress: {
        type: 'billing',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Türkiye',
        isDefault: false,
      },
      sameAsBilling: true,
      paymentMethod: 'credit_card',
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardCvc: '',
    },
  });

  // Kullanıcının kayıtlı adreslerini form'a yükle
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const shippingAddress = user.addresses.find((addr) => addr.type === 'shipping');
      const billingAddress = user.addresses.find((addr) => addr.type === 'billing');

      if (shippingAddress) {
        setValue('shippingAddress', {
          ...shippingAddress,
          type: 'shipping',
        });
      }

      if (billingAddress) {
        setValue('billingAddress', {
          ...billingAddress,
          type: 'billing',
        });
      }
    }
  }, [user, setValue]);

  // Fatura adresi teslimat adresi ile aynı mı?
  const sameAsBilling = watch('sameAsBilling');
  const paymentMethod = watch('paymentMethod');

  // Fatura adresi teslimat adresi ile aynı olduğunda
  useEffect(() => {
    if (sameAsBilling) {
      const shippingAddress = watch('shippingAddress');
      setValue('billingAddress', {
        ...shippingAddress,
        type: 'billing',
      });
    }
  }, [sameAsBilling, setValue, watch]);

  // Siparişi tamamla
  const handlePlaceOrder = async (data: CheckoutFormData) => {
    setProcessingOrder(true);
    
    try {
      // Burada normalde API'ye sipariş oluşturma isteği gönderilecek
      // Şimdilik mock bir işlem yapıyoruz
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Sipariş numarası oluştur
      const mockOrderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderNumber(mockOrderNumber);
      
      // Sepeti temizle
      dispatch(clearCart());
      
      // Başarılı mesajını göster
      setOrderSuccess(true);
    } catch (error) {
      console.error('Sipariş oluşturulurken hata oluştu:', error);
    } finally {
      setProcessingOrder(false);
    }
  };

  // Sepet boşsa ana sayfaya yönlendir
  useEffect(() => {
    if (!loading && items.length === 0 && !orderSuccess) {
      router.push('/');
    }
  }, [loading, items, router, orderSuccess]);

  // Sipariş başarılı mesajı
  if (orderSuccess) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 text-center">
              <svg
                className="mx-auto h-16 w-16 text-green-500"
                xmlns="http://www.w3.org/2000/svg"
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
              <h1 className="text-2xl font-bold mt-4 mb-2">Siparişiniz Alındı!</h1>
              <p className="text-gray-600 mb-4">
                Sipariş numaranız: <span className="font-semibold">{orderNumber}</span>
              </p>
              <p className="text-gray-600 mb-6">
                Siparişiniz başarıyla alındı. Siparişinizin durumunu hesabınızdan takip
                edebilirsiniz.
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/">
                  <Button variant="outline">Ana Sayfaya Dön</Button>
                </Link>
                <Link href="/profile/orders">
                  <Button>Siparişlerim</Button>
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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Ödeme</h1>

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
            {/* Ödeme formu */}
            <div className="lg:w-2/3">
              <form onSubmit={handleSubmit(handlePlaceOrder)} className="space-y-8">
                {/* Teslimat Adresi */}
                <div className="card p-6">
                  <h2 className="text-lg font-semibold mb-4">Teslimat Adresi</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="shipping-street" className="block text-sm font-medium text-gray-700 mb-1">
                        Adres
                      </label>
                      <input
                        id="shipping-street"
                        type="text"
                        {...register('shippingAddress.street')}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                          errors.shippingAddress?.street ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.shippingAddress?.street && (
                        <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.street.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="shipping-city" className="block text-sm font-medium text-gray-700 mb-1">
                        Şehir
                      </label>
                      <input
                        id="shipping-city"
                        type="text"
                        {...register('shippingAddress.city')}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                          errors.shippingAddress?.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.shippingAddress?.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.city.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="shipping-state" className="block text-sm font-medium text-gray-700 mb-1">
                        İlçe
                      </label>
                      <input
                        id="shipping-state"
                        type="text"
                        {...register('shippingAddress.state')}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                          errors.shippingAddress?.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.shippingAddress?.state && (
                        <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.state.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="shipping-zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Posta Kodu
                      </label>
                      <input
                        id="shipping-zipCode"
                        type="text"
                        {...register('shippingAddress.zipCode')}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                          errors.shippingAddress?.zipCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.shippingAddress?.zipCode && (
                        <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.zipCode.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="shipping-country" className="block text-sm font-medium text-gray-700 mb-1">
                        Ülke
                      </label>
                      <input
                        id="shipping-country"
                        type="text"
                        {...register('shippingAddress.country')}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                          errors.shippingAddress?.country ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.shippingAddress?.country && (
                        <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.country.message}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-center">
                        <input
                          id="shipping-isDefault"
                          type="checkbox"
                          {...register('shippingAddress.isDefault')}
                          className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <label htmlFor="shipping-isDefault" className="ml-2 block text-sm text-gray-700">
                          Bu adresi varsayılan teslimat adresi olarak kaydet
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fatura Adresi */}
                <div className="card p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Fatura Adresi</h2>
                    <div className="flex items-center">
                      <input
                        id="sameAsBilling"
                        type="checkbox"
                        {...register('sameAsBilling')}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <label htmlFor="sameAsBilling" className="ml-2 block text-sm text-gray-700">
                        Teslimat adresi ile aynı
                      </label>
                    </div>
                  </div>

                  {!sameAsBilling && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label htmlFor="billing-street" className="block text-sm font-medium text-gray-700 mb-1">
                          Adres
                        </label>
                        <input
                          id="billing-street"
                          type="text"
                          {...register('billingAddress.street')}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                            errors.billingAddress?.street ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.billingAddress?.street && (
                          <p className="mt-1 text-sm text-red-600">{errors.billingAddress.street.message}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="billing-city" className="block text-sm font-medium text-gray-700 mb-1">
                          Şehir
                        </label>
                        <input
                          id="billing-city"
                          type="text"
                          {...register('billingAddress.city')}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                            errors.billingAddress?.city ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.billingAddress?.city && (
                          <p className="mt-1 text-sm text-red-600">{errors.billingAddress.city.message}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="billing-state" className="block text-sm font-medium text-gray-700 mb-1">
                          İlçe
                        </label>
                        <input
                          id="billing-state"
                          type="text"
                          {...register('billingAddress.state')}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                            errors.billingAddress?.state ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.billingAddress?.state && (
                          <p className="mt-1 text-sm text-red-600">{errors.billingAddress.state.message}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="billing-zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                          Posta Kodu
                        </label>
                        <input
                          id="billing-zipCode"
                          type="text"
                          {...register('billingAddress.zipCode')}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                            errors.billingAddress?.zipCode ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.billingAddress?.zipCode && (
                          <p className="mt-1 text-sm text-red-600">{errors.billingAddress.zipCode.message}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="billing-country" className="block text-sm font-medium text-gray-700 mb-1">
                          Ülke
                        </label>
                        <input
                          id="billing-country"
                          type="text"
                          {...register('billingAddress.country')}
                          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                            errors.billingAddress?.country ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.billingAddress?.country && (
                          <p className="mt-1 text-sm text-red-600">{errors.billingAddress.country.message}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center">
                          <input
                            id="billing-isDefault"
                            type="checkbox"
                            {...register('billingAddress.isDefault')}
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <label htmlFor="billing-isDefault" className="ml-2 block text-sm text-gray-700">
                            Bu adresi varsayılan fatura adresi olarak kaydet
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ödeme Yöntemi */}
                <div className="card p-6">
                  <h2 className="text-lg font-semibold mb-4">Ödeme Yöntemi</h2>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        id="credit_card"
                        type="radio"
                        value="credit_card"
                        {...register('paymentMethod')}
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <label htmlFor="credit_card" className="ml-2 block text-sm text-gray-700">
                        Kredi Kartı
                      </label>
                    </div>

                    {paymentMethod === 'credit_card' && (
                      <div className="pl-6 space-y-4 mt-2">
                        <div>
                          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Kart Numarası
                          </label>
                          <input
                            id="cardNumber"
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            {...register('cardNumber')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                          />
                        </div>
                        <div>
                          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                            Kart Üzerindeki İsim
                          </label>
                          <input
                            id="cardName"
                            type="text"
                            placeholder="AD SOYAD"
                            {...register('cardName')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                              Son Kullanma Tarihi
                            </label>
                            <input
                              id="cardExpiry"
                              type="text"
                              placeholder="MM/YY"
                              {...register('cardExpiry')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700 mb-1">
                              CVC
                            </label>
                            <input
                              id="cardCvc"
                              type="text"
                              placeholder="123"
                              {...register('cardCvc')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center">
                      <input
                        id="bank_transfer"
                        type="radio"
                        value="bank_transfer"
                        {...register('paymentMethod')}
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <label htmlFor="bank_transfer" className="ml-2 block text-sm text-gray-700">
                        Havale / EFT
                      </label>
                    </div>

                    {paymentMethod === 'bank_transfer' && (
                      <div className="pl-6 mt-2 p-4 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">
                          Siparişinizi onayladıktan sonra banka hesap bilgileri e-posta adresinize
                          gönderilecektir. Ödemeniz onaylandıktan sonra siparişiniz işleme
                          alınacaktır.
                        </p>
                      </div>
                    )}

                    <div className="flex items-center">
                      <input
                        id="cash_on_delivery"
                        type="radio"
                        value="cash_on_delivery"
                        {...register('paymentMethod')}
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <label htmlFor="cash_on_delivery" className="ml-2 block text-sm text-gray-700">
                        Kapıda Ödeme
                      </label>
                    </div>

                    {paymentMethod === 'cash_on_delivery' && (
                      <div className="pl-6 mt-2 p-4 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">
                          Siparişinizi teslim alırken ödeme yapabilirsiniz. Kapıda ödeme için +10 TL
                          hizmet bedeli uygulanmaktadır.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Link href="/cart">
                    <Button variant="outline">Sepete Dön</Button>
                  </Link>
                  <Button type="submit" isLoading={processingOrder}>
                    Siparişi Tamamla
                  </Button>
                </div>
              </form>
            </div>

            {/* Sipariş özeti */}
            <div className="lg:w-1/3">
              <div className="card p-6 sticky top-8">
                <h2 className="text-lg font-semibold mb-4">Sipariş Özeti</h2>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item._id} className="flex justify-between">
                      <span className="text-gray-600">
                        {item.quantity}x {typeof item.product === 'object' ? item.product.name : 'Ürün'}
                      </span>
                      <span className="font-medium">
                        {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-3">
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
                  {paymentMethod === 'cash_on_delivery' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kapıda Ödeme Bedeli</span>
                      <span className="font-medium">10.00 ₺</span>
                    </div>
                  )}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Toplam</span>
                      <span className="text-lg font-semibold text-primary">
                        {(
                          totalPrice +
                          totalPrice * 0.18 +
                          (totalPrice >= 500 ? 0 : 29.9) +
                          (paymentMethod === 'cash_on_delivery' ? 10 : 0)
                        ).toLocaleString('tr-TR')}{' '}
                        ₺
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}