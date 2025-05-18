'use client'

const SitterDetailContent = ({ sitter }) => {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{sitter.title}</h1>
        <p className="text-gray-600 mt-2">{sitter.introduction}</p>
      </div>

      {/* Services */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Services Offered</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {Array.isArray(sitter.services) && sitter.services.map((service, index) => (
            <li key={index}>{service}</li>
          ))}
        </ul>
      </div>

      {/* About My Place */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">About My Place</h2>
        <p className="text-gray-700">{sitter.about_place}</p>
      </div>

      {/* Map Placeholder */}
      <div className="w-full h-64 bg-gray-300 flex items-center justify-center rounded-xl">
        <span className="text-gray-600">[ Map for: {sitter.location} ]</span>
      </div>
    </div>
  )
}

export default SitterDetailContent

