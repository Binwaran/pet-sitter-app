import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';


const FilterSidebar = ({ filters, onChange, onCheckbox, onSearch, onClear }) => {
  const renderStars = (count) => {
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push(
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className="text-orange-400"
        />
      );
    }
    return stars;
  };

  return (
    <aside className="w-85 p-4 bg-white rounded-2xl shadow-md sticky top-6 h-fit">
      <h2 className="text-lg font-semibold mb-4">Search</h2>

      {/* 🔍 Keyword Search */}
      <div className="mb-6">
        <input
          type="text"
          name="keyword"
          value={filters.keyword}
          onChange={onChange}
          placeholder="Search..."
          className="w-full p-2 border-gray-300 border border-solid rounded-md"
        />
      </div>

      {/* 🐶 Pet Type */}
      <div className="mb-6">
        <p className="font-medium mb-2">Pet Type:</p>
        <div className="flex gap-2 flex-wrap">
          {['Dog', 'Cat', 'Bird', 'Rabbit'].map((type) => (
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
      <div className="mb-6">
        <p className="font-medium mb-2">Rating:</p>
        <div className="flex flex-row gap-3 flex-wrap">
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              type="button"
              className={`w-fit flex items-center gap-2 px-3 py-1 border rounded-2xl text-sm transition ${
                filters.rating == star
                  ? 'bg-orange-100 text-orange-600 border-orange-400 font-semibold'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() =>
                onChange({ target: { name: 'rating', value: filters.rating === star ? '' : star } })
              }
            >
              <span className="w-5 text-right">{star}</span>
              <div className="flex">{renderStars(star)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 🧑‍🏫 Experience */}
      <div className="mb-6">
        <label className="font-medium block mb-2">Experience:</label>
        <select
          name="experience"
          value={filters.experience}
          onChange={onChange}
          className="w-full p-2 border-gray-300 border border-solid rounded-md"
        >
          <option value="">Select</option>
          <option value="0-2 Years">0-2 Years</option>
          <option value="3-5 Years">3-5 Years</option>
          <option value="5+ Years">5+ Years</option>
        </select>
      </div>

      {/* 🔁 Buttons */}
      <div className="flex justify-between gap-2">
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
    </aside>
  );
};

export default FilterSidebar;