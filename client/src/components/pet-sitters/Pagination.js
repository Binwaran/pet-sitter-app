const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  
    return (
      <div className="mt-6 flex gap-2 justify-center">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 border rounded ${
              currentPage === page ? 'bg-blue-500 text-white' : 'bg-white'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    )
  }
  
  export default Pagination
  