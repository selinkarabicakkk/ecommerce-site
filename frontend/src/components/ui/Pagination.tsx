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
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 1) return pages;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (currentPage <= 4) {
      pages.push(2, 3, 4, 5);
      pages.push('...');
      pages.push(totalPages);
      return pages;
    }

    if (currentPage >= totalPages - 3) {
      pages.push('...');
      pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      return pages;
    }

    pages.push('...');
    pages.push(currentPage - 1, currentPage, currentPage + 1);
    pages.push('...');
    pages.push(totalPages);

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
        {/* Previous button */}
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
            <span className="sr-only">Previous</span>
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
        
        {/* Page numbers */}
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
        
        {/* Next button */}
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
            <span className="sr-only">Next</span>
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