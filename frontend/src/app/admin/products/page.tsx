'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store';
import { productService, categoryService } from '@/services';
import { Product } from '@/types';
import { getAssetUrl } from '@/lib/utils';

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'normal'>('all');
  const [assignCategoryId, setAssignCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Array<{_id: string, name: string}>>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  
  // Ürünleri getir
  const fetchProducts = async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      const response = await productService.getProducts({
        page,
        limit: 10,
        search,
        featured: featuredFilter === 'featured' ? true : featuredFilter === 'normal' ? false : undefined,
      });
      
      const list = (response as any)?.products || (response as any)?.data || [];
      const count = (response as any)?.count || (response as any)?.totalCount || list.length;
      setProducts(list);
      setTotalPages(Math.max(1, Math.ceil(count / 10)));
      setCurrentPage(page);
      setTotalCount(count);
    } catch (err) {
      setError('Ürünler yüklenirken bir hata oluştu.');
      console.error('Ürünler yüklenirken hata:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sayfa yüklendiğinde ürünleri getir
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/admin/products');
      } else if (user?.role !== 'admin') {
        router.push('/');
      } else {
        fetchProducts();
        // Kategorileri getir
        const fetchCategories = async () => {
          try {
            const response = await categoryService.getCategories({ limit: 100 });
            const categoryList = (response as any)?.categories || [];
            setCategories(categoryList);
          } catch (err) {
            console.error('Kategoriler yüklenirken hata:', err);
          }
        };
        fetchCategories();
      }
    }
  }, [isAuthenticated, loading, router, user]);

  // Arama işlemi
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(1, searchQuery);
  };

  // Sayfa değiştirme
  const handlePageChange = (page: number) => {
    fetchProducts(page, searchQuery);
  };

  // Ürün seçme
  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Tüm ürünleri seç/kaldır
  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((product) => product._id));
    }
  };

  // Ürün silme
  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      try {
        await productService.deleteProduct(productId);
        fetchProducts(currentPage, searchQuery);
      } catch (err) {
        setError('Ürün silinirken bir hata oluştu.');
        console.error('Ürün silme hatası:', err);
      }
    }
  };

  // Seçili ürünleri toplu silme
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    if (window.confirm(`${selectedProducts.length} ürünü silmek istediğinize emin misiniz?`)) {
      try {
        // Burada normalde bir bulk delete API çağrısı olabilir
        // Şimdilik her ürünü tek tek siliyoruz
        for (const productId of selectedProducts) {
          await productService.deleteProduct(productId);
        }
        setSelectedProducts([]);
        fetchProducts(currentPage, searchQuery);
      } catch (err) {
        setError('Ürünler silinirken bir hata oluştu.');
        console.error('Toplu silme hatası:', err);
      }
    }
  };

  // Toplu aktif/pasif veya öne çıkarma
  const handleBulkUpdate = async (payload: { isActive?: boolean; isFeatured?: boolean }) => {
    if (selectedProducts.length === 0) return;
    setBulkLoading(true);
    try {
      const items = selectedProducts.map((id) => ({ id, ...payload }));
      await productService.bulkUpdateProducts(items);
      setSelectedProducts([]);
      fetchProducts(currentPage, searchQuery);
    } catch (err) {
      setError('Toplu güncelleme sırasında hata oluştu.');
      console.error('Toplu güncelleme hatası:', err);
    } finally {
      setBulkLoading(false);
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

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Ürün Yönetimi</h1>
          <Button>
            <Link href="/admin/products/new">Yeni Ürün Ekle</Link>
          </Button>
        </div>

        {/* Arama ve filtreler */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-3 items-center justify-between">
            <div className="flex gap-2 flex-1">
              <input
                type="text"
                placeholder="Ürün ara..."
                className="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-md text-sm"
                aria-label="Öne çıkan filtresi"
              >
                <option value="all">Hepsi</option>
                <option value="featured">Öne Çıkan</option>
                <option value="normal">Normal</option>
              </select>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-md text-sm"
                aria-label="Stok filtresi"
              >
                <option value="all">Tüm Stoklar</option>
                <option value="in-stock">Stokta</option>
                <option value="out-of-stock">Tükendi</option>
              </select>
              <Button type="submit">Ara</Button>
            </div>
            <span className="text-sm text-gray-500 whitespace-nowrap ml-4">Toplam {totalCount} kayıt</span>
          </form>
        </div>

        {/* Toplu işlemler */}
        {selectedProducts.length > 0 && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6 flex justify-between items-center">
            <span>{selectedProducts.length} ürün seçildi</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedProducts([])}>
                Seçimi Temizle
              </Button>
              <Button variant="outline" disabled={bulkLoading} onClick={() => handleBulkUpdate({ isActive: true })}>
                Aktif Yap
              </Button>
              <Button variant="outline" disabled={bulkLoading} onClick={() => handleBulkUpdate({ isActive: false })}>
                Pasif Yap
              </Button>
              <Button variant="outline" disabled={bulkLoading} onClick={() => handleBulkUpdate({ isFeatured: true })}>
                Öne Çıkar
              </Button>
              <Button variant="outline" disabled={bulkLoading} onClick={() => handleBulkUpdate({ isFeatured: false })}>
                Öne Çıkarmayı Kaldır
              </Button>
              <div className="flex items-center gap-2">
                <select
                  value={assignCategoryId}
                  onChange={(e) => setAssignCategoryId(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm w-48"
                >
                  <option value="">Kategori seçin...</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  disabled={bulkLoading || !assignCategoryId}
                  onClick={async () => {
                    if (!assignCategoryId) return;
                    setBulkLoading(true);
                    try {
                      const items = selectedProducts.map((id) => ({ id, category: assignCategoryId }));
                      await productService.bulkUpdateProducts(items as any);
                      setSelectedProducts([]);
                      setAssignCategoryId('');
                      fetchProducts(currentPage, searchQuery);
                    } finally {
                      setBulkLoading(false);
                    }
                  }}
                >
                  Kategori Ata
                </Button>
              </div>
              <Button variant="destructive" onClick={handleBulkDelete}>
                Seçilenleri Sil
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

        {/* Ürün tablosu */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Ürün bulunamadı.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === products.length && products.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ürün
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiyat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok
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
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => handleSelectProduct(product._id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-200 rounded-md mr-3">
                            {product.images && product.images.length > 0 && (
                              <img
                                src={getAssetUrl(product.images[0])}
                                alt={product.name}
                                className="h-10 w-10 object-cover rounded-md"
                              />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.price.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.stock < 10
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.isFeatured
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {product.isFeatured ? 'Öne Çıkan' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/admin/products/${product._id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Düzenle
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Sil
                          </button>
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