'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store';

// İnceleme tipi
interface Review {
  _id: string;
  product: {
    _id: string;
    name: string;
    image?: string;
  };
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  
  // Örnek veri (normalde API'den gelecek)
  const mockReviews: Review[] = [
    {
      _id: 'rev1',
      product: {
        _id: 'prod1',
        name: 'Akıllı Telefon',
        image: 'phone.jpg',
      },
      user: {
        _id: 'user1',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        email: 'ahmet@example.com',
      },
      rating: 5,
      comment: 'Harika bir ürün, çok memnunum. Hızlı teslimat için teşekkürler.',
      isApproved: false,
      createdAt: '2023-07-15T10:30:00Z',
    },
    {
      _id: 'rev2',
      product: {
        _id: 'prod2',
        name: 'Kablosuz Kulaklık',
        image: 'headphones.jpg',
      },
      user: {
        _id: 'user2',
        firstName: 'Ayşe',
        lastName: 'Demir',
        email: 'ayse@example.com',
      },
      rating: 4,
      comment: 'Ses kalitesi çok iyi, ancak batarya biraz daha uzun ömürlü olabilirdi.',
      isApproved: true,
      createdAt: '2023-07-10T14:20:00Z',
    },
    {
      _id: 'rev3',
      product: {
        _id: 'prod3',
        name: 'Laptop',
        image: 'laptop.jpg',
      },
      user: {
        _id: 'user3',
        firstName: 'Mehmet',
        lastName: 'Kaya',
        email: 'mehmet@example.com',
      },
      rating: 2,
      comment: 'Beklediğim kadar iyi değildi. İşlemci çok ısınıyor ve fan sesi rahatsız edici.',
      isApproved: false,
      createdAt: '2023-07-05T09:15:00Z',
    },
    {
      _id: 'rev4',
      product: {
        _id: 'prod4',
        name: 'Akıllı Saat',
        image: 'smartwatch.jpg',
      },
      user: {
        _id: 'user4',
        firstName: 'Zeynep',
        lastName: 'Çelik',
        email: 'zeynep@example.com',
      },
      rating: 5,
      comment: 'Çok şık ve kullanışlı. Spor yaparken kullanmak için ideal.',
      isApproved: true,
      createdAt: '2023-06-28T16:45:00Z',
    },
    {
      _id: 'rev5',
      product: {
        _id: 'prod5',
        name: 'Tablet',
        image: 'tablet.jpg',
      },
      user: {
        _id: 'user5',
        firstName: 'Ali',
        lastName: 'Öztürk',
        email: 'ali@example.com',
      },
      rating: 1,
      comment: 'Ürün açıklamasında belirtilen özelliklere sahip değil. Çok yavaş çalışıyor ve donuyor.',
      isApproved: false,
      createdAt: '2023-06-20T11:30:00Z',
    },
  ];

