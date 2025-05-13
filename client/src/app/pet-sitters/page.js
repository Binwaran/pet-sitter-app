'use client'

import { useState, useEffect } from 'react'
import FilterSidebar from '@/components/pet-sitters/FilterSidebar'
import SearchHeader from '@/components/pet-sitters/SearchHeader'
import PetSitterList from '@/components/pet-sitters/PetSitterList'
import Pagination from '@/components/pet-sitters/Pagination'
import sitters from '@/mock/sitters'
import SearchBar from '@/components/home/SearchBar'

const PetSitterListPage = () => {
  const [filters, setFilters] = useState({
    keyword: '',
    petTypes: [],
    rating: '',
    experience: ''
  })

  const [results, setResults] = useState(sitters)
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobile, setIsMobile] = useState(false)


  const itemsPerPage = 5

  const paginatedResults = results.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const totalPages = Math.ceil(results.length / itemsPerPage)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
  
    handleResize()
    window.addEventListener('resize', handleResize)
  
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  useEffect(() => {
  }, [isMobile])
  

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleCheckbox = (e) => {
    const { value, checked } = e.target
    setFilters((prev) => {
      const petTypes = checked
        ? [...prev.petTypes, value]
        : prev.petTypes.filter((type) => type !== value)
      return { ...prev, petTypes }
    })
  }

  const handleSearch = () => {
    const filtered = sitters.filter((sitter) => {
      const matchesKeyword = filters.keyword
        ? sitter.name.toLowerCase().includes(filters.keyword.toLowerCase())
        : true

      const matchesPetTypes = filters.petTypes.length > 0
        ? filters.petTypes.some((type) => sitter.petTypes.includes(type))
        : true

      const matchesRating = filters.rating
        ? sitter.rating === parseInt(filters.rating)
        : true

      const matchesExperience = filters.experience
        ? filters.experience === '5+ Years'
          ? sitter.experience >= 5
          : filters.experience === '3-5 Years'
            ? sitter.experience >= 3 && sitter.experience <= 5
            : sitter.experience >= 0 && sitter.experience <= 2
        : true

      return matchesKeyword && matchesPetTypes && matchesRating && matchesExperience
    })

    setResults(filtered)
    setCurrentPage(1)
  }

  const handleClear = () => {
    setFilters({ keyword: '', petTypes: [], rating: '', experience: '' })
    setResults(sitters)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
    {isMobile && (
  <div className="px-4">
    <SearchBar />
  </div>
)}

      {/* Sidebar บน Mobile */}
      <div className='px-4 md:px-20 py-5 bg-gray-50'>
        <SearchHeader />

      </div>

      <main className="flex flex-col md:flex-row min-h-screen px-4 md:px-20 py-5 gap-5 md:gap-10 bg-gray-50 justify-center">

        {/* Sidebar บน Desktop */}
        <div className="hidden md:block">
          <FilterSidebar
            filters={filters}
            onChange={handleChange}
            onCheckbox={handleCheckbox}
            onSearch={handleSearch}
            onClear={handleClear}
          />
        </div>
       
        {/* รายการ sitter + pagination */}
        <section className="flex-1">
          <PetSitterList sitters={paginatedResults} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </section>
      </main>
    </>
  )
}

export default PetSitterListPage