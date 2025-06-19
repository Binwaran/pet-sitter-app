import FilterFields from "@/app/pet-sitters/FilterFields"

const FilterSidebar = (props) => {
  return (
    <aside className="w-full max-w-full md:max-w-[350px] p-0 bg-white rounded-2xl shadow-md top-6 h-fit overflow-hidden">
      <h2 className="text-[16px] font-medium px-6 pt-6">Search</h2>
      <div className="pb-6">
        <FilterFields {...props} variant="sidebar" />
      </div>
    </aside>
  )
}
export default FilterSidebar;