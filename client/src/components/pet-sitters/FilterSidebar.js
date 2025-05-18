
import FilterFields from "@/app/pet-sitters/FilterFields"

const FilterSidebar = (props) => {
  return (
    <aside className="w-full p-4 bg-white rounded-2xl shadow-md top-6 h-fit">
      <h2 className="text-lg font-semibold mb-4">Search</h2>
      <FilterFields {...props} variant="sidebar" />
    </aside>
  )
}
export default FilterSidebar;