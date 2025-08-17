'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAssetUrl } from '@/lib/utils';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import RecommendedProducts from '@/components/product/RecommendedProducts';
import { categoryService, productService, emailService } from '@/services';
import { Category, Product } from '@/types';

export default function Home() {
  const [featuredCategories, setFeaturedCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Kategorileri ve ürünleri yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data for homepage...');
        
        // Kategorileri getir
        const categoriesResponse = await categoryService.getCategories({
          isActive: true,
          limit: 4,
          sort: 'sortOrder'
        });
        
        console.log('Categories response in page:', categoriesResponse);
        
        if (categoriesResponse.success) {
          console.log('Categories data type:', typeof categoriesResponse.data);
          if (categoriesResponse.categories) {
            console.log('Found categories in response:', categoriesResponse.categories);
            setFeaturedCategories(categoriesResponse.categories);
          } else if (categoriesResponse.data) {
            console.log('Found data in response:', categoriesResponse.data);
            setFeaturedCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []);
          } else {
            console.warn('Categories data is not in expected format:', categoriesResponse);
            setFeaturedCategories([]);
          }
        } else {
          console.warn('Categories request was not successful:', categoriesResponse);
          setFeaturedCategories([]);
        }
        
        // Öne çıkan ürünleri getir
        const productsResponse = await productService.getFeaturedProducts(4);
        
        console.log('Products response in page:', productsResponse);
        
        if (productsResponse.success) {
          console.log('Products data type:', typeof productsResponse.data);
          if (productsResponse.products) {
            console.log('Found products in response:', productsResponse.products);
            setFeaturedProducts(productsResponse.products);
          } else if (productsResponse.data) {
            console.log('Found data in response:', productsResponse.data);
            setFeaturedProducts(Array.isArray(productsResponse.data) ? productsResponse.data : []);
          } else {
            console.warn('Products data is not in expected format:', productsResponse);
            setFeaturedProducts([]);
          }
        } else {
          console.warn('Products request was not successful:', productsResponse);
          setFeaturedProducts([]);
        }
      } catch (error) {
        console.error('Error while loading homepage data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="text-[rgb(var(--foreground))]">
        <div className="container mx-auto px-4 pt-0 pb-16 md:pb-24 lg:pb-32 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[rgb(var(--foreground))]">
              Your New Shopping Destination
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-600">
              Enjoy online shopping with thousands of products, great prices and fast delivery.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg">
                <Link href="/products">Start Shopping</Link>
              </Button>
              <Button variant="outline" size="lg">
                <Link href="/categories">Explore Categories</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 mt-10 md:mt-0">
            <div className="relative h-[28rem] md:h-[36rem] lg:h-[44rem] w-full">
              <Image
                src="/hero.png"
                alt="ShopZone Hero"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain object-top rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Popular Categories</h2>
          
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredCategories.map((category) => (
                <Link
                  key={category._id}
                  href={`/categories/${category.slug}`}
                  className="group flex flex-col items-center text-center bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-300"
                >
                  <div className="relative h-32 w-32 rounded-full overflow-hidden my-4 bg-gray-50 border-4 border-gray-50 shadow-sm">
                    {category.image ? (
                        <Image
                          src={getAssetUrl(category.image)}
                          alt={category.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 128px"
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-500">{category.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 w-full bg-white">
                    <h3 className="text-sm font-medium text-gray-800 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link href="/categories">
              <Button variant="outline" className="border-[rgb(var(--primary))] text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary)/0.05)]">
                All Categories
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>
          
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
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group"
                >
                  <div className="relative">
                    <Link href={`/products/${product.slug}`} className="block relative h-56 bg-gray-50">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={getAssetUrl(product.images[0])}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-gray-500">{product.name}</span>
                        </div>
                      )}
                      
                      <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-start">
                        {product.isFeatured && (
                          <span className="bg-[rgb(var(--primary))] text-white text-xs px-2 py-1 rounded-sm">
                            Featured
                          </span>
                        )}
                        
                        {product.discount > 0 && (
                          <span className="bg-[rgb(var(--destructive))] text-white text-xs px-2 py-1 rounded-sm ml-auto">
                            %{product.discount} Off
                          </span>
                        )}
                      </div>
                      
                      <button 
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-100"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Favorilere ekle işlemi
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </Link>
                  </div>
                  
                  <div className="p-4">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-base font-medium text-gray-800 hover:text-primary transition-colors mb-1 line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < Math.round(product.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-1 text-xs text-gray-500">({product.numReviews || 0})</span>
                      </div>
                      
                      {product.stock <= 5 && product.stock > 0 && (
                        <span className="ml-auto text-xs text-orange-500">Only {product.stock} left</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-lg font-bold text-[rgb(var(--primary))]">
                        {product.price.toLocaleString('en-US')} ₺
                      </p>
                      
                      <Button 
                        size="sm" 
                        className="bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary)/0.9)]"
                      >
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Add to Cart
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link href="/products">
              <Button variant="outline" className="border-[rgb(var(--primary))] text-[rgb(var(--primary))] hover:bg-[rgb(var(--primary)/0.05)]">
                All Products
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Popüler Ürünler (Öneri Sistemi) */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <RecommendedProducts 
            title="Popular Products" 
            type="popular" 
            limit={4} 
          />
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSection />
    </MainLayout>
  );
}

function NewsletterSection() {
  'use client';
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email) return;
    setStatus('sending');
    try {
      await emailService.newsletter(email);
      setStatus('success');
      setMessage('Subscription successful.');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'An error occurred');
    }
  };

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to our Newsletter</h2>
          <p className="text-lg text-gray-600 mb-8">
            Stay informed about the latest products, discounts and campaigns by subscribing to our newsletter.
          </p>
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Button disabled={status === 'sending'} type="submit">{status === 'sending' ? 'Sending...' : 'Subscribe'}</Button>
          </form>
          {status === 'success' && <p className="text-green-600 mt-3">{message}</p>}
          {status === 'error' && <p className="text-red-600 mt-3">{message}</p>}
        </div>
      </div>
    </section>
  );
}