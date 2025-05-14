import SitterCard from './SitterCard'

const PetSitterList = ({ sitters }) => {
  if (!sitters || !Array.isArray(sitters) || sitters.length === 0) {
  return <p className="text-gray-500">ไม่พบข้อมูลพี่เลี้ยงสัตว์</p>
}

  return (
    <div className="grid grid-cols-1 gap-4">
      {sitters.map((sitter) => (
        <SitterCard key={sitter.uuid || sitter.id || Math.random()} sitter={sitter} />
      ))}
    </div>
  )
}

export default PetSitterList
