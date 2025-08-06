'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store';
import { categoryService } from '@/services';
import { Category } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form doğrulama şeması
const categorySchema = z.object({
  name: z.string().min(2, 'Kategori adı en az 2 karakter olmalıdır'),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = params;
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Kategori verilerini getir
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        
        const response = await categoryService.getCategoryById(id);
        const category = response.data;
        
        if (!category) {
          throw new Error('Kategori bulunamadı');
        }
        
        // Form değerlerini ayarla
        reset({
          name: category.name,
          description: category.description || '',
        });
        
        // Mevcut resmi ayarla
        if (category.image) {
          setExistingImage(category.image);
        }
      } catch (err) {
        console.error('Kategori yüklenirken hata:', err);
        setError('Kategori bilgileri yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/admin/categories');
      } else if (user?.role !== 'admin') {
        router.push('/');
      } else {
        fetchCategory();
      }
    }
  }, [id, isAuthenticated, loading, reset, router, user]);

  // Resim seçme işlemi
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Resim önizleme
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Mevcut resmi temizle
      setExistingImage(null);
    }
  };

  // Resim kaldırma
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setExistingImage(null);
  };

  // Form gönderme
  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Form verisi oluştur
      const formData = new FormData();
      formData.append('name', data.name);
      
      if (data.description) {
        formData.append('description', data.description);
      }
      
      // Resim durumunu belirt
      if (selectedImage) {
        formData.append('image', selectedImage);
      } else if (existingImage === null) {
        // Mevcut resim kaldırıldı
        formData.append('removeImage', 'true');
      }
      
      // API'ye gönder
      await categoryService.updateCategory(id, formData);
      
      // Başarılı olursa kategoriler sayfasına yönlendir
      router.push('/admin/categories');
    } catch (err: any) {
      setError(err.message || 'Kategori güncellenirken bir hata oluştu');
      console.error('Kategori güncelleme hatası:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Yükleniyor durumu
  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Kategori yüklenirken
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Kategori Düzenle</h1>
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

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Kategori Düzenle</h1>
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

        {/* Kategori formu */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium mb-4">Kategori Bilgileri</h2>
            
            <div className="space-y-4">
              {/* Kategori adı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Kategori resmi */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium mb-4">Kategori Resmi</h2>
            
            <div className="space-y-4">
              {/* Mevcut resim */}
              {existingImage && (
                <div className="mb-4">
                  <h3 className="text-md font-medium mb-2">Mevcut Resim</h3>
                  <div className="relative inline-block">
                    <img
                      src={`/uploads/${existingImage}`}
                      alt="Kategori resmi"
                      className="h-32 w-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              )}
              
              {/* Yeni resim */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {existingImage ? 'Resmi Değiştir' : 'Resim Yükle'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Önerilen boyut: 300x300 piksel, en fazla 2MB
                </p>
              </div>
              
              {/* Yeni resim önizleme */}
              {imagePreview && (
                <div>
                  <h3 className="text-md font-medium mb-2">Yeni Resim</h3>
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Kategori önizleme"
                      className="h-32 w-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form gönderme */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                  Güncelleniyor...
                </div>
              ) : (
                'Kategoriyi Güncelle'
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}