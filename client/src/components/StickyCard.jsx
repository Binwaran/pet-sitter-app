        
const StickyCard = ({ sitter }) => {
    return (
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md sm:mb-10 flex flex-col items-center text-center">
            <img
              src={sitter.profile_image_url}
              alt="Profile"
              className="w-50 h-50 rounded-full object-cover mt-5 mb-5"
            />

            <h2 className="text-3xl sm:text-5xl font-semibold mb-5">{sitter.trade_name.charAt(0).toUpperCase() + sitter.trade_name.slice(1).toLowerCase()}</h2>
            <div className="flex flex-row gap-5 mb-1 items-center">
              <div><p className="text-black text-2xl mb-5">{sitter.name}</p></div>
              <div><p className="text-green-400 text-xl mb-5">{sitter.experience} Years Exp.</p></div>
            </div>

            {/* Rating */}
            <p className=" text-green-500 font-medium text-xl mb-5 flex flex-row items-center">
              {Array.from({ length: Math.floor(sitter.average_rating ?? 0) }).map((_, i) => (
                    <svg
                    key={i}
                    className="w-8 h-8 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.276 3.934a1 1 0 00.95.69h4.137c.969 0 1.371 1.24.588 1.81l-3.35 2.436a1 1 0 00-.364 1.118l1.277 3.933c.3.921-.755 1.688-1.538 1.118l-3.351-2.435a1 1 0 00-1.175 0l-3.351 2.435c-.783.57-1.838-.197-1.538-1.118l1.277-3.933a1 1 0 00-.364-1.118L2.075 9.36c-.783-.57-.38-1.81.588-1.81h4.137a1 1 0 00.95-.69l1.276-3.934z" />
                    </svg>
                ))}
            </p>

            {/* Location */}
            <p className="flex items-center gap-2 text-gray-600 text-xl mb-5">
                <img
                    src="/assets/icon=map-marker.png"
                    alt="Location"
                    className="w-7 h-7 opacity-45"
                />
                {sitter.province}, {sitter.district}
            </p>


            {/* Pet Types */}
            <div className="flex flex-wrap justify-center gap-4 mb-5">
                {sitter.pet_type?.map((type, i) => {
                    let style = ""

                    switch (type) {
                    case "Dog":
                        style = "bg-green-100 text-green-500 border border-green-500"
                        break
                    case "Cat":
                        style = "bg-pink-100 text-pink-400 border border-pink-400"
                        break
                    case "Bird":
                        style = "bg-blue-100 text-blue-400 border border-blue-400"
                        break
                    case "Rabbit":
                        style = "bg-orange-100 text-orange-400 border border-orange-400"
                        break
                    case "Mouse":
                        style = "bg-purple-100 text-purple-400 border border-purple-400"
                        break
                    case "Turtle":
                        style = "bg-yellow-100 text-yellow-400 border border-yellow-400"
                        break
                    case "Snake":
                        style = "bg-red-100 text-red-400 border border-red-400"
                        break
                    default:
                        style = "bg-gray-100 text-gray-300 border border-gray-300"
                    }

                    return (
                    <span
                        key={i}
                        className={`px-4 py-2 rounded-full text-xl ${style}`}
                    >
                        {type}
                    </span>
                    )
                })}
            </div>
            {/* Actions */}
            {/* Desktop */}
            <div className="hidden sm:flex sm:flex-row gap-4 mb-4 mt-15"> 
              <div>
                <button
                  onClick={() => toast('📨 Opening chat...')}
                  className="sm:w-[180px] bg-orange-200 text-orange-600 text-xl font-medium py-3 px-2 rounded-4xl mb-3 hover:bg-orange-600 hover:text-white ml-2 cursor-pointer"
                >
                  Send Message
                </button>
              </div>
              <div>
                <button
                  onClick={() => toast('📅 Booking popup soon...')}
                  className="w-[340px] sm:w-[180px] bg-orange-600 text-white text-xl font-medium py-3 px-2 rounded-4xl hover:bg-orange-200 hover:text-orange-600 mr-3 sm:mr-2 cursor-pointer"
                >
                  Book Now
                </button>
              </div>
            </div>
            {/* Mobile */}
            <div className="sm:hidden flex flex-row gap-4 mb-4 mt-15"> 
              <div>
                <button
                  onClick={() => toast('📅 Booking popup soon...')}
                  className="w-[340px] sm:w-[180px] bg-orange-600 text-white text-xl font-medium py-3 px-2 rounded-4xl hover:bg-orange-200 hover:text-orange-600 mr-3 sm:mr-2 cursor-pointer"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
        )
}
export default StickyCard
