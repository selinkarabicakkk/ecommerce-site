'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store';
import { activityService, productService } from '@/services';
import { Product } from '@/types';

export default function RecommendationsPage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        // Popüler ürünleri getir
        const popularResponse = await productService.getTopRatedProducts(8);
        setPopularProducts(popularResponse.data || []);

        if (isAuthenticated) {
          // Kullanıcıya özel öneriler
          try {
            const recommendedResponse = await activityService.getRecommendedProducts(8);
            
            // API'den gelen ürün ID'leri ile ürün detaylarını getir
            if (recommendedResponse.data && recommendedResponse.data.length > 0) {
              const productIds = recommendedResponse.data.map((item: any) => item.productId);
              const productsPromises = productIds.map((id: string) => 
                productService.getProductById(id).then(res => res.data)
              );
              
              const products = await Promise.all(productsPromises);
              setRecommendedProducts(products.filter(Boolean));
            }
            
            // Kullanıcının son görüntülediği ürünler
            const activitiesResponse = await activityService.getUserActivities();
            if (activitiesResponse.data && activitiesResponse.data.length > 0) {
              // Görüntüleme aktivitelerini filtrele ve en son 4 tanesini al
              const viewActivities = activitiesResponse.data
                .filter(activity => activity.activityType === 'view')
                .slice(0, 4);
              
              // Ürün detaylarını getir
              const viewedProductIds = viewActivities.map(activity => 
                typeof activity.product === 'string' ? activity.product : activity.product._id
              );
              
              const viewedProductsPromises = viewedProductIds.map(id => 
                productService.getProductById(id).then(res => res.data)
              );
              
              const viewedProducts = await Promise.all(viewedProductsPromises);
              setRecentlyViewedProducts(viewedProducts.filter(Boolean));
            }
          } catch (error) {
            console.error('Kişiselleştirilmiş öneriler alınırken hata oluştu:', error);
            // Hata durumunda yeni ürünleri göster
            const newArrivalsResponse = await productService.getNewArrivals(8);
            setRecommendedProducts(newArrivalsResponse.data || []);
          }
        } else {
          // Kullanıcı giriş yapmamışsa, öne çıkan ürünleri göster
          const featuredResponse = await productService.getFeaturedProducts(8);
          setRecommendedProducts(featuredResponse.data || []);
        }
      } catch (error) {
        console.error('Öneriler yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [isAuthenticated]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Sizin İçin Öneriler</h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
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
        ) : (
          <>
            {/* Kişiselleştirilmiş öneriler */}
            {recommendedProducts.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">
                  {isAuthenticated
                    ? 'Sizin İçin Seçtiklerimiz'
                    : 'Öne Çıkan Ürünler'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendedProducts.slice(0, 8).map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Son görüntülenen ürünler */}
            {isAuthenticated && recentlyViewedProducts.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Son Görüntülediğiniz Ürünler</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recentlyViewedProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Popüler ürünler */}
            {popularProducts.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Popüler Ürünler</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {popularProducts.slice(0, 8).map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Giriş yapmamış kullanıcılar için çağrı */}
            {!isAuthenticated && (
              <div className="bg-gray-50 rounded-lg p-6 text-center mt-8">
                <h3 className="text-lg font-semibold mb-2">Kişiselleştirilmiş Öneriler</h3>
                <p className="text-gray-600 mb-4">
                  Alışveriş alışkanlıklarınıza göre size özel öneriler almak için giriş yapın.
                </p>
                <Button href="/auth/login">Giriş Yap</Button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}