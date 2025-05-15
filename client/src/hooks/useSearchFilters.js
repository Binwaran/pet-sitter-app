'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/utils/supabase'

export const useSearchFilters = () => {
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState({
    keyword: '',
    petTypes: [],
    rating: '',
    experience: ''
  })

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async ({ keyword, petTypes, rating, experience }) => {
    setLoading(true)

    let query = supabase.from('pet_sitter').select('*, users (profile_image_url, name)')

    if (keyword) {
      query = query.ilike('trade_name', `%${keyword}%`)
    }

    if (rating && !isNaN(rating)) {
      query = query.gte('average_rating', parseInt(rating))
    }

    if (experience) {
      const exp = parseInt(experience)
      if (exp === 5) query = query.gte('experience', 5)
      else if (exp === 3) query = query.gte('experience', 3).lte('experience', 5)
      else if (exp === 0) query = query.gte('experience', 0).lte('experience', 2)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching data:', error)
      setResults([])
    } else {
      const filtered = data.filter((sitter) => {
        const matchesPetTypes = petTypes?.length
          ? petTypes.some((type) => sitter.pet_type?.includes(type))
          : true

        return matchesPetTypes
      })

      setResults(filtered)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    const keyword = searchParams.get('keyword') || ''
    const petTypes = searchParams.get('pet')?.split(',') || []
    const rating = searchParams.get('rating') || ''
    const experience = searchParams.get('experience') || ''

    const hasParams = keyword || petTypes.length > 0 || rating || experience

    const appliedFilters = { keyword, petTypes, rating, experience }

    setFilters(appliedFilters)

    fetchData(appliedFilters)
    }, [searchParams, fetchData])

    const handleChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
        ...prev,
        [name]: value
    }))
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


  const clearFilters = async () => {
    setFilters({ keyword: '', petTypes: [], rating: '', experience: '' })
    const { data, error } = await supabase.from('pet_sitter').select('*, users (profile_image_url, name)')
    if (error) {
      console.error('Error loading all data:', error)
      setResults([])
    } else {
      setResults(data)
    }
  }

  return {
    filters,
    results,
    loading,
    setFilters,
    fetchData,
    clearFilters,
    handleChange,
    handleCheckbox,
  }
}
