'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';
import { categoryService } from '@/services';
import { Category } from '@/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Kategorileri getir
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await categoryService.getCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Kategoriler yüklenirken hata oluştu:', error);
        setError('Kategoriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Kategoriler</h1>

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
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Kategori bulunamadı</h3>
            <p className="text-gray-500">Henüz hiç kategori eklenmemiş.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-48 w-full bg-gray-100">
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
                  <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {category.name}
                  </h2>
                  <p className="text-gray-600 mt-1 line-clamp-2 text-sm">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}