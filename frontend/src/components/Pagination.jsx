const Pagination = ({ currentPage, totalPages, onPageChange, totalRecords, itemsPerPage }) => {
  // Don't show pagination if there's only one page or no data
  if (totalPages <= 1) return null

  // Calculate page numbers to show
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      // Calculate start and end of middle pages
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        end = 4
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...')
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...')
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  // Calculate showing info
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalRecords)

  return (
    <div className='bg-white px-4 py-3 border-t border-gray-200 sm:px-6'>
      <div className='flex flex-col sm:flex-row items-center justify-between gap-3'>
        {/* Showing info */}
        <div className='text-sm text-gray-700 order-2 sm:order-1'>
          Showing <span className='font-semibold'>{startItem}</span> to{' '}
          <span className='font-semibold'>{endItem}</span> of{' '}
          <span className='font-semibold'>{totalRecords}</span> results
        </div>

        {/* Pagination buttons */}
        <div className='flex items-center gap-1 order-1 sm:order-2'>
          {/* Previous button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-300'
            }`}
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
          </button>

          {/* Page numbers */}
          <div className='flex items-center gap-1'>
            {pageNumbers.map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className='px-3 py-1.5 text-sm text-gray-500'>
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-300'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-300'
            }`}
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Pagination
