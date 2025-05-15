'use client'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/navigation'
import Tag from "@/components/pet-sitters/tag"

const SitterCard = ({ pet_sitter }) => {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/pet-sitter/${pet_sitter.user_id}`)
  }

  if (!pet_sitter) {
    console.error("Pet sitter data is missing")
    return null
  }

  const imageUrl = pet_sitter?.gallery_image_url
    ? Array.isArray(pet_sitter.gallery_image_url)
      ? pet_sitter.gallery_image_url[0]
      : pet_sitter.gallery_image_url.split(',')[0]
    : '/assets/placeholder-image.jpg'

  return (
    <div
      className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer relative"
      onClick={handleClick}
    >
      {/* รูปภาพร้าน */}
      <div className="relative w-full h-48 md:w-40 md:h-32 rounded-md overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={`ภาพร้านของ ${pet_sitter.trade_name || 'ไม่ระบุชื่อร้าน'}`}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, 160px"
          priority
        />
      </div>

      {/* ดาว */}
     <div className="absolute top-2 right-2 flex items-center gap-1">
  {[...Array(Math.floor(pet_sitter?.rating || 0))].map((_, index) => (
    <img key={index} src="/assets/star-rating.svg" alt="Star" className="w-4 h-4" />
  ))}
</div>

      {/* ข้อมูล */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div className="flex items-center">
            {/* รูปโปรไฟล์ */}
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 mr-2">
              <Image
                src={pet_sitter?.users?.profile_image_url || '/assets/placeholder-profile.jpg'}
                alt={pet_sitter?.users?.name || 'Profile Image'}

                fill
                style={{ objectFit: 'cover' }}
                sizes="40px"
              />
            </div>

            {/* ชื่อร้านและผู้ให้บริการ */}
            <div>
              <h2 className="text-base font-semibold text-gray-800">{pet_sitter.trade_name || 'ชื่อร้านยังไม่ระบุ'}</h2>
              <p className="text-sm text-gray-500">By {pet_sitter?.users?.name || 'ไม่ระบุชื่อ'}</p>
            </div>
          </div>
        </div>

        {/* ที่อยู่ */}
        {pet_sitter.province && (
          <div className="mt-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-500 text-sm" />
            <p className="text-sm text-gray-600">{pet_sitter.district}</p>
          </div>
        )}

        {/* Tags */}
        {Array.isArray(pet_sitter.pet_type) && pet_sitter.pet_type.length > 0 && (
          <div className="mt-2 flex gap-2 flex-wrap">
            {pet_sitter.pet_type.map((type) => (
              <Tag key={type} type={type} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SitterCard
