'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store';
import { categoryService } from '@/services';
import { Category } from '@/types';
import { getAssetUrl } from '@/lib/utils';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchCategories = async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      const response: any = await categoryService.getCategories({
        page,
        limit: 10,
        search,
        isActive: statusFilter === 'all' ? 'all' : statusFilter === 'active' ? 'true' : 'false',
      });

      setCategories(response.categories || response.data || []);
      const count = response.totalCount ?? response.count ?? (response.categories || response.data || []).length;
      setTotalPages(Math.ceil(count / 10) || 1);
      setTotalCount(count);
      setCurrentPage(page);
    } catch (err) {
      setError('An error occurred while loading categories.');
      console.error('Categories load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/admin/categories');
      } else if (user?.role !== 'admin') {
        router.push('/');
      } else {
        fetchCategories();
      }
    }
  }, [isAuthenticated, loading, router, user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCategories(1, searchQuery);
  };

  const handlePageChange = (page: number) => {
    fetchCategories(page, searchQuery);
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map((category) => category._id));
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.deleteCategory(categoryId);
        fetchCategories(currentPage, searchQuery);
      } catch (err) {
        setError('An error occurred while deleting the category.');
        console.error('Category delete error:', err);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedCategories.length} categories?`)) {
      try {
        for (const categoryId of selectedCategories) {
          await categoryService.deleteCategory(categoryId);
        }
        setSelectedCategories([]);
        fetchCategories(currentPage, searchQuery);
      } catch (err) {
        setError('An error occurred while deleting categories.');
        console.error('Bulk delete error:', err);
      }
    }
  };

  // Yükleniyor durumu
  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Category Management</h1>
          <Button>
            <Link href="/admin/categories/new">Add New Category</Link>
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-3 items-center justify-between">
            <div className="flex gap-2 flex-1">
              <input
                type="text"
                placeholder="Search categories..."
                className="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-md text-sm"
                aria-label="Status filter"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Button type="submit">Search</Button>
            </div>
            <span className="text-sm text-gray-500 whitespace-nowrap ml-4">Total {totalCount} records</span>
          </form>
        </div>

        {selectedCategories.length > 0 && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6 flex justify-between items-center">
            <span>{selectedCategories.length} selected</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedCategories([])}>
                Clear Selection
              </Button>
              <Button variant="destructive" onClick={handleBulkDelete}>
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No categories found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedCategories.length === categories.length && categories.length > 0}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Count
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category._id)}
                          onChange={() => handleSelectCategory(category._id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {category.image && (
                            <div className="h-10 w-10 bg-gray-200 rounded-md mr-3">
                              <img
                                src={getAssetUrl(category.image)}
                                alt={category.name}
                                className="h-10 w-10 object-cover rounded-md"
                              />
                            </div>
                          )}
                          <div className="font-medium text-gray-900">{category.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.slug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(category as any).productCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/admin/categories/${category._id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteCategory(category._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 border rounded-md ${
                    currentPage === page
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}