  // İncelemeleri getir
  const fetchReviews = async (page = 1, search = '', status = 'pending') => {
    setIsLoading(true);
    try {
      // Burada normalde API çağrısı olacak
      // const response = await reviewService.getReviews({
      //   page,
      //   limit: 10,
      //   search,
      //   status,
      // });
      
      // Mock veri kullan
      setTimeout(() => {
        let filteredReviews = [...mockReviews];
        
        // Durum filtresi
        if (status === 'pending') {
          filteredReviews = filteredReviews.filter((review) => !review.isApproved);
        } else if (status === 'approved') {
          filteredReviews = filteredReviews.filter((review) => review.isApproved);
        }
        
        // Arama filtresi
        if (search) {
          const searchLower = search.toLowerCase();
          filteredReviews = filteredReviews.filter(
            (review) =>
              review.product.name.toLowerCase().includes(searchLower) ||
              review.comment.toLowerCase().includes(searchLower) ||
              `${review.user.firstName} ${review.user.lastName}`.toLowerCase().includes(searchLower)
          );
        }
        
        setReviews(filteredReviews);
        setTotalPages(1); // Mock veri için 1 sayfa
        setCurrentPage(page);
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError('İncelemeler yüklenirken bir hata oluştu.');
      console.error('İncelemeler yüklenirken hata:', err);
      setIsLoading(false);
    }
  };

  // Sayfa yüklendiğinde incelemeleri getir
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/admin/reviews');
      } else if (user?.role !== 'admin') {
        router.push('/');
      } else {
        fetchReviews(currentPage, searchQuery, statusFilter);
      }
    }
  }, [isAuthenticated, loading, router, user]);

  // Arama işlemi
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReviews(1, searchQuery, statusFilter);
  };

  // Durum filtresi değiştiğinde
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    fetchReviews(1, searchQuery, newStatus);
  };

  // Sayfa değiştirme
  const handlePageChange = (page: number) => {
    fetchReviews(page, searchQuery, statusFilter);
  };

  // İnceleme seçme
  const handleSelectReview = (reviewId: string) => {
    setSelectedReviews((prev) => {
      if (prev.includes(reviewId)) {
        return prev.filter((id) => id !== reviewId);
      } else {
        return [...prev, reviewId];
      }
    });
  };

  // Tüm incelemeleri seç/kaldır
  const handleSelectAll = () => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.map((review) => review._id));
    }
  };

  // İnceleme onaylama/reddetme
  const handleApproveReview = async (reviewId: string, approve: boolean) => {
    try {
      // Burada normalde API çağrısı olacak
      // await reviewService.approveReview(reviewId, approve);
      
      // Mock veri güncelle
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review._id === reviewId
            ? { ...review, isApproved: approve }
            : review
        )
      );
    } catch (err) {
      setError('İnceleme güncellenirken bir hata oluştu.');
      console.error('İnceleme güncelleme hatası:', err);
    }
  };

  // Seçili incelemeleri toplu onaylama/reddetme
  const handleBulkApprove = async (approve: boolean) => {
    if (selectedReviews.length === 0) return;
    
    try {
      // Burada normalde bir bulk update API çağrısı olabilir
      // Şimdilik her incelemeyi tek tek güncelliyoruz
      for (const reviewId of selectedReviews) {
        // await reviewService.approveReview(reviewId, approve);
      }
      
      // Mock veri güncelle
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          selectedReviews.includes(review._id)
            ? { ...review, isApproved: approve }
            : review
        )
      );
      
      setSelectedReviews([]);
      
      // Onaylandıktan sonra filtreye göre yeniden yükle
      fetchReviews(currentPage, searchQuery, statusFilter);
    } catch (err) {
      setError('İncelemeler güncellenirken bir hata oluştu.');
      console.error('Toplu güncelleme hatası:', err);
    }
  };

  // Tarihi formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Yıldız gösterimi
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Yükleniyor durumu
  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">İnceleme Yönetimi</h1>
        </div>

        {/* Arama ve filtreler */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Ürün adı, yorum içeriği veya müşteri adı ara..."
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Tüm İncelemeler</option>
                <option value="pending">Onay Bekleyenler</option>
                <option value="approved">Onaylananlar</option>
              </select>
            </div>
            <div>
              <Button type="submit">Ara</Button>
            </div>
          </form>
        </div>

        {/* Toplu işlemler */}
        {selectedReviews.length > 0 && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <span>{selectedReviews.length} inceleme seçildi</span>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setSelectedReviews([])}>
                Seçimi Temizle
              </Button>
              <Button variant="success" onClick={() => handleBulkApprove(true)}>
                Seçilenleri Onayla
              </Button>
              <Button variant="destructive" onClick={() => handleBulkApprove(false)}>
                Seçilenleri Reddet
              </Button>
            </div>
          </div>
        )}

        {/* Hata mesajı */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* İnceleme tablosu */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              İnceleme bulunamadı.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedReviews.length === reviews.length && reviews.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ürün
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Değerlendirme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reviews.map((review) => (
                    <tr key={review._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedReviews.includes(review._id)}
                          onChange={() => handleSelectReview(review._id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {review.product.image && (
                            <div className="h-10 w-10 bg-gray-200 rounded-md mr-3">
                              <img
                                src={`/uploads/${review.product.image}`}
                                alt={review.product.name}
                                className="h-10 w-10 object-cover rounded-md"
                              />
                            </div>
                          )}
                          <div className="font-medium text-gray-900">
                            <Link
                              href={`/admin/products/${review.product._id}`}
                              className="hover:text-indigo-600"
                            >
                              {review.product.name}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {review.user.firstName} {review.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{review.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="mb-1">{renderStars(review.rating)}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {review.comment}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            review.isApproved
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {review.isApproved ? 'Onaylandı' : 'Onay Bekliyor'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {review.isApproved ? (
                            <button
                              onClick={() => handleApproveReview(review._id, false)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reddet
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApproveReview(review._id, true)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Onayla
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sayfalama */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Önceki
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 border rounded-md ${
                    currentPage === page
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}