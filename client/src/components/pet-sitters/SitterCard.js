'use client'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMapMarkerAlt, faStar } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/navigation'
import Tag from "@/components/pet-sitters/tag";

const SitterCard = ({ sitter }) => {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/pet-sitters/${sitter.id}`)
  }

  return (
    <div
      className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer relative"
      onClick={handleClick}
    >
      {/* รูปภาพร้าน */}
      <div className="relative w-full h-48 md:w-40 md:h-32 rounded-md overflow-hidden bg-gray-100">
        <Image
          src={sitter.profileImage || '/assets/placeholder-profile.jpg'}
          alt={`ภาพร้าน ${sitter.name}`}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, 160px"
          priority
        />
      </div>

      {/* ข้อมูล */}
      <div className="flex-1 flex flex-col justify-between relative">
        {/* ส่วนหัว */}
        <div className="flex flex-col md:flex-row sm:flex-row items-start md:items-center justify-between gap-2">
          <div className="flex items-center">
            {/* รูปโปรไฟล์ */}
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 mr-2">
              <Image
                src={sitter.profileImage || '/assets/placeholder-profile.jpg'}
                alt={sitter.profileName || 'Profile Image'}
                fill
                style={{ objectFit: 'cover' }}
                sizes="40px"
              />
            </div>

            {/* ชื่อร้านและชื่อผู้ให้บริการ */}
            <div>
              <h2 className="text-base font-semibold text-gray-800">ชื่อร้านจ้าาา</h2>
              <p className="text-sm text-gray-500">By {sitter.name}</p>
            </div>
          </div>

          {/* เรตติ้ง */}
          <div className="block  absolute top-0 right-0 text-emerald-500 text-sm">
      {Array.from({ length: sitter.rating }).map((_, index) => (
        <FontAwesomeIcon key={index} icon={faStar} />
      ))}
    </div>
        </div>

        {/* ที่อยู่ */}
        <div className="mt-2 flex items-center gap-2">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-500 text-sm" />
          <p className="text-sm text-gray-600">{sitter.location}</p>
        </div>

        {/* Tags */}
        <div className="mt-2 flex gap-2 flex-wrap">
          {sitter.petTypes.map((type) => (
            <Tag key={type} type={type} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default SitterCard
