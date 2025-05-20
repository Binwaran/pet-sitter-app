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
    <div className="flex flex-wrap items-center gap-4 w-full max-w-6xl mx-auto px-4 pb-4 rounded-lg ">
      <FilterFields
        filters={filters}
        onChange={handleChange}
        onCheckbox={handleCheckbox}
        onSearch={handleSubmit}
        variant="searchbar"
      />
    </div>
  )
}

export default SearchBar;