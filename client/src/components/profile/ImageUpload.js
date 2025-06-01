import { useRef } from "react";
import Image from "next/image";
import plus from "/public/assets/profile/plus.svg";

export default function ImageUpload({ onChange }) {
  const inputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onChange(file);
  };

  return (
    <div>
      <button
        type="button"
        className="w-[60px] h-[60px] rounded-full bg-[#FFF1EC] flex items-center justify-center shadow cursor-pointer hover:bg-[#FFE0D5] transition-colors duration-200"
        onClick={() => inputRef.current.click()}
      >
        <div className="w-6 h-6 flex items-center justify-center">
          <Image src={plus} alt="plus" width={18} height={18} />
        </div>
      </button>
      <input
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}
