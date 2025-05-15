// PetSitterList.jsx
import SitterCard from './SitterCard';
import Pagination from './Pagination';

const PetSitterList = ({ pet_sitter }) => {
  if (!pet_sitter || pet_sitter.length === 0) {
    return <p className="text-gray-500">ไม่พบข้อมูลพี่เลี้ยงสัตว์</p>;
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        {pet_sitter.map((sitter) => (
          <SitterCard key={sitter.user_id} pet_sitter={sitter} />
        ))}
      </div>
      <Pagination />
    </div>
  );
};

export default PetSitterList;
