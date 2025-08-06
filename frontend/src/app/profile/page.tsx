'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store';

// Form şeması
const profileSchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  phoneNumber: z
    .string()
    .min(10, 'Telefon numarası en az 10 karakter olmalıdır')
    .optional()
    .nullable(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Kullanıcı giriş yapmamışsa giriş sayfasına yönlendir
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/profile');
    }
  }, [isAuthenticated, loading, router]);

  // Form hook'u
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    },
  });

  // Kullanıcı bilgilerini form'a yükle
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user, reset]);

  // Profil güncelleme
  const handleUpdateProfile = async (data: ProfileFormData) => {
    setIsUpdating(true);
    
    try {
      // Burada normalde API'ye profil güncelleme isteği gönderilecek
      // Şimdilik mock bir işlem yapıyoruz
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setUpdateSuccess(true);
      
      // Başarı mesajını 3 saniye sonra kaldır
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Profil güncellenirken hata oluştu:', error);
    } finally {
      setIsUpdating(false);
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
        <h1 className="text-3xl font-bold mb-6">Hesabım</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Yan menü */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 bg-gray-50 border-b">
                <h2 className="font-semibold text-lg">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-600 text-sm">{user?.email}</p>
              </div>
              <nav className="p-2">
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        activeTab === 'profile'
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      Profil Bilgilerim
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('addresses')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        activeTab === 'addresses'
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      Adreslerim
                    </button>
                  </li>
                  <li>
                    <Link
                      href="/profile/orders"
                      className="block px-4 py-2 rounded-md hover:bg-gray-100"
                    >
                      Siparişlerim
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/profile/favorites"
                      className="block px-4 py-2 rounded-md hover:bg-gray-100"
                    >
                      Favorilerim
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('password')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        activeTab === 'password'
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      Şifre Değiştir
                    </button>
                  </li>
                  <li>
                    <button className="w-full text-left px-4 py-2 rounded-md text-red-600 hover:bg-red-50">
                      Çıkış Yap
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* İçerik alanı */}
          <div className="md:w-3/4">
            {/* Profil bilgileri */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Profil Bilgilerim</h2>

                {updateSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                    Profil bilgileriniz başarıyla güncellendi.
                  </div>
                )}

                <form onSubmit={handleSubmit(handleUpdateProfile)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        Ad
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        {...register('firstName')}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                          errors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Soyad
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        {...register('lastName')}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                          errors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      E-posta
                    </label>
                    <input
                      id="email"
                      type="email"
                      {...register('email')}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      E-posta adresinizi değiştirmek için müşteri hizmetleriyle iletişime geçin.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon (İsteğe bağlı)
                    </label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      {...register('phoneNumber')}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                        errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" isLoading={isUpdating}>
                      Kaydet
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Adresler */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Adreslerim</h2>
                  <Button size="sm">Yeni Adres Ekle</Button>
                </div>

                {user?.addresses && user.addresses.length > 0 ? (
                  <div className="space-y-4">
                    {user.addresses.map((address) => (
                      <div
                        key={address._id}
                        className="border rounded-md p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">
                              {address.type === 'shipping' ? 'Teslimat Adresi' : 'Fatura Adresi'}
                              {address.isDefault && (
                                <span className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                                  Varsayılan
                                </span>
                              )}
                            </h3>
                            <p className="text-gray-600 mt-1">
                              {address.street}, {address.city} / {address.state}
                            </p>
                            <p className="text-gray-600">
                              {address.zipCode}, {address.country}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-primary hover:text-primary/80">Düzenle</button>
                            <button className="text-red-600 hover:text-red-800">Sil</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Henüz kayıtlı adresiniz bulunmamaktadır.</p>
                    <Button>Adres Ekle</Button>
                  </div>
                )}
              </div>
            )}

            {/* Şifre değiştir */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Şifre Değiştir</h2>

                <form className="space-y-4">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Mevcut Şifre
                    </label>
                    <input
                      id="currentPassword"
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Yeni Şifre
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Yeni Şifre (Tekrar)
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">Şifreyi Değiştir</Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}