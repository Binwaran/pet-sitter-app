// components/SitterSidebar.js
'use client'

const SitterSidebar = ({ sitter }) => {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 space-y-4">
      {/* Avatar & Name */}
      <div className="flex items-center space-x-4">
        <img
          src={sitter.avatar_url || '/avatar.png'}
          alt="Sitter Avatar"
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{sitter.name}</h3>
          <p className="text-sm text-gray-500">{sitter.experience} years experience</p>
        </div>
      </div>

      {/* Location */}
      <div className="text-gray-600">
        📍 {sitter.location}
      </div>

      {/* Pet Types */}
      <div className="flex flex-wrap gap-2">
        {sitter.pet_types?.map((type, index) => (
          <span
            key={index}
            className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full"
          >
            {type}
          </span>
        ))}
      </div>

      {/* Book Now Button */}
      <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold">
        Book Now
      </button>
    </div>
  )
}

export default SitterSidebar
