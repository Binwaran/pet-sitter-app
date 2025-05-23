import SitterCard from './SitterCard'
import Link from 'next/link'

const PetSitterList = ({ pet_sitter }) => {
  if (!pet_sitter || pet_sitter.length === 0) {
    return <p className="text-gray-500">ไม่พบข้อมูลพี่เลี้ยงสัตว์</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {pet_sitter.map((sitter) => (
        <Link
          key={sitter.user_id}
          href={`/pet-sitters/${sitter.user_id}`}
          className="cursor-pointer"
        >
          <SitterCard pet_sitter={sitter} />
        </Link>
      ))}
    </div>
  )
}

export default PetSitterList
