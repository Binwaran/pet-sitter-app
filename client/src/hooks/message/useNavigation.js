"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// เก็บประวัติการนำทาง
const STORAGE_KEY = "navigationHistory";

// ฟังก์ชันสำหรับอ่านค่า referrer จาก localStorage
const getStoredReferrer = () => {
  try {
    return sessionStorage.getItem("messagesReferrer") || null;
  } catch (e) {
    return null;
  }
};

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [initialized, setInitialized] = useState(false);

  // โหลดประวัติการนำทางเมื่อ component mount
  useEffect(() => {
    try {
      // ดึงข้อมูลจาก localStorage
      const storedHistory = localStorage.getItem(STORAGE_KEY);
      let history = [];

      if (storedHistory) {
        const parsed = JSON.parse(storedHistory);
        if (Array.isArray(parsed)) {
          history = parsed;
        }
      }

      // เพิ่มหน้าหลักถ้าไม่มี
      if (history.length === 0) {
        history.push("/");
      }

      // อัพเดทสถานะ
      setNavigationHistory(history);
      setInitialized(true);
    } catch (e) {
      setNavigationHistory(["/"]);
      setInitialized(true);
    }
  }, []);

  // บันทึกหน้าปัจจุบันเข้าประวัติการนำทาง
  useEffect(() => {
    if (!initialized || !pathname) return;

    // ถ้าเป็น dynamic route ของ messages ไม่บันทึกลงประวัติ
    if (pathname.match(/\/messages\/[^\/]+$/)) {
      return;
    }

    // อัพเดทประวัติการนำทางโดยไม่เพิ่มรายการซ้ำ
    setNavigationHistory((prev) => {
      // ถ้าเหมือนรายการล่าสุด ไม่ต้องเปลี่ยนแปลง
      if (prev.length > 0 && prev[prev.length - 1] === pathname) {
        return prev;
      }

      // สร้างประวัติใหม่โดยเพิ่ม pathname ปัจจุบัน
      const newHistory = [...prev, pathname];

      // บันทึกลง localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (e) {}

      return newHistory;
    });
  }, [pathname, initialized]);

  // ฟังก์ชันสำหรับการย้อนกลับอย่างปลอดภัย
  const goBackSafely = () => {
    // ถ้าอยู่ที่หน้า /messages
    if (pathname === "/messages") {
      // ลำดับการทำงาน:
      // 1. ลองหา referrer จาก sessionStorage ก่อน (วิธีที่ดีที่สุด)
      // 2. ถ้าไม่มี ลองหาหน้าก่อนหน้าในประวัติที่ไม่ใช่หน้า messages
      // 3. ถ้าไม่พบอะไรเลย ให้กลับไปหน้าหลัก

      // ตรวจสอบ referrer จาก sessionStorage
      const storedReferrer = getStoredReferrer();
      if (storedReferrer) {
        router.push(storedReferrer);
        return;
      }

      // ค้นหาหน้าก่อนหน้าที่ไม่ใช่ /messages จากประวัติ
      for (let i = navigationHistory.length - 2; i >= 0; i--) {
        const path = navigationHistory[i];
        if (path !== "/messages" && !path.match(/\/messages\/[^\/]+$/)) {
          router.push(path);
          return;
        }
      }

      // หากไม่พบหน้าที่เหมาะสม ให้ไปหน้าแรก
      router.push("/");
      return;
    }

    // ถ้าอยู่หน้าอื่นที่ไม่ใช่ /messages ให้ใช้ router.back() ตามปกติ
    router.back();
  };

  // ฟังก์ชันสำหรับการบันทึก referrer
  const saveReferrer = (path) => {
    try {
      sessionStorage.setItem("messagesReferrer", path);
    } catch (e) {}
  };

  return {
    goBackSafely,
    saveReferrer,
    navigationHistory,
    currentPath: pathname,
  };
}
