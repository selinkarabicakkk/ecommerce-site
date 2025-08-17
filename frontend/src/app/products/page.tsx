'use client';

import { Suspense } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProductsClient from './ProductsClient';

function ProductsContent() {
  return <ProductsClient />;
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </div>
        </MainLayout>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}