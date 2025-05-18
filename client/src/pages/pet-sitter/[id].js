'use client'

import { useEffect, useState } from 'react'
import { useRouter} from 'next/router'
import { supabase } from '@/utils/supabase'
import SitterGallery from '@/components/SitterGallery'
import SitterDetailContent from '@/components/SitterDetailContent'
import SitterSidebar from '@/components/SitterSidebar'
import StickyMobileCTA from '@/components/StickyMobileCTA'

const PetSitterDetailPage = () => {
  const router = useRouter()
  const { id } = router.query

  const [sitter, setSitter] = useState(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const fetchSitter = async () => {
      if (!id) return
      const { data, error } = await supabase
        .from('pet_sitter')
        .select('*')
        .eq('user_id', id)
        .single()

      if (error) console.error('Error fetching sitter:', error)
      else setSitter(data)
    }

    fetchSitter()
  }, [id])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!sitter) return <p className="p-4">Loading...</p>

  return (
    <div className="bg-gray-50 min-h-screen">
      <SitterGallery images={sitter.images || []} />

      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <SitterDetailContent sitter={sitter} />
        </div>

        {!isMobile && (
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24">
              <SitterSidebar sitter={sitter} />
            </div>
          </div>
        )}
      </div>

      {isMobile && <StickyMobileCTA />}
    </div>
  )
}

export default PetSitterDetailPage
