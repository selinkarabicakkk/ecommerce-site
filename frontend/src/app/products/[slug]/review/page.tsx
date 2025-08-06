'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store';
import { productService, reviewService } from '@/services';
import { Product } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form doğrulama şeması
const reviewSchema = z.object({
  rating: z.number().min(1, 'Lütfen bir puan seçin').max(5),
  comment: z.string().min(5, 'Yorum en az 5 karakter olmalıdır'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export default function ReviewPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAppSelector((state) => state.auth);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const watchRating = watch('rating');

  // Ürün bilgilerini yükle
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productService.getProductBySlug(params.slug);
        if (response.success && response.data) {
          setProduct(response.data);
        } else {
          setError('Ürün bulunamadı');
        }
      } catch (err: any) {
        console.error('Ürün yüklenirken hata:', err);
        setError('Ürün yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.slug]);

  // Kullanıcı giriş yapmış mı kontrol et
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=/products/${params.slug}/review`);
    }
  }, [authLoading, isAuthenticated, router, params.slug]);

  // Form gönderme
  const onSubmit = async (data: ReviewFormData) => {
    if (!product?._id) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await reviewService.addReview(product._id, {
        rating: data.rating,
        comment: data.comment,
      });
      
      if (response.success) {
        setSubmitSuccess(true);
        
        // 2 saniye sonra ürün sayfasına yönlendir
        setTimeout(() => {
          router.push(`/products/${params.slug}`);
        }, 2000);
      } else {
        setError(response.message || 'Değerlendirme gönderilirken bir hata oluştu');
      }
    } catch (err: any) {
      console.error('Değerlendirme gönderilirken hata:', err);
      setError(err.message || 'Değerlendirme gönderilirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Yıldız puanlama bileşeni
  const StarRating = () => {
    return (
      <div className="flex items-center mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setValue('rating', star)}
            className="text-2xl focus:outline-none"
          >
            <span className={`${watchRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>
              ★
            </span>
          </button>
        ))}
        {errors.rating && (
          <span className="ml-2 text-sm text-red-600">{errors.rating.message}</span>
        )}
      </div>
    );
  };

  // Yükleniyor durumu
  if (loading || authLoading) {
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

  // Ürün bulunamadıysa
  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold mb-4">Ürün Bulunamadı</h1>
            <p className="text-gray-600 mb-4">
              Değerlendirmek istediğiniz ürün bulunamadı veya kaldırılmış olabilir.
            </p>
            <Link href="/products" className="text-primary hover:underline">
              Ürünlere Geri Dön
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Ürün Değerlendirmesi</h1>
          
          {/* Başarı mesajı */}
          {submitSuccess && (
            <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
              Değerlendirmeniz başarıyla gönderildi. Onay sonrası yayınlanacaktır.
              Ürün sayfasına yönlendiriliyorsunuz...
            </div>
          )}
          
          {/* Hata mesajı */}
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          {/* Ürün bilgileri */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 relative flex-shrink-0">
                <Image
                  src={product.images[0] || '/placeholder.png'}
                  alt={product.name}
                  fill
                  sizes="80px"
                  className="object-cover rounded-md"
                />
              </div>
              <div>
                <h2 className="font-medium text-lg">{product.name}</h2>
                <p className="text-gray-600">{product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
              </div>
            </div>
          </div>
          
          {/* Değerlendirme formu */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium mb-4">Değerlendirmenizi Yazın</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Puan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Puan <span className="text-red-500">*</span>
                </label>
                <StarRating />
                <input
                  type="hidden"
                  {...register('rating', { valueAsNumber: true })}
                />
              </div>
              
              {/* Yorum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yorum <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('comment')}
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.comment ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Bu ürün hakkında düşüncelerinizi paylaşın..."
                ></textarea>
                {errors.comment && (
                  <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
                )}
              </div>
              
              {/* Form butonları */}
              <div className="pt-4 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push(`/products/${params.slug}`)}
                  disabled={isSubmitting}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                      Gönderiliyor...
                    </div>
                  ) : (
                    'Değerlendirmeyi Gönder'
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