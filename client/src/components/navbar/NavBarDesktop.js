"use client";
import Image from "next/image";
import Link from "next/link";


const NavBarDesktop = ({
  isLoggedIn,
  hasNewMessage,
  hasNewNotification,
  isDropdownOpen,
  toggleDropdown,
  handleLogout,
}) => {
  return (
    <nav className="w-full flex justify-between items-center py-5 px-5 lg:px-0 relative z-50">
      <section className="max-w-[1440px] mx-auto min-w-0 w-full sm:flex sm:justify-between sm:items-center lg:px-20 hidden">
        <Link href="/">
          <Image src="/assets/sitter-logo.svg" alt="sitter-logo" width={131} height={131} />
        </Link>

        {isLoggedIn ? (
          <div className="flex gap-4 items-center">
            {/* Notifications */}
            <Link href="/notifications">
              <div className="relative p-2 rounded-full bg-gray-100">
                <Image src="/assets/navbar/bell.svg" alt="bell" width={20} height={20} />
                {hasNewNotification && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full" />
                )}
              </div>
            </Link>

            {/* Messages */}
            <Link href="/messages">
              <div className="relative p-2 rounded-full bg-gray-100">
                <Image src="/assets/navbar/message.svg" alt="message" width={20} height={20} />
                {hasNewMessage && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full" />
                )}
              </div>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <Image
                src="/assets/avatar.png"
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full cursor-pointer"
                onClick={toggleDropdown}
              />
              {isDropdownOpen && (
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

            {/* CTA */}
            <Link href="/pet-sitters">
              <button className="items-center justify-center w-[168px] h-[48px] bg-[var(--primary-orange-color-500)] text-white text-[16px] font-bold rounded-full tracking-wide">
                Find A Pet Sitter
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex md:gap-4 gap-2 items-center">
            <Link href="/register/sitter" className="py-4 px-2 text-[18px] font-bold">
              Register
            </Link>
            <Link href="/login/sitter" className="py-4 px-4 text-[18px] font-bold">
              Login
            </Link>
            <Link href="/pet-sitters">
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

export default NavBarDesktop;
