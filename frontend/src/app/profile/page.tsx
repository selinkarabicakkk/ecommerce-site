'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { useAppSelector, useAppDispatch } from '@/store';
import { updateUser } from '@/store/slices/authSlice';
import { userService } from '@/services';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form doğrulama şeması
const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
    },
  });

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/profile');
      } else if (user) {
        // Form alanlarını kullanıcı bilgileriyle doldur
        reset({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
        });
      }
    }
  }, [isAuthenticated, loading, router, user, reset]);

  // Form gönderme
  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setUpdateSuccess(false);
    setUpdateError(null);
    
    try {
      // API'ye gönder
      const response = await userService.updateUserProfile(data);
      
      // Redux store'u güncelle
      dispatch(updateUser(response.data));
      
      // Başarı mesajı göster
      setUpdateSuccess(true);
      
      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error while updating profile:', err);
      setUpdateError(err.message || 'An error occurred while updating your profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Yükleniyor durumu
  if (loading) {
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

  // Kullanıcı giriş yapmamışsa
  if (!isAuthenticated || !user) {
    return null; // Router zaten yönlendirme yapacak
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">My Account</h1>
          
          {/* Profil navigasyonu */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <Link href="/profile" className="px-4 py-2 bg-primary text-white rounded-md">
                Profile
              </Link>
              <Link href="/profile/addresses" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">
                Addresses
              </Link>
              <Link href="/profile/orders" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">
                Orders
              </Link>
              <Link href="/wishlist" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">
                Wishlist
              </Link>
            </div>
          </div>
          
          {/* Başarı mesajı */}
          {updateSuccess && (
            <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
              Your profile has been updated successfully.
            </div>
          )}
          
          {/* Hata mesajı */}
          {updateError && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
              {updateError}
            </div>
          )}
          
          {/* Profil formu */}
          <div className="card p-6">
            <h2 className="text-lg font-medium mb-4">Profile Information</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('firstName')}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>
                
                {/* Soyad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('lastName')}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
                
                {/* E-posta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    disabled // E-posta değiştirilemez
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
                
                {/* Telefon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    {...register('phoneNumber')}
                    placeholder="5XX XXX XX XX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              {/* Şifre değiştirme bağlantısı */}
              <div className="pt-4">
                <Link href="/auth/reset-password" className="text-primary hover:underline">
                  I want to change my password
                </Link>
              </div>
              
              {/* Form gönderme */}
              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update Information'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}