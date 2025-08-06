'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { productService } from '@/services';
import { Product } from '@/types';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  maxResults?: number;
}

const SearchBar = ({
  className = '',
  placeholder = 'Ürün ara...',
  onSearch,
  maxResults = 5,
}: SearchBarProps) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklandığında sonuçları kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Arama sorgusu değiştiğinde ürünleri getir
  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await productService.getProducts({
          search: query,
          limit: maxResults,
        });

        if (response.success && response.data) {
          setResults(response.data);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Arama sonuçları yüklenirken hata:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce işlemi
    const timer = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(timer);
  }, [query, maxResults]);

  // Form gönderme
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        router.push(`/products?search=${encodeURIComponent(query)}`);
      }
      setShowResults(false);
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <button
          type="submit"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <span className="text-sm font-medium text-primary">Ara</span>
        </button>
      </form>

      {/* Arama sonuçları dropdown */}
      {showResults && (query.trim().length >= 2) && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-4 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : results.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto">
              {results.map((product) => (
                <li key={product._id} className="border-b last:border-b-0">
                  <Link
                    href={`/products/${product.slug}`}
                    className="block hover:bg-gray-50 p-3"
                    onClick={() => setShowResults(false)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="40px"
                            className="object-cover rounded"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">Görsel yok</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                        <p className="text-sm text-primary">{product.price.toLocaleString('tr-TR')} ₺</p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              Sonuç bulunamadı
            </div>
          )}
          
          {/* Tüm sonuçları göster bağlantısı */}
          {results.length > 0 && (
            <div className="p-2 bg-gray-50 border-t">
              <Link
                href={`/products?search=${encodeURIComponent(query)}`}
                className="block text-center text-sm text-primary hover:underline"
                onClick={() => setShowResults(false)}
              >
                Tüm sonuçları göster
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;