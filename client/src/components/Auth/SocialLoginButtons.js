import Image from "next/image";
import google from "/public/assets/google.svg";
import facebook from "/public/assets/facebook.svg";

export default function SocialLoginButtons() {
  return (
    <div className="flex gap-3 w-full">
      <button className="flex flex-row justify-center items-center px-6 py-3 rounded-full w-full h-12 bg-[#F6F6F9] hover:text-[#7B7E8F] active:text-[#3A3B46] text-[#3A3B46] text-base font-bold gap-2">
        <Image src={facebook} alt="Facebook" width={20} height={20} />
        Facebook
      </button>
      <button className="flex flex-row justify-center items-center px-6 py-3 rounded-full w-full h-12 bg-[#F6F6F9] hover:text-[#7B7E8F] active:text-[#3A3B46] text-[#3A3B46] text-base font-bold gap-2">
        <Image src={google} alt="Gmail" width={20} height={20} />
        Gmail
      </button>
    </div>
  );
}
