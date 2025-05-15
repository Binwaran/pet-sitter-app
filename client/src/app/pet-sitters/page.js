'use client'

import { useState, useEffect, use } from 'react'
import { useSearchParams } from 'next/navigation'
import FilterSidebar from '@/components/pet-sitters/FilterSidebar'
import SearchHeader from '@/components/pet-sitters/SearchHeader'
import PetSitterList from '@/components/pet-sitters/PetSitterList'
import Pagination from '@/components/pet-sitters/Pagination'
import SearchBar from '@/components/home/SearchBar'
import { supabase } from '@/utils/supabase'
import { useCallback } from 'react'

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

  const searchParams = useSearchParams()

  const handleSearch = useCallback(async ({keyword, petTypes, rating, experience}) => {
    console.log("📍 FETCHING FROM TABLE: pet_sitter")

    let query = supabase.from('pet_sitter').select('*, users (profile_image_url, name)')
  
    if (keyword) {
    query = query.ilike('trade_name', `%${keyword}%`)
  }

  if (rating && !isNaN(rating)) {
    query = query.gte('average_rating', parseInt(rating))
  }

  if (experience) {
    const exp = parseInt(experience)
    if (exp === 5) {
      query = query.gte('experience', 5)
    } else if (exp === 3) {
      query = query.gte('experience', 3).lte('experience', 5)
    } else if (exp === 0) {
      query = query.gte('experience', 0).lte('experience', 2)
    }
  }

  const { data, error } = await query
    console.log("📦 DATA FROM SUPABASE:", data)
    console.log("❌ ERROR FROM SUPABASE:", error)

    if (error) {
      console.error('Error fetching data:', error)
      setResults([])
      return
    }

    const filtered = data.filter((sitter) => {
      const matchesKeyword = keyword
        ? sitter.trade_name?.toLowerCase().includes(keyword.toLowerCase())
        : true

      const safePetTypes = Array.isArray(petTypes) ? petTypes : []
      const matchesPetTypes = safePetTypes.length > 0
        ? safePetTypes.some((type) => sitter.pet_type?.includes(type))
        : true

      const matchesRating = rating
        ? sitter.average_rating >= parseInt(rating)
        : true

      return matchesKeyword && matchesPetTypes && matchesRating
    })

    setResults(filtered)
    setCurrentPage(1)
  },[])

  useEffect(() => {
  const loadInitialData = async () => {
    const { data, error } = await supabase
      .from('pet_sitter')
      .select('*, users (profile_image_url, name)')
    if (error) {
      console.error('Error loading data:', error)
      return
    }
    setResults(data)
  }

  loadInitialData()
}, [])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const keyword = searchParams.get('keyword') || ''
    const petTypes = searchParams.get('pet') ?.split(",") || []
    const rating = searchParams.get('rating') || ''
    const experience = searchParams.get('experience') || ''

    const hasParams = keyword || petTypes.length > 0 || rating || experience
    if (hasParams) {
      setFilters({
        keyword,
        petTypes,
        rating,
        experience
      })
    }
  }, [searchParams])


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
        <div className="px-4 md:px-20 py-5 bg-gray-50">
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
            onSearch={() => handleSearch(filters)}
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