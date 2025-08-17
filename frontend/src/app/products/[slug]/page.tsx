'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { getAssetUrl } from '@/lib/utils';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import ProductReviews from '@/components/product/ProductReviews';
import RecommendedProducts from '@/components/product/RecommendedProducts';
import { productService } from '@/services';
import { useAppDispatch, useAppSelector } from '@/store';
import { addToCart, fetchCart } from '@/store/slices/cartSlice';
import { Product } from '@/types';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        if (typeof slug === 'string') {
          const response = await productService.getProductBySlug(slug);
          setProduct(response.data || null);
        }
      } catch (error) {
        console.error('Error while loading product details:', error);
        setError('An error occurred while loading product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [slug]);

  // Sepete ekle
  const handleAddToCart = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!isAuthenticated || !token) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname || '/')}`);
      return;
    }
    if (product) {
      await dispatch(
        addToCart({
          product: product._id,
          quantity,
          price: product.price,
        })
      ).unwrap();
      await dispatch(fetchCart());
    }
  };

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= (product?.stock || 10)) {
      setQuantity(value);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || 'Product not found.'}
          </div>
          <div className="mt-6">
            <Link href="/products">
              <Button>Back to Products</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <nav className="flex mb-6 text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Home
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <Link href="/products" className="text-gray-500 hover:text-gray-700">
            Products
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <Link
            href={`/categories/${product.category.slug}`}
            className="text-gray-500 hover:text-gray-700"
          >
            {product.category.name}
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <div className="relative h-80 md:h-96 w-full mb-4 bg-gray-100 rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={getAssetUrl(product.images[selectedImage])}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-500">No product image</span>
                </div>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-16 w-full bg-gray-100 rounded overflow-hidden ${
                      selectedImage === index
                        ? 'ring-2 ring-primary'
                        : 'hover:ring-2 hover:ring-gray-300'
                    }`}
                  >
                    <Image
                      src={getAssetUrl(image)}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 20vw, 10vw"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="md:w-1/2">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-[rgb(var(--foreground))]">{product.name}</h1>

            <div className="flex items-center mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-5 w-5 ${
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
              <span className="ml-2 text-gray-600">
                {product.averageRating.toFixed(1)} ({product.numReviews} reviews)
              </span>
            </div>

            <div className="mb-6 flex items-center gap-3">
              <span className="text-3xl font-bold text-[rgb(var(--primary))]">
                {product.price.toLocaleString('en-US')} ₺
              </span>
              {product.discount > 0 && (
                <span className="text-base text-gray-500 line-through">
                  {Math.round(product.price / (1 - product.discount / 100)).toLocaleString('en-US')} ₺
                </span>
              )}
              {product.discount > 0 && (
                <span className="text-xs bg-[rgb(var(--destructive))] text-white px-2 py-0.5 rounded-full">
                  %{product.discount} off
                </span>
              )}
              {product.stock > 0 ? (
                <span className="ml-2 inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                  In Stock
                </span>
              ) : (
                <span className="ml-2 inline-block bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Product Description</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Specifications</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-3 gap-4">
                        <dt className="text-sm font-medium text-gray-500">{key}</dt>
                        <dd className="text-sm text-gray-900 col-span-2">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center mb-4">
                <button
                  aria-label="Decrease"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-l-md border border-gray-300 flex items-center justify-center bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-16 h-10 text-sm border-t border-b border-gray-300 text-center [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  aria-label="Increase"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock}
                  className="w-10 h-10 rounded-r-md border border-gray-300 flex items-center justify-center bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  +
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full md:w-auto"
                size="lg"
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold mb-2">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/products?tags=${tag}`}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-3 py-1 rounded-full"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {product && <RecommendedProducts title="Related Products" type="related" productId={product._id} limit={4} />}
        {product && <RecommendedProducts title="Frequently Bought Together" type="frequently-bought-together" productId={product._id} limit={4} />}
        
        {product && <ProductReviews productId={product._id} productSlug={product.slug} />}
      </div>
    </MainLayout>
  );
}