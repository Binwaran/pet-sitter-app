"use client";

import Image from "next/image";
import avatar from "/public/assets/avatar.png";
import message from "/public/assets/navbar/message.svg";

export default function Topbar() {
  return (
    <header className="flex flex-wrap items-center justify-between w-full bg-white px-8 py-4 shadow-none gap-2 sm:gap-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <Image
            src={avatar}
            alt="Avatar"
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
        <span className="text-lg font-medium text-[#344054]">Jane Maison</span>
      </div>
      <button className="w-12 h-12 rounded-full bg-[#F2F4F7] flex items-center justify-center">
        <Image src={message} alt="Message" width={24} height={24} />
      </button>
    </header>
  );
}
