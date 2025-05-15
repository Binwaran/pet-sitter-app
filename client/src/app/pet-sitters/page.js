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
    pet_types: [],
    rating: '',
    experience: ''
  })

  const [originalData, setOriginalData] = useState([])
  const [results, setResults] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  const [loading, setLoading] = useState(true)

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

  // ดึงข้อมูลจาก Supabase
useEffect(() => {
  const fetchData = async () => {
    setLoading(true)

    // ดึงข้อมูลจากแต่ละตาราง
    const { data: sitters, error: sittersError } = await supabase.from('pet_sitter').select('*')
    const { data: users, error: usersError } = await supabase.from('users').select('*')
    const { data: reviews, error: reviewsError } = await supabase.from('reviews').select('*')

    if (sittersError || usersError || reviewsError) {
      console.error('Sitters Error:', sittersError)
console.error('Users Error:', usersError)
console.error('Reviews Error:', reviewsError)

      setLoading(false)
      return
    }

    // รวมข้อมูลเข้าด้วยกัน
    const combinedData = sitters.map((sitter) => {
      const user = users.find((u) => u.id === sitter.user_id)
      const sitterReviews = reviews.filter((r) => r.pet_sitter_id === sitter.user_id)
      const avgRating = sitterReviews.length > 0
        ? sitterReviews.reduce((sum, r) => sum + r.rating, 0) / sitterReviews.length
        : 0

      return {
        ...sitter,
        users: user || {},
        rating: Math.round(avgRating),
      }
    })

    setOriginalData(combinedData)
    setResults(combinedData)
    setLoading(false)
  }

  fetchData()
}, [])



  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleCheckbox = (e) => {
    const { value, checked } = e.target;
    setFilters((prev) => {
      const pet_type = checked
        ? [...prev.pet_type, value]
        : prev.pet_type.filter((type) => type !== value);
      return { ...prev, pet_type };
    });
  };

  const handleSearch = () => {
    const filtered = originalData.filter((pet_sitter) => {
      const matchesKeyword = filters.keyword
        ? pet_sitter.name?.toLowerCase().includes(filters.keyword.toLowerCase())
        : true

      const sitterPetTypes = Array.isArray(pet_sitter.pet_type)
        ? pet_sitter.pet_type
        : pet_sitter.pet_type?.split(',') || []

      const matchesPetTypes = filters.pet_type.length > 0
        ? filters.pet_type.some((type) => sitterPetTypes.includes(type))
        : true

        const matchesRating = filters.rating
        ? pet_sitter.rating === parseInt(filters.rating)
        : true;

      const matchesExperience = filters.experience
        ? filters.experience === '5+ Years'
          ? pet_sitter.experience >= 5
          : filters.experience === '3-5 Years'
            ? pet_sitter.experience >= 3 && pet_sitter.experience <= 5
            : pet_sitter.experience >= 0 && pet_sitter.experience <= 2
        : true

      return matchesKeyword && matchesPetTypes && matchesRating && matchesExperience
    })

    setResults(filtered)
    setCurrentPage(1)
  }

  const handleClear = () => {
    setFilters({ keyword: '', petTypes: [], rating: '', experience: '' })
    setResults(originalData)
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

      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-lg font-medium">Loading pet sitters...</p>
        </div>
      ) : (
        <main className="flex flex-col md:flex-row min-h-screen px-4 md:px-20 py-5 gap-5 md:gap-10 bg-gray-50 justify-center">
          {/* Sidebar Desktop */}
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
          <PetSitterList pet_sitter={paginatedResults} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </section>
        </main>
      )}
    </>
  )
}

export default PetSitterListPage