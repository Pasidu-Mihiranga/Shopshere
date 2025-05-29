// Pagination.js
import React from 'react';
import PropTypes from 'prop-types';
import './Pagination.scss';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  maxVisiblePages = 5 
}) => {
  // Early return if less than 2 pages
  if (totalPages <= 1) return null;

  // Calculate range of visible pages
  const getVisiblePageRange = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Calculate start and end page numbers
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    // Adjust if end page is beyond total pages
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const visiblePages = getVisiblePageRange();

  return (
    <div className="pagination">
      {/* Previous button */}
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &laquo;
      </button>

      {/* First page if not visible */}
      {visiblePages[0] > 1 && (
        <>
          <button
            className="pagination-btn"
            onClick={() => onPageChange(1)}
          >
            1
          </button>
          {visiblePages[0] > 2 && (
            <span className="pagination-ellipsis">&hellip;</span>
          )}
        </>
      )}

      {/* Visible page buttons */}
      {visiblePages.map(pageNum => (
        <button
          key={pageNum}
          className={`pagination-btn ${pageNum === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(pageNum)}
        >
          {pageNum}
        </button>
      ))}

      {/* Last page if not visible */}
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="pagination-ellipsis">&hellip;</span>
          )}
          <button
            className="pagination-btn"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next button */}
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &raquo;
      </button>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  maxVisiblePages: PropTypes.number
};

export default Pagination;
