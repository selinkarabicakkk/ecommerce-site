'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/product/ProductCard';
import ProductFilter from '@/components/product/ProductFilter';
import { Button } from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { productService } from '@/services';
import { Product, ProductFilters } from '@/types';

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [filters, setFilters] = useState<ProductFilters>({
    category: searchParams.get('category') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
    search: searchParams.get('search') || undefined,
    sort: (searchParams.get('sort') as ProductFilters['sort']) || 'newest',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: 12,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await productService.getProducts(filters);
        setProducts(response.data || []);
        setTotalPages(response.pages || 1);
        setTotalProducts(response.total || 0);
        setCurrentPage(response.page || 1);
      } catch (error) {
        console.error('Ürünler yüklenirken hata oluştu:', error);
        setError('Ürünler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleSortChange = (sort: ProductFilters['sort']) => {
    setFilters((prev) => ({ ...prev, sort, page: 1 }));
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-end justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Ürünler</h1>
          {!loading && (
            <span className="text-sm text-gray-500">Toplam {totalProducts} ürün</span>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="hidden md:block text-sm text-gray-600">
            {loading ? 'Yükleniyor...' : `${totalProducts} sonuç görüntüleniyor`}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 border rounded-md p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded ${
                  viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
                aria-label="Grid görünümü"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded ${
                  viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
                aria-label="Liste görünümü"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <select
              value={filters.sort || 'newest'}
              onChange={(e) => handleSortChange(e.target.value as ProductFilters['sort'])}
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))]"
            >
              <option value="newest">En Yeniler</option>
              <option value="price">Fiyat (Artan)</option>
              <option value="price-desc">Fiyat (Azalan)</option>
              <option value="rating">Puana Göre</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <ProductFilter filters={filters} onFilterChange={handleFilterChange} />
          </div>

          <div className="lg:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ürün bulunamadı</h3>
                <p className="text-gray-500 mb-6">Arama kriterlerinize uygun ürün bulunamadı. Lütfen filtrelerinizi değiştirin.</p>
                <Button onClick={() => setFilters({ page: 1, limit: 12 })}>Tüm Filtreleri Temizle</Button>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} viewMode={viewMode} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}


