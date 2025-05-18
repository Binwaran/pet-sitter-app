'use client'
import { useSearchParams} from 'next/navigation'
import { useState, useEffect } from 'react'
import FilterSidebar from '@/components/pet-sitters/FilterSidebar'
import PetSitterList from '@/components/pet-sitters/PetSitterList'
import Pagination from '@/components/pet-sitters/Pagination'
import { useSearchFilters } from '@/hooks/useSearchFilters'

const PetSitterListPage = () => {
  const {
    filters,
    results,
    loading,
    setFilters,
    fetchData,
    clearFilters,
  } = useSearchFilters()

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const paginatedResults = results.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const totalPages = Math.ceil(results.length / itemsPerPage)

  const searchParams = useSearchParams()

  useEffect(() => {
  const keyword = searchParams.get('keyword') || '';
  const petTypes = searchParams.get('pet')?.split(",") || [];
  const rating = searchParams.get('rating') || '';
  const experience = searchParams.get('experience') || '';

  const hasParams = keyword || petTypes.length > 0 || rating || experience;

  if (hasParams) {
    const newFilters = { keyword, petTypes, rating, experience };
    setFilters(newFilters);
    fetchData(newFilters);
  }
}, [searchParams.toString()]);


  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleCheckbox = (e) => {
    const { value, checked } = e.target
    const petTypes = checked
      ? [...filters.petTypes, value]
      : filters.petTypes.filter((type) => type !== value)
    setFilters({ ...filters, petTypes })
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <main className="flex flex-col md:flex-row min-h-screen px-4 md:px-20 py-5 gap-5 md:gap-10 bg-gray-50 justify-center">
        <div className="block w-full md:w-1/4">
          <FilterSidebar
            filters={filters}
            onChange={handleChange}
            onCheckbox={handleCheckbox}
            onSearch={() => fetchData(filters)}
            onClear={clearFilters}
          />
        </div>
        <div className="w-full md:w-3/4">
          <PetSitterList sitters={paginatedResults} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
        </div>
      </main>
    </>
  )
}

export default PetSitterListPage