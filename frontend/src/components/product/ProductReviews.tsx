'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { reviewService } from '@/services';
import { Review } from '@/types';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store';

interface ProductReviewsProps {
  productId: string;
  productSlug: string;
}

export default function ProductReviews({ productId, productSlug }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // İncelemeleri yükle
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await reviewService.getReviewsByProduct(productId, page);
        if (response.success && response.data) {
          setReviews(response.data);
          setTotalPages(response.pages || 1);
        }
      } catch (err: any) {
        console.error('İncelemeler yüklenirken hata:', err);
        setError('İncelemeler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId, page]);

  // Tarih formatı
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Yıldız gösterimi
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Sayfalama
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Yükleniyor durumu
  if (loading && page === 1) {
    return (
      <div className="mt-12 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Müşteri Değerlendirmeleri</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Hata durumu
  if (error && !reviews.length) {
    return (
      <div className="mt-12 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Müşteri Değerlendirmeleri</h2>
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Müşteri Değerlendirmeleri</h2>
        {isAuthenticated && (
          <Link href={`/products/${productSlug}/review`}>
            <Button>Değerlendirme Yap</Button>
          </Link>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">Bu ürün için henüz değerlendirme bulunmuyor.</p>
          {isAuthenticated ? (
            <Link href={`/products/${productSlug}/review`} className="text-primary hover:underline mt-2 inline-block">
              İlk değerlendirmeyi siz yapın
            </Link>
          ) : (
            <Link href={`/auth/login?redirect=/products/${productSlug}/review`} className="text-primary hover:underline mt-2 inline-block">
              Değerlendirme yapmak için giriş yapın
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="mb-1">{renderStars(review.rating)}</div>
                    <h3 className="font-medium">
                      {typeof review.user === 'object' ? `${review.user.firstName} ${review.user.lastName.charAt(0)}.` : 'Kullanıcı'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 mt-2">{review.comment}</p>
              </div>
            ))}
          </div>

          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1 || loading}
                  className="px-3 py-1 rounded border border-gray-300 text-gray-600 disabled:opacity-50"
                >
                  Önceki
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    disabled={loading}
                    className={`px-3 py-1 rounded ${
                      page === i + 1
                        ? 'bg-primary text-white'
                        : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages || loading}
                  className="px-3 py-1 rounded border border-gray-300 text-gray-600 disabled:opacity-50"
                >
                  Sonraki
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}