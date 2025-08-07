'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store';
import { productService, categoryService, uploadService } from '@/services';
import { Category, Product } from '@/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form doğrulama şeması
const productSchema = z.object({
  name: z.string().min(3, 'Ürün adı en az 3 karakter olmalıdır'),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır'),
  price: z.number().min(0.01, 'Fiyat 0\'dan büyük olmalıdır'),
  category: z.string().min(1, 'Kategori seçilmelidir'),
  stock: z.number().int().min(0, 'Stok negatif olamaz'),
  sku: z.string().min(1, 'SKU girilmelidir'),
  isFeatured: z.boolean().optional(),
  tags: z.string().optional(),
  specifications: z.record(z.string(), z.string()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = params;
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: '', value: '' },
  ]);

  // React Hook Form
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      sku: '',
      isFeatured: false,
      tags: '',
    },
  });

  // Ürün ve kategorileri getir
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Kategorileri getir
        const categoryResponse = await categoryService.getCategories();
        setCategories(categoryResponse.categories || []);
        
        // Ürün detaylarını getir
        const productResponse = await productService.getProductById(id);
        const product = productResponse.data;
        
        if (!product) {
          throw new Error('Ürün bulunamadı');
        }
        
        // Form değerlerini ayarla
        reset({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category._id || product.category,
          stock: product.stock,
          sku: product.sku,
          isFeatured: product.isFeatured,
          tags: product.tags?.join(', ') || '',
        });
        
        // Mevcut resimleri ayarla
        if (product.images && product.images.length > 0) {
          setExistingImages(product.images);
        }
        
        // Özellikleri ayarla
        if (product.specifications) {
          const specEntries = Object.entries(product.specifications).map(
            ([key, value]) => ({ key, value: value.toString() })
          );
          setSpecs(specEntries.length > 0 ? specEntries : [{ key: '', value: '' }]);
        }
      } catch (err) {
        console.error('Veri yüklenirken hata:', err);
        setError('Ürün bilgileri yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/admin/products');
      } else if (user?.role !== 'admin') {
        router.push('/');
      } else {
        fetchData();
      }
    }
  }, [id, isAuthenticated, loading, reset, router, user]);

  // Resim seçme işlemi
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages([...selectedImages, ...filesArray]);
      
      // Resim önizlemeleri
      const newPreviewUrls = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
    }
  };

  // Yeni resim kaldırma
  const handleRemoveImage = (index: number) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
    
    const newPreviewUrls = [...imagePreviewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]);
    newPreviewUrls.splice(index, 1);
    setImagePreviewUrls(newPreviewUrls);
  };

  // Mevcut resim kaldırma
  const handleRemoveExistingImage = (index: number) => {
    const newExistingImages = [...existingImages];
    newExistingImages.splice(index, 1);
    setExistingImages(newExistingImages);
  };

  // Özellik ekleme
  const addSpecification = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  // Özellik kaldırma
  const removeSpecification = (index: number) => {
    const newSpecs = [...specs];
    newSpecs.splice(index, 1);
    setSpecs(newSpecs);
  };

  // Özellik değiştirme
  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  // Form gönderme
  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Özellikleri formata çevir
      const specifications: Record<string, string> = {};
      specs.forEach((spec) => {
        if (spec.key && spec.value) {
          specifications[spec.key] = spec.value;
        }
      });
      
      // 1) Yeni resimleri yükle ve dosya adlarını topla
      const uploadedFilenames: string[] = [];
      for (const image of selectedImages) {
        const res = await uploadService.uploadImage(image);
        const filename = (res as any)?.data?.filename || (res as any)?.filename;
        if (filename) uploadedFilenames.push(filename);
      }

      // 2) Mevcut + yeni resimleri birleştir
      const finalImages = [...existingImages, ...uploadedFilenames];

      // 3) JSON payload hazırla ve gönder
      const tagsArray = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
      await productService.updateProduct(id, {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        stock: data.stock,
        sku: data.sku,
        isFeatured: !!data.isFeatured,
        tags: tagsArray as any,
        specifications: specifications as any,
        images: finalImages,
      } as any);
      
      // Başarılı olursa ürünler sayfasına yönlendir
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Ürün güncellenirken bir hata oluştu');
      console.error('Ürün güncelleme hatası:', err);
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

  // Ürün yüklenirken
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Ürün Düzenle</h1>
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
          <h1 className="text-2xl font-bold">Ürün Düzenle</h1>
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

        {/* Ürün formu */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium mb-4">Temel Bilgiler</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ürün adı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün Adı <span className="text-red-500">*</span>
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

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('sku')}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.sku ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.sku && (
                  <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
                )}
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('category')}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Kategori Seçin</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              {/* Fiyat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fiyat (₺) <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      step="0.01"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      value={field.value}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  )}
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              {/* Stok */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stok <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="stock"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      value={field.value}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.stock ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  )}
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
                )}
              </div>

              {/* Öne çıkan */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFeatured"
                  {...register('isFeatured')}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                  Öne çıkan ürün
                </label>
              </div>
            </div>
          </div>

          {/* Açıklama */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium mb-4">Ürün Açıklaması</h2>
            <textarea
              {...register('description')}
              rows={6}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Etiketler */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium mb-4">Etiketler</h2>
            <input
              type="text"
              {...register('tags')}
              placeholder="Etiketleri virgülle ayırın"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1 text-sm text-gray-500">
              Örnek: elektronik, akıllı telefon, yeni
            </p>
          </div>

          {/* Özellikler */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Ürün Özellikleri</h2>
              <Button type="button" onClick={addSpecification} size="sm">
                Özellik Ekle
              </Button>
            </div>
            
            {specs.map((spec, index) => (
              <div key={index} className="flex gap-4 mb-4">
                <input
                  type="text"
                  value={spec.key}
                  onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                  placeholder="Özellik (örn. Ekran Boyutu)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                  placeholder="Değer (örn. 6.5 inç)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeSpecification(index)}
                  disabled={specs.length === 1}
                >
                  Kaldır
                </Button>
              </div>
            ))}
          </div>

          {/* Resimler */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium mb-4">Ürün Resimleri</h2>
            
            {/* Mevcut resimler */}
            {existingImages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-medium mb-2">Mevcut Resimler</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={`/uploads/${image}`}
                        alt={`Ürün ${index + 1}`}
                        className="h-24 w-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Yeni resimler */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yeni Resim Yükle
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="mt-1 text-sm text-gray-500">
                En fazla 5 resim yükleyebilirsiniz. Her resim en fazla 5MB olabilir.
              </p>
            </div>
            
            {imagePreviewUrls.length > 0 && (
              <div>
                <h3 className="text-md font-medium mb-2">Yeni Yüklenen Resimler</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Önizleme ${index + 1}`}
                        className="h-24 w-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                'Ürünü Güncelle'
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}