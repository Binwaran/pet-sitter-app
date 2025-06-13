import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const maxVisible = 5
  let startPage = Math.max(currentPage - Math.floor(maxVisible / 2), 1)
  let endPage = startPage + maxVisible - 1

  if (endPage > totalPages) {
    endPage = totalPages
    startPage = Math.max(endPage - maxVisible + 1, 1)
  }

  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  return (
    <div className="mt-8 flex gap-6 justify-center items-center select-none">
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="disabled:opacity-40 text-[#B0B3C7] hover:text-orange-500 transition p-0 bg-transparent border-none outline-none"
        aria-label="Previous page"
      >
        <FaChevronLeft size={18} />
      </button>

      {/* Page Numbers */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 flex items-center justify-center rounded-full text-base font-semibold transition
            ${currentPage === page
              ? 'bg-orange-50 text-orange-500'
              : 'bg-white text-[#B0B3C7] hover:bg-orange-100 hover:text-orange-500'}
          `}
          style={{ minWidth: 32, minHeight: 32 }}
        >
          {page}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="disabled:opacity-40 text-[#B0B3C7] hover:text-orange-500 transition p-0 bg-transparent border-none outline-none"
        aria-label="Next page"
      >
        <FaChevronRight size={18} />
      </button>
    </div>
  )
}

export default Pagination
