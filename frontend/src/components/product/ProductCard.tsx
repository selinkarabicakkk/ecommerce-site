'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAppDispatch } from '@/store';
import { addToCart } from '@/store/slices/cartSlice';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

const ProductCard = ({ product, viewMode = 'grid' }: ProductCardProps) => {
  const dispatch = useAppDispatch();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAddingToCart(true);
    
    dispatch(
      addToCart({
        product: product._id,
        quantity: 1,
        price: product.price,
      })
    );
    
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 1000);
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex">
        <div className="relative h-40 w-40 flex-shrink-0 bg-gray-100">
          <Link href={`/products/${product.slug}`}>
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
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
              <h3 className="text-lg font-semibold hover:text-primary transition-colors mb-2">
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
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
            
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {product.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded"
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
            <p className="text-lg font-bold text-primary">
              {product.price.toLocaleString('tr-TR')} ₺
            </p>
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/products/${product.slug}`} className="block relative h-48 bg-gray-100">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
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
        
        {product.isFeatured && (
          <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
            Öne Çıkan
          </span>
        )}
      </Link>
      
      <div className="p-4">
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
                  i < Math.round(product.averageRating) ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="ml-1 text-xs text-gray-500">({product.numReviews})</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-lg font-bold text-primary">
            {product.price.toLocaleString('tr-TR')} ₺
          </p>
        </div>
        
        <div className="mt-3">
          <Button
            onClick={handleAddToCart}
            isLoading={isAddingToCart}
            disabled={product.stock <= 0}
            className="w-full"
          >
            {product.stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;