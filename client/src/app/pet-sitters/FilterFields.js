import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'

const petTypesList = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Mouse', 'Turtle', 'Snake']
const ratingList = [5, 4, 3, 2, 1]

const FilterFields = ({
  filters,
  onChange,
  onCheckbox,
  onSearch,
  onClear,
  variant = 'sidebar', // 👈 'sidebar' หรือ 'searchbar'
}) => {
  const renderStars = (count) => {
    const stars = []
    for (let i = 0; i < count; i++) {
      stars.push(
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className="text-orange-400"
        />
      )
    }
    return stars
  }

  const isSidebar = variant === 'sidebar'

  return (
    <div className={`${isSidebar ? 'p-4' : 'p-0'} w-full`}>
      {/* 🔍 Keyword */}
      {isSidebar && (
      <div className={`${isSidebar ? 'mb-6' : 'mb-3'}`}>
        <input
          type="text"
          name="keyword"
          value={filters.keyword}
          onChange={onChange}
          placeholder="Search..."
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      )}

      {/* 🐶 Pet Type */}
      <div className={`${isSidebar ? 'mb-6' : 'mb-3'}`}>
        <p className="font-medium mb-2">Pet Type:</p>
        <div className="flex gap-2 flex-wrap">
          {petTypesList.map((type) => (
            <label key={type} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                value={type}
                checked={filters.petTypes.includes(type)}
                onChange={onCheckbox}
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      {/* ⭐ Rating */}
      <div className={`${isSidebar ? 'mb-6' : 'mb-3'}`}>
        <p className="font-medium mb-2">Rating:</p>
        <div className="flex flex-wrap gap-2">
          {ratingList.map((star) => (
            <button
              key={star}
              type="button"
              className={`flex items-center gap-1 px-3 py-1 border rounded-2xl text-sm ${
                filters.rating == star
                  ? 'bg-orange-100 text-orange-600 border-orange-400 font-semibold'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() =>
                onChange({
                  target: {
                    name: 'rating',
                    value: filters.rating === star ? '' : star,
                  },
                })
              }
            >
              <span>{star}</span>
              {renderStars(star)}
            </button>
          ))}
        </div>
      </div>

      {/* 🧑‍🏫 Experience */}
      <div className={`${isSidebar ? 'mb-6' : 'mb-3'}`}>
        <label className="font-medium block mb-2">Experience:</label>
        <select
          name="experience"
          value={filters.experience}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Select</option>
          <option value="0">0-2 Years</option>
          <option value="3">3-5 Years</option>
          <option value="5">5+ Years</option>
        </select>
      </div>

      {/* 🔘 Buttons */}
      <div className="flex gap-2 justify-between mt-4">
        <button
          onClick={onClear}
          className="flex-1 p-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Clear
        </button>
        <button
          onClick={onSearch}
          className="flex-1 p-2 rounded-md bg-orange-400 text-white hover:bg-orange-500"
        >
          Search
        </button>
      </div>
    </div>
  )
}

export default FilterFields
