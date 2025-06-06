"use client";
import Image from "next/image";
import Link from "next/link";
import {
  MessageIcon,
  BellIcon,
  HamburgerIcon,
  ProfileIcon,
  PawIcon,
  TabIcon,
  CalendarIcon,
  LogoutIcon,
} from "@/components/icons";

const NavBarMobile = ({
  user,
  isLoggedIn,
  hasNewMessage,
  hasNewNotification,
  open,
  toggleMobileMenu,
  handleLogout,
  className,
}) => {
  const role = user?.role;

  return (
    <nav
      className={`w-full flex justify-between items-center py-3 px-5 relative z-50 h-12 ${
        className || ""
      }`}
    >
      <section className="flex justify-between items-center w-full relative">
        <Link href="/">
          <Image
            src="/assets/sitter-logo.svg"
            alt="sitter-logo"
            width={80}
            height={24}
            priority={true}
          />
        </Link>

        {isLoggedIn ? (
          <div className="flex gap-6 items-center">
            {/* Notifications */}
            <div className="relative cursor-pointer">
              <BellIcon color="#7B7E8F" width={24} height={24} />
              {hasNewNotification && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full" />
              )}
            </div>

            {/* Messages */}
            <div className="relative">
              <Link href="/messages">
                <MessageIcon color="#7B7E8F" width={24} height={24} />
              </Link>
              {hasNewMessage && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full" />
              )}
            </div>

            {/* Dropdown Menu */}
            <div className="relative h-6">
              <button
                className="cursor-pointer"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
                type="button"
              >
                <HamburgerIcon color="#3A3B46" width={24} height={24} />
              </button>

              {open && (
                <div className="absolute right-0 pt-4 w-36 bg-white text-[#5B5D6F] font-medium rounded shadow-lg pb-2 z-50">
                  {role === "owner" ? (
                    <>
                      <Link
                        href="/pet-owners/profile"
                        className="block py-2 px-4 hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <ProfileIcon color="#AEB1C3" width={20} height={20} />
                          <span>Profile</span>
                        </div>
                      </Link>
                      <Link
                        href="/pet-owners/pets"
                        className="block py-2 px-4 hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <PawIcon color="#AEB1C3" width={20} height={20} />
                          <span>Your Pet</span>
                        </div>
                      </Link>
                      <Link
                        href="/pet-owners/booking-history"
                        className="block py-2 px-4 hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <TabIcon color="#AEB1C3" width={20} height={20} />
                          <span>History</span>
                        </div>
                      </Link>
                    </>
                  ) : role === "sitter" ? (
                    <>
                      <Link
                        href="/pet-sitters/profile"
                        className="block py-2 px-4 hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <ProfileIcon color="#AEB1C3" width={20} height={20} />
                          <span>Profile</span>
                        </div>
                      </Link>
                      <Link
                        href="/pet-sitters/booking-list"
                        className="block py-2 px-4 hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <TabIcon color="#AEB1C3" width={20} height={20} />
                          <span>Booking</span>
                        </div>
                      </Link>
                      <Link
                        href="/pet-sitters/calendar"
                        className="block py-2 px-4 hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <CalendarIcon
                            color="#AEB1C3"
                            width={20}
                            height={20}
                          />
                          <span>Calendar</span>
                        </div>
                      </Link>
                    </>
                  ) : null}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left py-2 px-4 hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2 cursor-pointer">
                      <LogoutIcon color="#AEB1C3" width={20} height={20} />
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
              className="font-medium text-lg leading-[26px] text-center px-1 py-2"
              onClick={() => toggleMobileMenu(false)}
            >
              Register
            </Link>
            <Link
              href="/login/sitter"
              className="font-medium text-lg leading-[26px] text-center px-1 py-2"
              onClick={() => toggleMobileMenu(false)}
            >
              Login
            </Link>
          </div>
        )}
      </section>
    </nav>
  );
};

export default NavBarMobile;
