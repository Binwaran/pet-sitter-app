'use client'
import FilterFields from "@/app/pet-sitters/FilterFields"
import { useSearchFilters } from "@/hooks/useSearchFilters"
import { useRouter } from "next/navigation"

const SearchBar = () => {
  const {
    filters,
    handleChange,
    handleCheckbox,
    fetchData,
    clearFilters,
  } = useSearchFilters()

  const router = useRouter()

  const handleSubmit = () => {
    const query = new URLSearchParams()
    if (filters.keyword) query.set('keyword', filters.keyword)
    if (filters.petTypes.length > 0) query.set('pet', filters.petTypes.join(','))
    if (filters.rating) query.set('rating', filters.rating)
    if (filters.experience) query.set('experience', filters.experience)
    router.push(`/pet-sitters?${query.toString()}`)
  }

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md">
      <FilterFields
        filters={filters}
        onChange={handleChange}
        onCheckbox={handleCheckbox}
        onSearch={handleSubmit}
        onClear={clearFilters}
        variant="searchbar"
      />
    </div>
  )
}

export default SearchBar;