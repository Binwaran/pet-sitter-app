"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBarMobile from "./navbar/NavBarMobile";
import NavBarDesktop from "./navbar/NavBarDesktop";
import { useAuth } from "@/context/AuthContext";
import useUnreadMessages from "@/hooks/message/useUnreadMessages";

const NavBar = () => {
  const { user, loading, logout } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const unreadCount = useUnreadMessages(user?.id);
  const hasNewMessage = unreadCount > 0;

  // เพิ่ม useEffect นี้เพื่ออัพเดท isLoggedIn จาก user
  useEffect(() => {
    // ถ้า user มีค่า แสดงว่า login แล้ว
    setIsLoggedIn(!!user);
  }, [user]);

  const toggleDropdown = () => setIsDropdownOpen((v) => !v);
  const toggleMobileMenu = () => setMobileOpen((v) => !v);

  const handleLogout = async () => {
    await logout();
    alert("Logout successful");
    router.push("/");
  };

  useEffect(() => {
    if (!user) return;
    fetch("/api/unread-notifications", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setHasNewNotification(data.unread > 0))
      .catch((err) => {});
  }, [user]);

  return (
    <>
      <NavBarMobile
        user={user}
        isLoggedIn={isLoggedIn}
        hasNewMessage={hasNewMessage}
        hasNewNotification={hasNewNotification}
        open={mobileOpen}
        toggleMobileMenu={toggleMobileMenu}
        handleLogout={handleLogout}
        className="block md:hidden"
      />
      <NavBarDesktop
        user={user}
        isLoggedIn={isLoggedIn}
        hasNewMessage={hasNewMessage}
        hasNewNotification={hasNewNotification}
        isDropdownOpen={isDropdownOpen}
        toggleDropdown={toggleDropdown}
        handleLogout={handleLogout}
        className="hidden md:block"
      />
    </>
  );
};

export default NavBar;
