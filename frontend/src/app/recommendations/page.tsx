'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import RecommendedProducts from '@/components/product/RecommendedProducts';
import { useAppSelector } from '@/store';

export default function RecommendationsPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  
  // Kullanıcı giriş yapmış mı kontrol et
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirect=/recommendations');
    }
  }, [isAuthenticated, loading, router]);
  
  // Yükleniyor durumu
  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // Kullanıcı giriş yapmamışsa
  if (!isAuthenticated) {
    return null; // Router zaten yönlendirme yapacak
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Size Özel Öneriler</h1>
          <p className="text-gray-600">
            Gezinme geçmişiniz ve satın alma davranışlarınız baz alınarak size özel olarak hazırlanmış ürün önerileri.
          </p>
        </div>
        
        {/* Gezinme geçmişine göre öneriler */}
        <div className="mb-12">
          <RecommendedProducts 
            title="Gezinme Geçmişinize Göre Öneriler" 
            type="history" 
            limit={8} 
          />
        </div>
        
        {/* Popüler ürünler */}
        <div className="mb-12">
          <RecommendedProducts 
            title="Popüler Ürünler" 
            type="popular" 
            limit={8} 
          />
        </div>
        
        {/* Kategorilere göz at */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold mb-4">Daha Fazla Ürün Keşfedin</h2>
          <p className="text-gray-600 mb-6">
            Tüm kategorileri inceleyerek daha fazla ürün keşfedebilirsiniz.
          </p>
          <Link 
            href="/categories" 
            className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            Kategorilere Göz At
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}