import { useState, useEffect } from 'react'

const ImageCarousel = ({ images }) => {
  const [index, setIndex] = useState(0)
  const [visibleCount, setVisibleCount] = useState(3)
  const [slideWidth, setSlideWidth] = useState(34) // 33% + 1% gap

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth
      if (width < 768) {
        setVisibleCount(1)
        setSlideWidth(100)
      } else if (width < 1024) {
        setVisibleCount(2)
        setSlideWidth(50.5)
      } else {
        setVisibleCount(3)
        setSlideWidth(34)
      }
    }

    updateLayout()
    window.addEventListener('resize', updateLayout)
    return () => window.removeEventListener('resize', updateLayout)
  }, [])

  const nextSlide = () => {
    if (index + visibleCount < images.length) {
      setIndex(index + 1)
    }
  }

  const prevSlide = () => {
    if (index > 0) {
      setIndex(index - 1)
    }
  }


  return (
    <div className="relative w-full overflow-hidden">
        <div
            className="flex gap-[1%] transition-transform duration-300"
            style={{
            transform: `translateX(-${index * slideWidth}%)`,
            }}
        >
            {images.map((url, i) => (
            <img
                key={i}
                src={url}
                alt={`Image ${i}`}
                className="h-[281px] sm:h-[500px] object-cover flex-shrink-0 shadow-xl w-full sm:w-full md:w-[49.5%] lg:w-[33%]" 
            />
            ))}
        </div>

        {/* ปุ่มซ้าย */}
        <button
            onClick={prevSlide}
            className="absolute left-3 sm:left-10 top-1/2 transform -translate-y-1/2 bg-white text-black p-2 rounded-full shadow-md opacity-50 z-20"
        >
         <img
            src="/assets/arrow1.png"
            alt="Previous"
            className="w-10 h-10 object-contain"
        />
        </button>

        {/* ปุ่มขวา */}
        <button
            onClick={nextSlide}
            className="absolute right-3 sm:right-10 top-1/2 transform -translate-y-1/2 bg-white text-black p-2 rounded-full shadow-md opacity-50 z-20"
        >
         <img
            src="/assets/arrow2.png"
            alt="Previous"
            className="w-10 h-10 object-contain"
        />
        </button>
    </div>
  )
}

export default ImageCarousel
