'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store';

interface ShippingFormData {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export default function CheckoutShippingPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAppSelector((state) => state.auth);
  const { items, loading: cartLoading } = useAppSelector((state) => state.cart);
  
  const [formData, setFormData] = useState<ShippingFormData>({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Türkiye',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<ShippingFormData>>({});

  // Sayfa yüklendiğinde kullanıcı ve sepet kontrolü
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/checkout/shipping');
      } else if (!cartLoading && items.length === 0) {
        router.push('/cart');
      } else {
        // Daha önce kaydedilmiş teslimat bilgilerini kontrol et
        const savedShippingInfo = localStorage.getItem('shippingInfo');
        if (savedShippingInfo) {
          try {
            const parsedInfo = JSON.parse(savedShippingInfo);
            setFormData(parsedInfo);
          } catch (error) {
            console.error('Kaydedilmiş teslimat bilgileri yüklenirken hata:', error);
          }
        } else if (user) {
          // Kullanıcı bilgilerinden form alanlarını doldur
          setFormData((prev) => ({
            ...prev,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            // Kullanıcının varsayılan adresi varsa onu da ekleyebiliriz
          }));
        }
      }
    }
  }, [authLoading, isAuthenticated, cartLoading, items, router, user]);

  // Form değişikliklerini izle
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Hata mesajını temizle
    if (errors[name as keyof ShippingFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Form doğrulama
  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingFormData> = {};
    
    // Ad kontrolü
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad gereklidir';
    }
    
    // Soyad kontrolü
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad gereklidir';
    }
    
    // Adres kontrolü
    if (!formData.street.trim()) {
      newErrors.street = 'Adres gereklidir';
    }
    
    // Şehir kontrolü
    if (!formData.city.trim()) {
      newErrors.city = 'Şehir gereklidir';
    }
    
    // İlçe kontrolü
    if (!formData.state.trim()) {
      newErrors.state = 'İlçe gereklidir';
    }
    
    // Posta kodu kontrolü
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'Posta kodu gereklidir';
    }
    
    // Ülke kontrolü
    if (!formData.country.trim()) {
      newErrors.country = 'Ülke gereklidir';
    }
    
    // Telefon kontrolü
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gereklidir';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form gönderme
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Teslimat bilgilerini kaydet
    localStorage.setItem('shippingInfo', JSON.stringify(formData));
    
    // Ödeme sayfasına yönlendir
    router.push('/checkout/payment');
  };

  // Yükleniyor durumu
  if (authLoading || cartLoading) {
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
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold mb-6">Teslimat Bilgileri</h1>
            
            {/* Adım göstergesi */}
            <div className="flex items-center mb-8">
              <div className="flex items-center">
                <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center">
                  1
                </div>
                <span className="ml-2 text-primary font-medium">Teslimat</span>
              </div>
              <div className="h-1 w-12 bg-gray-300 mx-2"></div>
              <div className="flex items-center">
                <div className="bg-gray-300 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center">
                  2
                </div>
                <span className="ml-2 text-gray-600">Ödeme</span>
              </div>
              <div className="h-1 w-12 bg-gray-300 mx-2"></div>
              <div className="flex items-center">
                <div className="bg-gray-300 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center">
                  3
                </div>
                <span className="ml-2 text-gray-600">Onay</span>
              </div>
            </div>

            {/* Teslimat formu */}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                {/* Soyad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>

                {/* Adres */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.street ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.street && (
                    <p className="mt-1 text-sm text-red-600">{errors.street}</p>
                  )}
                </div>

                {/* Şehir */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şehir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>

                {/* İlçe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İlçe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                  )}
                </div>

                {/* Posta kodu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Posta Kodu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.zipCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.zipCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                  )}
                </div>

                {/* Ülke */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ülke <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.country ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="Türkiye">Türkiye</option>
                    <option value="Kıbrıs">Kıbrıs</option>
                    <option value="Azerbaycan">Azerbaycan</option>
                  </select>
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                  )}
                </div>

                {/* Telefon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="5XX XXX XX XX"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Link href="/cart">
                  <Button variant="outline">Sepete Dön</Button>
                </Link>
                <Button type="submit">Ödemeye Geç</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}