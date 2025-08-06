'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { productService, activityService } from '@/services';
import { Product } from '@/types';

interface RecommendedProductsProps {
  title: string;
  type: 'popular' | 'related' | 'history' | 'frequently-bought-together';
  productId?: string;
  limit?: number;
}

const RecommendedProducts = ({
  title,
  type,
  productId,
  limit = 4,
}: RecommendedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      setLoading(true);
      try {
        let response;
        
        switch (type) {
          case 'popular':
            response = await activityService.getPopularProducts(limit);
            break;
          case 'related':
            if (!productId) {
              throw new Error('Product ID is required for related products');
            }
            response = await productService.getRelatedProducts(productId, limit);
            break;
          case 'history':
            // Kullanıcının gezinme geçmişine göre öneriler
            response = await activityService.getRecommendedProducts(limit);
            break;
          case 'frequently-bought-together':
            if (!productId) {
              throw new Error('Product ID is required for frequently bought together products');
            }
            response = await activityService.getFrequentlyBoughtTogether(productId, limit);
            break;
          default:
            response = await productService.getTopRatedProducts(limit);
        }
        
        setProducts(response.data || []);
      } catch (error) {
        console.error('Önerilen ürünler yüklenirken hata oluştu:', error);
        setError('Önerilen ürünler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedProducts();
  }, [type, productId, limit]);

  // Yükleniyor durumu
  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(limit)].map((_, i) => (
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
      </div>
    );
  }

  // Hata durumu
  if (error) {
    return null; // Hata durumunda bileşeni gösterme
  }

  // Ürün yoksa
  if (products.length === 0) {
    return null; // Ürün yoksa bileşeni gösterme
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;