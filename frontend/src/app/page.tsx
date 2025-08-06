'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import RecommendedProducts from '@/components/product/RecommendedProducts';
import { categoryService, productService } from '@/services';
import { Category, Product } from '@/types';

export default function Home() {
  const [featuredCategories, setFeaturedCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Kategorileri ve ürünleri yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Kategorileri getir
        const categoriesResponse = await categoryService.getCategories({
          isActive: true,
          limit: 4,
          sort: 'sortOrder'
        });
        
        if (categoriesResponse.success && categoriesResponse.data) {
          setFeaturedCategories(categoriesResponse.data);
        }
        
        // Öne çıkan ürünleri getir
        const productsResponse = await productService.getFeaturedProducts(4);
        
        if (productsResponse.success && productsResponse.data) {
          setFeaturedProducts(productsResponse.data);
        }
      } catch (error) {
        console.error('Ana sayfa verileri yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-primary text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Alışverişin Yeni Adresi
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Binlerce ürün, uygun fiyatlar ve hızlı teslimat ile online alışverişin keyfini çıkarın.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg">
                <Link href="/products">Alışverişe Başla</Link>
              </Button>
              <Button variant="outline" size="lg">
                <Link href="/categories">Kategorileri Keşfet</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 mt-10 md:mt-0">
            <div className="relative h-64 md:h-80 lg:h-96 w-full">
              {/* Placeholder for hero image */}
              <div className="absolute inset-0 bg-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Hero Image</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Popüler Kategoriler</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCategories.map((category) => (
                <Link
                  key={category._id}
                  href={`/categories/${category.slug}`}
                  className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative h-48 w-full bg-gray-200">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-500">{category.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="text-center mt-10">
            <Button variant="outline">
              <Link href="/categories">Tüm Kategoriler</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Öne Çıkan Ürünler</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <Link href={`/products/${product.slug}`}>
                    <div className="relative h-48 w-full bg-gray-200">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-gray-500">{product.name}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-gray-500 mt-1">{product.price.toLocaleString('tr-TR')} ₺</p>
                    <div className="mt-4">
                      <Button className="w-full">Sepete Ekle</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-10">
            <Button variant="outline">
              <Link href="/products">Tüm Ürünler</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Popüler Ürünler (Öneri Sistemi) */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <RecommendedProducts 
            title="Popüler Ürünler" 
            type="popular" 
            limit={4} 
          />
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Bültenimize Abone Olun</h2>
            <p className="text-lg text-gray-600 mb-8">
              En son ürünler, indirimler ve kampanyalardan haberdar olmak için bültenimize abone
              olun.
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-grow px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button>Abone Ol</Button>
            </form>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}