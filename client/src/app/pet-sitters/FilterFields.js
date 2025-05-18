import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'

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
          className="tex-orange-400"
        />
      )
    }
    return stars
  }

  const isSidebar = variant === 'sidebar'
  const isSearchbar = variant === 'searchbar'


  return (
    <>
      {isSearchbar && (
        <>
          {/*Pet Type */}
          <div className="bg-white flex flex-col w-[100%] p-5 m-">     
            <div className="bg-gray-50 px-4 py-3 rounded-t-2xl">
              <div className="flex flex-col sm:flex-row">
                <p className="font-medium mb-2 mr-5 text-xl">Pet Type:</p>
                <div className="flex mb-2 gap-5 flex-wrap">
                  {petTypesList.map((type) => (
                    <label key={type} className="flex items-center gap-1 text-xl">
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
            </div>
            {/*Rating, Experience, Search */}
            <div className={`${isSearchbar ? 'bg-white px-4 py-4 rounded-b-2xl shadow-md flex flex-col md:flex-row items-center gap-4 md:gap-6' : 'p-4'}`}>
            {/* Rating */}
            <div className="flex flex-col sm:flex-row">
              <p className="font-medium mb-2 m-1 text-xl">Rating:</p>
              <div className="flex flex-wrap gap-2">
                {ratingList.map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`flex items-center gap-1 px-3 py-1 border rounded-2xl text-sm ${
                    filters.rating == star 
                      ? 'bg-green-100 text-green-600 border-green-400 font-semibold' 
                      : 'border-gray-200 text-green-600 hover:bg-gray-100'}
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

            {/* Experience */}
            <div className="flex flex-col sm:flex-row w-full sm:w-auto">
              <label className="font-medium block mb-2 p-2 text-xl">Experience:</label>
              <select
                name="experience"
                value={filters.experience}
                onChange={onChange}
                className="p-2 border border-gray-300 rounded-md w-full sm:min-w-[140px]"
              >
                <option value="">Select</option>
                <option value="0">0-2 Years</option>
                <option value="3">3-5 Years</option>
                <option value="5">5+ Years</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="w-full justify-center sm:w-auto sm:m-auto flex">
              <button
                onClick={onSearch}
                className="px-6 py-2 w-full rounded-full bg-orange-500 text-white hover:bg-orange-500"
              >
                Search
              </button>
            </div>
            </div>
          </div>
        </>
      )}  

      {isSidebar && (
        <>
          <div className="p-4 w-full flex flex-col m-auto">
            {/* Keyword */}
            <div className="mb-6 w-full relative">
              <input
                type="text"
                name="keyword"
                value={filters.keyword}
                onChange={onChange}
                className="w-full p-2 pr-10 border border-gray-300 rounded-md"
              />
              <Image
                src="/assets/icon=feather_search.png"
                alt="search"
                width={16}
                height={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70"
              />
            </div>

            {/* Pet Type */}
            <div className="mb-6">
              <p className="font-normal text-lg mb-2">Pet Type:</p>
              <div className="flex gap-2 flex-wrap">
                {petTypesList.map((type) => (
                  <label key={type} className="flex items-center gap-1 text-lg">
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

            {/* Rating */}
            <div className="mb-6">
              <p className="font-normal text-lg mb-2">Rating:</p>
              <div className="flex flex-wrap gap-2">
                {ratingList.map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`flex items-center gap-1 px-3 py-1 border rounded-3xl text-sm ${
                      filters.rating == star
                        ? 'bg-green-100 text-gray-600 border-green-400 font-semibold'
                        : 'border-gray-300 text-green-600 hover:bg-gray-100'
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

            {/* Experience */}
            <div className="mb-6">
              <label className="font-normal text-lg block mb-2">Experience:</label>
              <select
                name="experience"
                value={filters.experience}
                onChange={onChange}
                className="w-full p-2 border border-gray-200 rounded-md"
              >
                <option className='text-gray-200' value="">Select</option>
                <option value="0">0-2 Years</option>
                <option value="3">3-5 Years</option>
                <option value="5">5+ Years</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-between mt-4">
              <button
                onClick={onClear}
                className="flex-1 p-2 text-xl rounded-full bg-orange-200 text-orange-600 hover:bg-gray-200"
              >
                Clear
              </button>
              <button
                onClick={onSearch}
                className="flex-1 p-2 text-xl rounded-full bg-orange-500 text-white hover:bg-orange-500"
              >
                Search
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default FilterFields;
