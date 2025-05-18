'use client'

import { useState, useEffect } from 'react'
import FilterSidebar from '@/components/pet-sitters/FilterSidebar'
import PetSitterList from '@/components/pet-sitters/PetSitterList'
import Pagination from '@/components/pet-sitters/Pagination'
import { useSearchFilters } from '@/hooks/useSearchFilters'
import SearchHeader from '@/components/pet-sitters/SearchHeader'

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


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
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
 }}, []);

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
      <div className="้!hidden md:flex justify-center items-center bg-gray-50 py-4">
            <SearchHeader />
      </div>
      <main className="flex flex-col md:flex-row min-h-screen px-4 md:px-20 py-5 gap-5 md:gap-10 bg-gray-50 justify-center">
        <div className="block md:sticky md:top-28 md:self-start md:w-1/4">
          <FilterSidebar
            filters={filters}
            onChange={handleChange}
            onCheckbox={handleCheckbox}
            onSearch={() => fetchData(filters)}
            onClear={clearFilters}
          />
          {/* Mobile Only: SearchHeader */}
          <div className="block md:hidden mt-4">
            <SearchHeader />
          </div>
        </div>
          
          <div className="w-full md:w-3/4">
            <PetSitterList pet_sitter={paginatedResults} />
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