'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getAssetUrl } from '@/lib/utils';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/product/ProductCard';
import ProductFilter from '@/components/product/ProductFilter';
import Pagination from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { categoryService, productService } from '@/services';
import { Category, Product, ProductFilters } from '@/types';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filtreler
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 12,
    sort: 'newest',
  });

  // Kategori ve ürünleri getir
  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      setLoading(true);
      try {
        if (typeof slug === 'string') {
          const categoryResponse = await categoryService.getCategoryBySlug(slug);
          setCategory(categoryResponse.data || null);

          if (categoryResponse.data?._id) {
            const productResponse = await productService.getProducts({
              ...filters,
              category: categoryResponse.data._id,
            });
            setProducts(productResponse.data || []);
            setTotalPages(productResponse.pages || 1);
            setTotalProducts(productResponse.total || 0);
            setCurrentPage(productResponse.page || 1);
          }
        }
      } catch (error) {
        console.error('Error while loading category or products:', error);
        setError('An error occurred while loading the category or products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [slug, filters]);

  // Sayfa değiştirme
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtreleri uygula
  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Sıralama değiştirme
  const handleSortChange = (sort: ProductFilters['sort']) => {
    setFilters((prev) => ({ ...prev, sort, page: 1 }));
  };

  if (error || (!loading && !category)) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || 'Category not found.'}
          </div>
          <div className="mt-6">
            <Link href="/categories">
              <Button>Back to Categories</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Home
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <Link href="/categories" className="text-gray-500 hover:text-gray-700">
            Categories
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-900">{category?.name || 'Loading...'}</span>
        </nav>

        {/* Kategori başlığı ve görseli */}
        {loading && !category ? (
          <div className="mb-8 animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          </div>
        ) : (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-3">{category?.name}</h1>
            <p className="text-gray-600">{category?.description}</p>
          </div>
        )}

        {/* Kategori görseli (anasayfadaki gibi net görünsün, overlay yok) */}
        {category?.image && (
          <div className="relative h-48 md:h-64 w-full mb-8 rounded-lg overflow-hidden">
            <Image
              src={getAssetUrl(category.image)}
              alt={category.name}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}

        {/* Üst bilgi ve sıralama */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600">
              {loading ? 'Loading...' : `${totalProducts} products found`}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Görünüm modu değiştirme */}
            <div className="flex items-center space-x-2 border rounded-md p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded ${
                  viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
                aria-label="Grid view"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded ${
                  viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
                aria-label="List view"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            {/* Sıralama seçenekleri */}
            <select
              value={filters.sort || 'newest'}
              onChange={(e) => handleSortChange(e.target.value as ProductFilters['sort'])}
              className="border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="newest">Newest</option>
              <option value="price">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtreler */}
          <div className="lg:w-1/4">
            <ProductFilter filters={filters} onFilterChange={handleFilterChange} />
          </div>

          {/* Ürün listesi */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
                  >
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">
                  There are no products in this category yet.
                </p>
              </div>
            ) : (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-6'
                  }
                >
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} viewMode={viewMode} />
                  ))}
                </div>

                {/* Sayfalama */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
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