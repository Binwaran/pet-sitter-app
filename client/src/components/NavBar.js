import { useState } from "react";
import Image from "next/image";
import sitterlogo from "/public/assets/sitter-logo.svg";
import bell from "/public/assets/navbar/bell.svg";
import message from "/public/assets/navbar/message.svg";
import menu from "/public/assets/navbar/menu.svg";
import Link from "next/link";

const NavBar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full flex justify-center py-5 px-5 lg:px-0 relative z-50">
      {/* desktop */}
      <section className="max-w-[1440px] min-w-0 w-full sm:flex sm:justify-between sm:items-center lg:px-20 hidden">
        <Link href={"/"}>
          <Image src={sitterlogo} alt="sitter-logo" width={131} />
        </Link>
        <div className="flex md:gap-4 gap-2 items-center">
          <Link
            href="/register/sitter"
            className="py-4 px-6 text-[18px] font-bold"
            onClick={() => setOpen(false)}
          >
            Become a Pet Sitter
          </Link>
          {/* <button className="py-4 px-6 font-medium text-[18px]">
            Become a Pet Sitter
          </button> */}
          {/* <button className="py-4 px-6 font-medium text-[18px]">Login</button> */}
          <Link
            href="/login"
            className="py-4 px-6 text-[18px] font-bold"
            onClick={() => setOpen(false)}
          >
            Login
          </Link>
          <Link href={"/sitters"}>
            <button className="items-center justify-center w-[168px] h-[48px] bg-[var(--primary-orange-color-500)] text-white text-[16px] font-bold rounded-full tracking-wide">
              Find A Pet Sitter
            </button>
          </Link>
        </div>
      </section>

      {/* Mobile */}
      <section className="sm:hidden flex justify-between items-center w-full relative">
        <Link href={"/"}>
          <Image src={sitterlogo} alt="sitter-logo" width={80} />
        </Link>
        <div className="flex gap-2 items-center">
          <Image src={bell} alt="bell" width={24} />
          <Link href={"/messages"}>
            <Image src={message} alt="message" width={24} className="mr-1" />
          </Link>
          <button
            className="cursor-pointer"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            type="button"
          >
            <Image src={menu} alt="menu" width={24} height={24} />
          </button>
        </div>
        {/* Fullscreen Overlay Menu */}
        {open && (
          <div className="fixed inset-0 bg-white z-[999] flex flex-col">
            <div className="flex justify-between items-center px-5 pt-5">
              <Link href={"/"}>
                <Image src={sitterlogo} alt="sitter-logo" width={80} />
              </Link>
              {/* Hamburger menu button for close */}
              <div className="flex gap-2 items-center">
                <Image src={bell} alt="bell" width={24} />
                <Link href={"/messages"}>
                  <Image
                    src={message}
                    alt="message"
                    width={24}
                    className="mr-1"
                  />
                </Link>
                <button
                  className="cursor-pointer"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  type="button"
                >
                  <Image src={menu} alt="menu" width={24} height={24} />
                </button>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-start items-center gap-10 pt-10">
              <Link
                href="/register/sitter"
                className="text-[18px] font-bold"
                onClick={() => setOpen(false)}
              >
                Become a Pet Sitter
              </Link>
              <Link
                href="/login"
                className="text-[18px] font-bold"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/sitters"
                className="w-[90vw] max-w-[500px]"
                onClick={() => setOpen(false)}
              >
                <button className="w-full h-[64px] bg-[var(--primary-orange-color-500)] text-white text-[18px] font-bold rounded-full tracking-wide">
                  Find A Pet Sitter
                </button>
              </Link>
            </div>
          </div>
        )}
      </section>
    </nav>
  );
};

export default NavBar;
