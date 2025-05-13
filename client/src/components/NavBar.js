"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBarMobile from "./navbar/NavBarMobile";
import NavBarDesktop from "./navbar/NavBarDesktop";

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const toggleDropdown = () => setIsDropdownOpen((v) => !v);
  const toggleMobileMenu = () => setMobileOpen((v) => !v);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch("/api/unread-messages")
      .then((res) => res.json())
      .then((data) => setHasNewMessage(data.unread > 0))
      .catch((err) => console.error("message error", err));
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch("/api/unread-notifications")
      .then((res) => res.json())
      .then((data) => setHasNewNotification(data.unread > 0))
      .catch((err) => console.error("notification error", err));
  }, [isLoggedIn]);

  return (
    <>
      <NavBarMobile
      isLoggedIn={isLoggedIn}
      hasNewMessage={hasNewMessage}
      hasNewNotification={hasNewNotification}
      open={mobileOpen}
      toggleMobileMenu={toggleMobileMenu}
      handleLogout={handleLogout}
        className="block sm:hidden md:hidden lg:hidden" 
      />
      <NavBarDesktop
        isLoggedIn={isLoggedIn}
        hasNewMessage={hasNewMessage}
        hasNewNotification={hasNewNotification}
        isDropdownOpen={isDropdownOpen}
        toggleDropdown={toggleDropdown}
        handleLogout={handleLogout}
        className="hidden sm:hidden md:hidden lg:block" 
      />
    </>
  )
}  

export default NavBar;
