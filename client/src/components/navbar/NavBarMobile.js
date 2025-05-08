"use client";
import Image from "next/image";
import Link from "next/link";
import sitterlogo from "/public/assets/sitter-logo.svg";
import bell from "/public/assets/navbar/bell.svg";
import message from "/public/assets/navbar/message.svg";
import menu from "/public/assets/navbar/menu.svg";

const NavBarMobile = ({
  isLoggedIn,
  hasNewMessage,
  hasNewNotification,
  open,
  toggleMobileMenu,
  handleLogout,
}) => {
  return (
    <nav className="w-full flex justify-between items-center py-5 px-5 lg:px-0 relative z-50">
      <section className="sm:hidden flex justify-between items-center w-full relative">
        <Link href="/">
          <Image src={sitterlogo} alt="sitter-logo" width={80} />
        </Link>

        {isLoggedIn ? (
          <div className="flex gap-6 items-center">
            {/* Notifications */}
            <div className="relative">
              <Image src={bell} alt="bell" width={24} />
              {hasNewNotification && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full" />
              )}
            </div>

            {/* Messages */}
            <div className="relative">
              <Link href="/messages">
                <Image src={message} alt="message" width={24} className="mr-1" />
              </Link>
              {hasNewMessage && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full" />
              )}
            </div>

            {/* Dropdown Menu */}
            <div className="relative">
              <button
                className="cursor-pointer"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
                type="button"
              >
                <Image src={menu} alt="menu" width={24} height={24} />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded shadow-lg p-2 z-50">
                  <Link href="/profile" className="block py-2 px-4 hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <Image src="/assets/icon=user.png" alt="Profile" width={16} height={16} />
                      <span>Profile</span>
                    </div>
                  </Link>
                  <Link href="/your-pet" className="block py-2 px-4 hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <Image src="/assets/icon=pet.png" alt="Your Pet" width={16} height={16} />
                      <span>Your Pet</span>
                    </div>
                  </Link>
                  <Link href="/history" className="block py-2 px-4 hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <Image src="/assets/icon=list-ul.png" alt="History" width={16} height={16} />
                      <span>History</span>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left py-2 px-4 hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <Image src="/assets/icon=logout.png" alt="Logout" width={16} height={16} />
                      <span>Logout</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <Link
              href="/register/sitter"
              className="py-4 px-6 text-[18px] font-bold"
              onClick={() => toggleMobileMenu(false)}
            >
              Register
            </Link>
            <Link
              href="/login"
              className="py-4 px-6 text-[18px] font-bold"
              onClick={() => toggleMobileMenu(false)}
            >
              Login
            </Link>
            <Link href="/sitters">
              <button className="items-center justify-center w-[168px] h-[48px] bg-[var(--primary-orange-color-500)] text-white text-[16px] font-bold rounded-full tracking-wide">
                Find A Pet Sitter
              </button>
            </Link>
          </div>
        )}
      </section>
    </nav>
  );
};

export default NavBarMobile;
