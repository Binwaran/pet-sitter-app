import SitterCard from './SitterCard'

const PetSitterList = ({ pet_sitter, onSelectSitter }) => {
  if (!pet_sitter || pet_sitter.length === 0) {
    return <p className="text-gray-500">ไม่พบข้อมูลพี่เลี้ยงสัตว์</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {pet_sitter.map((sitter) => (
        <div
          key={sitter.user_id}
          onClick={() => onSelectSitter(sitter)}
          className="cursor-pointer"
        >
          <SitterCard pet_sitter={sitter} />
        </div>
      ))}
    </div>
  )
}

export default PetSitterList
