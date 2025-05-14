'use client'

import { useState, useEffect } from 'react'
import FilterSidebar from '@/components/pet-sitters/FilterSidebar'
import SearchHeader from '@/components/pet-sitters/SearchHeader'
import PetSitterList from '@/components/pet-sitters/PetSitterList'
import Pagination from '@/components/pet-sitters/Pagination'
import SearchBar from '@/components/home/SearchBar'
import { supabase } from '@/utils/supabase'

const PetSitterListPage = () => {
  const [filters, setFilters] = useState({
    keyword: '',
    petTypes: [],
    rating: '',
    experience: ''
  })

  const [results, setResults] = useState([])
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
  const loadInitialData = async () => {
    const { data, error } = await supabase.from('pet_sitter').select('*')
    if (error) {
      console.error('Error loading data:', error)
      return
    }
    setResults(data)
  }

  loadInitialData()
}, [])


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

  const handleSearch = async () => {
    console.log("📍 FETCHING FROM TABLE: pet_sitter")

    let query = supabase.from('pet_sitter').select('*')
  

    if (filters.rating) {
      query = query.eq('rating', parseInt(filters.rating))
    }

    if (filters.experience) {
      if(filters.experience === "5"){
        query = query.gte('experience', 5);
      } else if (filters.experience === "3"){
        query = query.gte('experience', 3).lte('experience', 5);
      } else if (filters.experience === "0"){
        query = query.gte("experience", 0).lte("experience", 2);
      }
    }

    const { data, error } = await query
  

    if (error) {
      console.error('Error fetching data:', error)
      setResults([])
      return
    }

    const filtered = data.filter((sitter) => {
      const matchesKeyword = filters.keyword
        ? sitter.name.toLowerCase().includes(filters.keyword.toLowerCase())
        : true

      const matchesPetTypes = filters.petTypes.length > 0
        ? filters.petTypes.some((type) => sitter.pet_type?.includes(type))
        : true

      const matchesRating = filters.rating
        ? sitter.rating === parseInt(filters.rating)
        : true

      return matchesKeyword && matchesPetTypes && matchesRating
    })

    setResults(filtered)
    setCurrentPage(1)
  }

  const handleClear = async () => {
    setFilters({ keyword: '', petTypes: [], rating: '', experience: '' })

    const { data, error } = await supabase.from('pet_sitter').select('*')
    if (error) {
      console.error('Error fetching data:', error)
      setResults([])
      return
    }
    setResults(data)
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

      <div className='px-4 md:px-20 py-5 bg-gray-50'>
        <SearchHeader />
      </div>

      <main className="flex flex-col md:flex-row min-h-screen px-4 md:px-20 py-5 gap-5 md:gap-10 bg-gray-50 justify-center">
        <div className="hidden md:block">
          <FilterSidebar
            filters={filters}
            onChange={handleChange}
            onCheckbox={handleCheckbox}
            onSearch={handleSearch}
            onClear={handleClear}
          />
        </div>

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