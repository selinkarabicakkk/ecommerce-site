'use client';

import { useMemo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showSummary?: boolean;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showSummary = false,
}: PaginationProps) => {
  // Sayfa numaralarını hesapla
  const pageNumbers = useMemo(() => {
    const pages = [];
    
    // Her zaman ilk sayfayı göster
    if (currentPage > 3) {
      pages.push(1);
    }
    
    // Eğer aktif sayfa 4 veya daha büyükse, öncesinde "..." göster
    if (currentPage > 4) {
      pages.push('...');
    }
    
    // Aktif sayfanın etrafındaki sayfaları göster
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    
    // Eğer aktif sayfa son sayfadan 3 veya daha fazla küçükse, sonrasında "..." göster
    if (currentPage < totalPages - 3) {
      pages.push('...');
    }
    
    // Her zaman son sayfayı göster
    if (currentPage < totalPages - 1 && totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center justify-center">
      {showSummary && (
        <p className="text-sm text-gray-700 mr-4">
          <span className="font-medium">{currentPage}</span> / {totalPages} sayfa
        </p>
      )}
      
      <ul className="flex items-center -space-x-px rounded-md shadow-sm overflow-hidden border border-[rgb(var(--input))] bg-white">
        {/* Önceki sayfa butonu */}
        <li>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`relative block px-3 py-2 ml-0 leading-tight bg-white ${
              currentPage === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="sr-only">Önceki</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
          </button>
        </li>
        
        {/* Sayfa numaraları */}
        {pageNumbers.map((page, index) => (
          <li key={index}>
            {page === '...' ? (
              <span className="relative block px-3 py-2 leading-tight text-gray-400 bg-white">
                ...
              </span>
            ) : (
              <button
                onClick={() => typeof page === 'number' && onPageChange(page)}
                className={`relative block px-3 py-2 leading-tight ${
                  currentPage === page
                    ? 'z-10 text-white bg-[rgb(var(--primary))]'
                    : 'text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {page}
              </button>
            )}
          </li>
        ))}
        
        {/* Sonraki sayfa butonu */}
        <li>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`relative block px-3 py-2 leading-tight bg-white ${
              currentPage === totalPages
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="sr-only">Sonraki</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;