'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { getAssetUrl } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/store';
import { addToCart, fetchCart } from '@/store/slices/cartSlice';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

const ProductCard = ({ product, viewMode = 'grid' }: ProductCardProps) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Oturum veya token yoksa login sayfasına yönlendir
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!isAuthenticated || !token) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname || '/')}`);
      return;
    }

    setIsAddingToCart(true);
    try {
      await dispatch(
        addToCart({
          product: product._id,
          quantity: 1,
          price: product.price,
        })
      ).unwrap();
      // Sunucudaki sepet durumunu eşitle
      await dispatch(fetchCart());
    } catch (err) {
      // Yetkisiz hata durumunda login'e yönlendir
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname || '/')}`);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex">
        <div className="relative h-40 w-40 flex-shrink-0 bg-gray-50">
          <Link href={`/products/${product.slug}`}>
            {product.images && product.images.length > 0 ? (
              <Image
                src={getAssetUrl(product.images[0])}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-500">Görsel yok</span>
              </div>
            )}
          </Link>
        </div>
        
        <div className="p-4 flex-grow flex flex-col">
          <div className="flex-grow">
            <Link href={`/products/${product.slug}`}>
              <h3 className="text-lg font-semibold hover:text-primary transition-colors mb-1 line-clamp-1">
                {product.name}
              </h3>
            </Link>
            
            <div className="flex items-center mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(product.averageRating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-1 text-xs text-gray-500">
                ({product.numReviews})
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
            
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {product.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {product.tags.length > 3 && (
                  <span className="text-xs text-gray-500">+{product.tags.length - 3}</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-bold text-[rgb(var(--primary))]">
                {product.price.toLocaleString('tr-TR')} ₺
              </p>
              {product.discount > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  {Math.round(product.price / (1 - product.discount / 100)).toLocaleString('tr-TR')} ₺
                </span>
              )}
            </div>
            <Button
              onClick={handleAddToCart}
              isLoading={isAddingToCart}
              disabled={product.stock <= 0}
              size="sm"
            >
              {product.stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
      <div className="relative">
        <Link href={`/products/${product.slug}`} className="block relative h-56 bg-gray-50">
          {product.images && product.images.length > 0 ? (
            <Image
              src={getAssetUrl(product.images[0])}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              style={{ height: '100%', width: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-500">Görsel yok</span>
            </div>
          )}
          
          <div className="absolute inset-x-0 top-0 p-2 flex justify-between items-start">
            {product.isFeatured && (
              <span className="bg-[rgb(var(--primary))] text-white text-[11px] px-2 py-0.5 rounded-full shadow-sm">
                Öne Çıkan
              </span>
            )}
            {product.discount > 0 && (
              <span className="bg-[rgb(var(--destructive))] text-white text-[11px] px-2 py-0.5 rounded-full shadow-sm ml-auto">
                %{product.discount} İndirim
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
          <h3 className="text-base font-semibold text-gray-900 hover:text-primary transition-colors mb-1 line-clamp-1">
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
            <span className="ml-auto text-xs text-orange-500">Son {product.stock} ürün</span>
          )}
          {product.stock <= 0 && (
            <span className="ml-auto text-xs text-red-500">Stokta yok</span>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-lg font-bold text-[rgb(var(--primary))]">
              {product.price.toLocaleString('tr-TR')} ₺
            </p>
            {product.discount > 0 && (
              <p className="text-sm text-gray-500 line-through">
                {Math.round(product.price / (1 - product.discount / 100)).toLocaleString('tr-TR')} ₺
              </p>
            )}
          </div>
          
          <Button
            onClick={handleAddToCart}
            isLoading={isAddingToCart}
            disabled={product.stock <= 0}
            size="sm"
            className={product.stock <= 0 ? 'bg-gray-300 hover:bg-gray-300 cursor-not-allowed' : 'bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary)/0.9)]'}
          >
            {product.stock > 0 ? (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Sepete Ekle
              </span>
            ) : 'Stokta Yok'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;