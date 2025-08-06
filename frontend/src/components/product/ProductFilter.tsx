'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { categoryService } from '@/services';
import { Category, ProductFilters } from '@/types';

interface ProductFilterProps {
  filters: ProductFilters;
  onFilterChange: (filters: Partial<ProductFilters>) => void;
}

const ProductFilter = ({ filters, onFilterChange }: ProductFilterProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || 0,
    max: filters.maxPrice || 10000,
  });
  const [selectedRating, setSelectedRating] = useState<number | undefined>(filters.rating);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Kategorileri getir
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await categoryService.getCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Kategoriler yüklenirken hata oluştu:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fiyat aralığı değişikliğini uygula
  const handlePriceRangeApply = () => {
    onFilterChange({
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
    });
  };

  // Kategori değişikliği
  const handleCategoryChange = (categoryId: string | undefined) => {
    onFilterChange({ category: categoryId });
  };

  // Puan değişikliği
  const handleRatingChange = (rating: number | undefined) => {
    setSelectedRating(rating);
    onFilterChange({ rating });
  };

  // Tüm filtreleri temizle
  const handleClearFilters = () => {
    setPriceRange({ min: 0, max: 10000 });
    setSelectedRating(undefined);
    onFilterChange({
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      rating: undefined,
      tags: undefined,
      page: 1,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Filtreler</h2>
        <button
          className="lg:hidden text-gray-500"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls="filter-panel"
        >
          {isExpanded ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>

      <div
        id="filter-panel"
        className={`space-y-6 ${isExpanded ? 'block' : 'hidden lg:block'}`}
      >
        {/* Kategoriler */}
        <div>
          <h3 className="font-medium mb-3">Kategoriler</h3>
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  id="category-all"
                  type="radio"
                  name="category"
                  checked={!filters.category}
                  onChange={() => handleCategoryChange(undefined)}
                  className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                />
                <label htmlFor="category-all" className="ml-2 text-sm text-gray-700">
                  Tüm Kategoriler
                </label>
              </div>
              {categories.map((category) => (
                <div key={category._id} className="flex items-center">
                  <input
                    id={`category-${category._id}`}
                    type="radio"
                    name="category"
                    checked={filters.category === category._id}
                    onChange={() => handleCategoryChange(category._id)}
                    className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <label
                    htmlFor={`category-${category._id}`}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fiyat Aralığı */}
        <div>
          <h3 className="font-medium mb-3">Fiyat Aralığı</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div>
                <label htmlFor="min-price" className="text-xs text-gray-500">
                  Min (₺)
                </label>
                <input
                  id="min-price"
                  type="number"
                  min="0"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="max-price" className="text-xs text-gray-500">
                  Max (₺)
                </label>
                <input
                  id="max-price"
                  type="number"
                  min="0"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 0 })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <Button onClick={handlePriceRangeApply} size="sm" className="w-full">
              Uygula
            </Button>
          </div>
        </div>

        {/* Puan */}
        <div>
          <h3 className="font-medium mb-3">Puan</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center">
                <input
                  id={`rating-${rating}`}
                  type="radio"
                  name="rating"
                  checked={selectedRating === rating}
                  onChange={() => handleRatingChange(rating)}
                  className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                />
                <label htmlFor={`rating-${rating}`} className="ml-2 flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${
                          i < rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-1 text-sm text-gray-700">ve üzeri</span>
                </label>
              </div>
            ))}
            {selectedRating && (
              <div className="flex items-center">
                <input
                  id="rating-all"
                  type="radio"
                  name="rating"
                  checked={!selectedRating}
                  onChange={() => handleRatingChange(undefined)}
                  className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                />
                <label htmlFor="rating-all" className="ml-2 text-sm text-gray-700">
                  Tümü
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Filtreleri Temizle */}
        <div className="pt-2">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="w-full"
          >
            Filtreleri Temizle
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;