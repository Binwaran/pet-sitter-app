import { useRef } from "react";
import Image from "next/image";
import profileimg from "/public/assets/profile/profileimg.svg";
import plus from "/public/assets/profile/plus.svg";

export default function ImageUpload({ value, onChange }) {
  const inputRef = useRef();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onChange(file);
  };
  return (
    <div>
      <div className="relative w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] md:w-[240px] md:h-[240px] rounded-full bg-[#DCDFED] flex items-center justify-center mx-auto">
        {value ? (
          <img
            src={URL.createObjectURL(value)}
            alt="profile"
            className="w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] md:w-[240px] md:h-[240px] rounded-full object-cover"
          />
        ) : (
          <Image src={profileimg} alt="profileimg" width={87} height={87} />
        )}
        <button
          type="button"
          className="absolute bottom-0 right-0 w-[60px] h-[60px] rounded-full bg-[#FFF1EC] flex items-center justify-center shadow"
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
    </div>
  );
}
