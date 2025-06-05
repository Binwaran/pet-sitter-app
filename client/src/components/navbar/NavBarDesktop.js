"use client";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  MessageIcon,
  BellIcon,
  ProfileIcon,
  PawIcon,
  TabIcon,
  CalendarIcon,
  LogoutIcon,
} from "@/components/icons";

const NavBarDesktop = ({
  user: initialUser,
  isLoggedIn,
  hasNewMessage,
  hasNewNotification,
  isDropdownOpen,
  toggleDropdown,
  handleLogout,
  className,
}) => {
  // เพิ่ม state สำหรับจัดการข้อมูล user
  const [userData, setUserData] = useState({
    loading: true,
    user: initialUser || null,
    profile_image_url: initialUser?.profile_img_url || null,
    error: null,
  });

  // สร้างฟังก์ชันดึงข้อมูลด้วย useCallback เพื่อป้องกันการสร้างฟังก์ชันใหม่ที่ไม่จำเป็น
  const fetchUserData = useCallback(async () => {
    if (!isLoggedIn) {
      setUserData((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      // เปลี่ยนเป็นใช้ API /api/me เพื่อดึงข้อมูลผู้ใช้ปัจจุบันผ่าน cookie
      const meRes = await axios.get("/api/me", {
        withCredentials: true, // ส่ง cookie ไปกับ request
      });

      if (!meRes.data || !meRes.data.id) {
        setUserData((prev) => ({ ...prev, loading: false }));
        return;
      }

      // ใช้ user id จาก /api/me เพื่อดึงข้อมูลเพิ่มเติม
      const res = await axios.get(`/api/users/${meRes.data.id}`, {
        withCredentials: true, // ส่ง cookie ไปกับ request
      });

      setUserData({
        loading: false,
        user: {
          ...initialUser,
          ...res.data,
        },
        profile_image_url:
          res.data?.profile_image_url || res.data?.profile_img_url || null,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  }, [isLoggedIn, initialUser]);

  // ดึงข้อมูลเมื่อ component mount
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // ใช้ useMemo เพื่อคำนวณค่า profileImage เมื่อข้อมูลเปลี่ยนเท่านั้น
  const profileImage = useMemo(() => {
    if (!userData.profile_image_url) return "/assets/profile/profileimg.svg";

    try {
      return typeof userData.profile_image_url === "string" &&
        userData.profile_image_url.trim() !== ""
        ? userData.profile_image_url
        : "/assets/profile/profileimg.svg";
    } catch {
      return "/assets/profile/profileimg.svg";
    }
  }, [userData.profile_image_url]);

  // ใช้ข้อมูลจาก state
  const { user, loading } = userData;
  const role = user?.role;

  return (
    <nav
      className={`w-full flex justify-center items-center px-20 relative z-50 h-20 ${
        className || ""
      }`}
    >
      <section className="max-w-full min-w-0 h-full w-full flex justify-between items-center">
        <Link href="/">
          <Image
            src="/assets/sitter-logo.svg"
            alt="sitter-logo"
            width={132}
            height={40}
          />
        </Link>

        {isLoggedIn ? (
          <div className="flex flex-row gap-6 items-center">
            <div className="flex flex-row gap-3 items-center">
              {/* Notifications */}
              <Link href="/notifications">
                <div className="relative w-12 h-12 rounded-full bg-[#F6F6F9] flex items-center justify-center">
                  <BellIcon color="#AEB1C3" width={24} height={24} />
                  {hasNewNotification && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full" />
                  )}
                </div>
              </Link>

              {/* Messages */}
              <Link href="/messages">
                <div className="relative w-12 h-12 rounded-full bg-[#F6F6F9] flex items-center justify-center">
                  <MessageIcon color="#AEB1C3" width={24} height={24} />
                  {hasNewMessage && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full" />
                  )}
                </div>
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#F6F6F9]">
                  <Image
                    src={profileImage}
                    alt="Profile"
                    fill
                    sizes="48px"
                    className="object-cover cursor-pointer rounded-full"
                    onClick={toggleDropdown}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/assets/profile/profileimg.svg";
                    }}
                  />
                </div>
                {isDropdownOpen && (
                  <div className="absolute right-0 pt-4 w-36 bg-white text-[#5B5D6F] font-medium rounded shadow-lg pb-2 z-50">
                    {role === "owner" ? (
                      <>
                        <Link
                          href="/pet-owners/profile"
                          className="block py-2 px-4 hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-2">
                            <ProfileIcon
                              color="#AEB1C3"
                              width={20}
                              height={20}
                            />
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
                            <ProfileIcon
                              color="#AEB1C3"
                              width={20}
                              height={20}
                            />
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
                      <div className="flex items-center gap-2">
                        <LogoutIcon color="#AEB1C3" width={20} height={20} />
                        <span>Logout</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <Link href="/pet-sitters">
              <button className="items-center justify-center w-[168px] h-[48px] bg-[var(--primary-orange-color-500)] text-white text-[16px] font-bold rounded-full tracking-wide hover:bg-[#FF986F] active:bg-[#E44A0C] hover:scale-105 focus:scale-100 transition-transform cursor-pointer">
                Find A Pet Sitter
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex md:gap-4 gap-2 items-center">
            <Link
              href="/register/sitter"
              className="font-medium text-lg leading-[26px] text-center py-4 px-6"
            >
              Register
            </Link>
            <Link
              href="/login/sitter"
              className="font-medium text-lg leading-[26px] text-center py-4 px-6"
            >
              Login
            </Link>
            <Link href="/pet-sitters">
              <button className="flex items-center justify-center w-[168px] h-[48px] min-w-[120px] gap-2 py-3 px-6 bg-[var(--primary-orange-color-500)] text-white text-[16px] font-bold rounded-full hover:bg-[#FF986F] active:bg-[#E44A0C] hover:scale-105 focus:scale-100 transition-transform cursor-pointer">
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
