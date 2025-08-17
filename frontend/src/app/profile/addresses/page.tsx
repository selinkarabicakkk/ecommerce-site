'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store';
import { userService } from '@/services';
import { Address } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form doğrulama şeması
const addressSchema = z.object({
  type: z.enum(['shipping', 'billing']),
  street: z.string().min(3, 'Address must be at least 3 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State/District must be at least 2 characters'),
  zipCode: z.string().min(4, 'ZIP code must be at least 4 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  isDefault: z.boolean().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function AddressesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  
  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      type: 'shipping',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      isDefault: false,
    },
  });

  // Adres listesini yükle
  const loadAddresses = async () => {
    try {
      const response = await userService.getUserProfile();
      if (response.success && response.data) {
        setAddresses(response.data.addresses || []);
      }
    } catch (err: any) {
      console.error('Error while loading addresses:', err);
      setError('An error occurred while loading addresses');
    } finally {
      setIsLoading(false);
    }
  };

  // Sayfa yüklendiğinde adres listesini getir
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/profile/addresses');
      } else {
        loadAddresses();
      }
    }
  }, [isAuthenticated, loading, router]);

  // Adres düzenleme formunu aç
  const handleEditAddress = (address: Address) => {
    setEditingAddressId(address._id || null);
    setShowAddForm(true);
    
    // Form alanlarını doldur
    setValue('type', address.type);
    setValue('street', address.street);
    setValue('city', address.city);
    setValue('state', address.state);
    setValue('zipCode', address.zipCode);
    setValue('country', address.country);
    setValue('isDefault', address.isDefault);
    
    // Sayfayı form bölümüne kaydır
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Adres silme
  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await userService.deleteAddress(addressId);
      if (response.success) {
        setActionSuccess('Address deleted successfully');
        // Adres listesini güncelle
        loadAddresses();
        
        // 3 saniye sonra başarı mesajını kaldır
        setTimeout(() => {
          setActionSuccess(null);
        }, 3000);
      }
    } catch (err: any) {
      console.error('Error while deleting address:', err);
      setError(err.message || 'An error occurred while deleting the address');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form gönderme (ekleme veya güncelleme)
  const onSubmit = async (data: AddressFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (editingAddressId) {
        // Adres güncelleme
        const response = await userService.updateAddress(editingAddressId, data);
        if (response.success) {
          setActionSuccess('Address updated successfully');
        }
      } else {
        // Yeni adres ekleme
        const response = await userService.addAddress(data);
        if (response.success) {
          setActionSuccess('Address added successfully');
        }
      }
      
      // Formu sıfırla ve kapat
      reset();
      setShowAddForm(false);
      setEditingAddressId(null);
      
      // Adres listesini güncelle
      loadAddresses();
      
      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error while saving address:', err);
      setError(err.message || 'An error occurred while saving the address');
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
              <Link href="/profile" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">
                Profile
              </Link>
              <Link href="/profile/addresses" className="px-4 py-2 bg-primary text-white rounded-md">
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
          {actionSuccess && (
            <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">{actionSuccess}</div>
          )}
          
          {/* Hata mesajı */}
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>
          )}
          
          {/* Adres ekleme butonu */}
          {!showAddForm && (
            <div className="mb-6">
              <Button onClick={() => { setShowAddForm(true); setEditingAddressId(null); reset(); }}>
                Add New Address
              </Button>
            </div>
          )}
          
          {/* Adres ekleme/düzenleme formu */}
          {showAddForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-medium mb-4">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Adres tipi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Type <span className="text-red-500">*</span></label>
                  <select {...register('type')} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="shipping">Shipping Address</option>
                    <option value="billing">Billing Address</option>
                  </select>
                </div>
                
                {/* Sokak/Cadde */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
                  <input type="text" {...register('street')} className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.street ? 'border-red-500' : 'border-gray-300'}`} />
                  {errors.street && (<p className="mt-1 text-sm text-red-600">{errors.street.message}</p>)}
                </div>
                
                {/* Şehir ve İlçe/Eyalet */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                    <input type="text" {...register('city')} className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.city ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.city && (<p className="mt-1 text-sm text-red-600">{errors.city.message}</p>)}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State/District <span className="text-red-500">*</span></label>
                    <input type="text" {...register('state')} className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.state ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.state && (<p className="mt-1 text-sm text-red-600">{errors.state.message}</p>)}
                  </div>
                </div>
                
                {/* Posta Kodu ve Ülke */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code <span className="text-red-500">*</span></label>
                    <input type="text" {...register('zipCode')} className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.zipCode ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.zipCode && (<p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>)}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country <span className="text-red-500">*</span></label>
                    <input type="text" {...register('country')} className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.country ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.country && (<p className="mt-1 text-sm text-red-600">{errors.country.message}</p>)}
                  </div>
                </div>
                
                {/* Varsayılan adres */}
                <div className="flex items-center">
                  <input type="checkbox" id="isDefault" {...register('isDefault')} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">Set this address as default</label>
                </div>
                
                {/* Form butonları */}
                <div className="pt-4 flex justify-end space-x-3">
                  <Button type="button" variant="secondary" onClick={() => { setShowAddForm(false); setEditingAddressId(null); }} disabled={isSubmitting}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? (<div className="flex items-center"><div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>Saving...</div>) : ('Save')}</Button>
                </div>
              </form>
            </div>
          )}
          
          {/* Adres listesi */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium mb-4">Saved Addresses</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div></div>
            ) : addresses.length === 0 ? (
              <div className="py-4 text-gray-500 text-center">You have no saved addresses.</div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-2">
                          <span className="font-medium">{address.type === 'shipping' ? 'Shipping Address' : 'Billing Address'}</span>
                          {address.isDefault && (<span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Default</span>)}
                        </div>
                        <p className="text-gray-600">{address.street}</p>
                        <p className="text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
                        <p className="text-gray-600">{address.country}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => handleEditAddress(address)} className="text-blue-600 hover:text-blue-800" disabled={isSubmitting}>Edit</button>
                        <button onClick={() => address._id && handleDeleteAddress(address._id)} className="text-red-600 hover:text-red-800" disabled={isSubmitting}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}