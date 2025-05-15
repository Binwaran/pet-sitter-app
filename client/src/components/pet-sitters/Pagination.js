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
    <div className="mt-6 flex gap-2 justify-center items-center flex-wrap">
      {/* Previous */}
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1 border rounded bg-white hover:bg-gray-100"
        >
          Previous
        </button>
      )}

      {/* First Page + Dots */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className={`px-3 py-1 border rounded ${
              currentPage === 1 ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
            }`}
          >
            1
          </button>
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}

      {/* Page Numbers */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 border rounded ${
            currentPage === page ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Last Page + Dots */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className={`px-3 py-1 border rounded ${
              currentPage === totalPages ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
            }`}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next */}
      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1 border rounded bg-white hover:bg-gray-100"
        >
          Next
        </button>
      )}
    </div>
  )
}

export default Pagination
