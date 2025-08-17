'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import SearchBar from '@/components/ui/SearchBar';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { productService } from '@/services';
import { Product } from '@/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Arama sonuçlarını getir
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) return;
      
      setLoading(true);
      try {
        const response = await productService.getProducts({
          search: query,
          page,
          limit: 12,
        });
        
        if (response.success && response.data) {
          setProducts(response.data);
          setTotalPages(response.pages || 1);
        } else {
          setProducts([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Error while loading search results:', error);
        setError('An error occurred while loading search results');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSearchResults();
  }, [query, page]);
  
  // Arama işlemi
  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    setPage(1);
  };
  
  // Sayfa değiştirme
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Product Search</h1>
        
        {/* Arama çubuğu */}
        <div className="mb-8">
          <SearchBar 
            className="max-w-2xl mx-auto"
            placeholder="What are you looking for?"
            onSearch={handleSearch}
          />
        </div>
        
        {/* Sonuç başlığı */}
        {query && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              {loading ? 'Searching...' : `Search results for "${query}"`}
            </h2>
            {!loading && products.length > 0 && (
              <p className="text-gray-500 mt-1">
                {products.length} results found
              </p>
            )}
          </div>
        )}
        
        {/* Hata mesajı */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* Yükleniyor */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            {/* Ürün listesi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            
            {/* Sayfalama */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={page === i + 1 ? 'default' : 'outline'}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : query ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-medium mb-2">No results found</h3>
            <p className="text-gray-500 mb-6">
              No results for "{query}". Please try different keywords.
            </p>
            <div className="flex justify-center">
              <Button onClick={() => setQuery('')}>Clear Search</Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-medium mb-2">Use the search bar above to start searching</h3>
            <p className="text-gray-500">
              You can search by product name, description or category.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}