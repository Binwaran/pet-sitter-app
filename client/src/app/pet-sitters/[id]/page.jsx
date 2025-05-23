'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/utils/supabase'
import { Toaster, toast } from 'sonner'
import ImageCarousel from '@/components/ImageCarousel'
import StickyCard from '@/components/StickyCard'
import ReatingAndReview from '@/components/ReatingAndReview'

const PetSitterDetails = () => {
  const { id } = useParams()
  const [sitter, setSitter] = useState(null)

  useEffect(() => {
    const fetchSitter = async () => {
      const { data: sitterData, error: sitterError } = await supabase
        .from('pet_sitter')
        .select('*')
        .eq('user_id', id)
        .single()

      if (sitterError) {
        console.error(sitterError)
        return
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('profile_image_url, name')
        .eq('id', id)
        .single()

      if (userError) {
        console.error(userError)
      }

      const merged = {
        ...sitterData,
        profile_image_url: userData?.profile_image_url || null,
        name: userData?.name || 'ไม่ระบุชื่อ',
      }

      setSitter(merged)
    }

    if (id) fetchSitter()
  }, [id])


  if (!sitter) return <div className="text-center mt-10">กำลังโหลดข้อมูล...</div>

  return (
    <div className="w-full sm:w-full md:w-full mx-auto flex flex-col gap-6 sm:mt-10 bg-gray-100">
      {/* carousel picture */}
      <div className="w-full flex-1 sm:mt-15 mb-10 sm:m-auto">
        {/* Gallery */}
        { sitter.gallery_image_url?.length > 0 && (
          <ImageCarousel images={sitter.gallery_image_url} />
        )}
        
      </div>
      {/* content */}
      {/* Desktop */}
      <div className= "hidden w-full sm:w-[90%] sm:mx-auto sm:flex sm:flex-col sm:flex-row gap-8 mb-10">
        <div>
          {/* shop details */}
          <div className = "flex flex-col flex-1 ml-5 sm:ml-10 mr-5 ">
            {/* Title & Intro */}
            <h1 className="text-5xl sm:text-7xl font-bold mb-5 sm:mb-10 mt-1 sm:mt-10 leading-relaxed">{sitter.trade_name.charAt(0).toUpperCase() + sitter.trade_name.slice(1).toLowerCase()}</h1>
            <section className="mb-10">
              <h2 className="text-3xl font-semibold mb-1">Introduction</h2>
              <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">{sitter.introduction}</p>
            </section>

            {/* Services */}
            <section className="mb-10">
              <h2 className="text-3xl font-semibold mb-1">Services</h2>
              <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">{sitter.services}</p>
            </section>

            {/* My Place */}
            <section className="mb-10">
              <h2 className="text-3xl font-semibold mb-1">My Place</h2>
              <p className="text-gray-700 mb-4 whitespace-pre-wrap text-lg mb-10 leading-relaxed">{sitter.my_place}</p>
              {sitter.lat && sitter.lng && (
                <iframe
                  className="rounded-lg w-full h-64"
                  src={`https://www.google.com/maps?q=${sitter.lat},${sitter.lng}&z=15&output=embed`}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              )}
            </section>
          </div>
          <div className="w-full h-[2000px] my-15 py-10 ">
            <ReatingAndReview />
          </div>

        </div>
        {/* Sticky Card */}
        <div className="w-[375px] sm:w-full lg:w-1/3 sm:sticky sm:top-24 self-start items-center sm:mt-10 sm:mr-10 lg:mb-10">
          <StickyCard sitter={sitter} />
        </div>
      </div>
      {/* Mobile */}
      <div className= "sm:hidden w-full gap-8 mb-10">
        <div>
          {/* shop details */}
          <div className = "flex flex-col flex-1 ml-5 sm:ml-10 mr-5 ">
            {/* Title & Intro */}
            <h1 className="text-5xl sm:text-7xl font-bold mb-5 sm:mb-10 mt-1 sm:mt-10 leading-relaxed">{sitter.trade_name.charAt(0).toUpperCase() + sitter.trade_name.slice(1).toLowerCase()}</h1>
            <section className="mb-10">
              <h2 className="text-3xl font-semibold mb-1">Introduction</h2>
              <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">{sitter.introduction}</p>
            </section>

            {/* Services */}
            <section className="mb-10">
              <h2 className="text-3xl font-semibold mb-1">Services</h2>
              <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">{sitter.services}</p>
            </section>

            {/* My Place */}
            <section className="mb-10">
              <h2 className="text-3xl font-semibold mb-1">My Place</h2>
              <p className="text-gray-700 mb-4 whitespace-pre-wrap text-lg mb-10 leading-relaxed">{sitter.my_place}</p>
              {sitter.lat && sitter.lng && (
                <iframe
                  className="rounded-lg w-full h-64"
                  src={`https://www.google.com/maps?q=${sitter.lat},${sitter.lng}&z=15&output=embed`}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              )}
            </section>
          </div>
          {/* Sticky Card */}
          <div className="w-full sm:w-full lg:w-1/3 sm:sticky sm:top-24    self-start items-center sm:ml-10 sm:mr-10 mx-auto sm:m-auto">
            <StickyCard sitter={sitter} />
          </div>
          <div className="w-full h-[2000px]">
            <ReatingAndReview />
          </div>

        </div>
        
      </div>
      <Toaster />
    </div>
  )
}

// รอใส่ข้อมูล Rating&Review
export default PetSitterDetails
