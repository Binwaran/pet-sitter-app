"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireRole } from "@/hooks/useRequireRole";
import { useAuth } from "@/context/AuthContext";
import ImageUpload from "@/components/profile/ImageUpload";
import Sidebar from "@/components/profile/Sidebar";
import { uploadFile } from "@/utils/uploadHelpers"; // นำเข้าฟังก์ชัน uploadFile
import { CalendarIcon } from "@/components/icons";

export default function OwnerProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, updateUserData, fetchUser } = useAuth();
  const { loading, authorized } = useRequireRole("owner");
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    birthday: "",
    profile_image_url: "",
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "owner") {
      router.push("/login");
      return;
    }
    const fetchProfile = async () => {
      const res = await fetch(`/api/profile?user_id=${user.id}`);
      const data = await res.json();
      if (res.ok && data) setProfile(data);
    };
    fetchProfile();
  }, [user, authLoading, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      setProfile({ ...profile, [name]: onlyNums });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  // เมื่อเลือกไฟล์ใหม่ ให้สร้าง preview url
  useEffect(() => {
    if (profileImageFile) {
      const url = URL.createObjectURL(profileImageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null); // fallback โดย JSX
    }
  }, [profileImageFile]);

  const handleProfileImageChange = (file) => {
    setProfileImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = profile.profile_image_url;

    if (profileImageFile) {
      try {
        imageUrl = await uploadFile(profileImageFile, "profile");
      } catch (error) {
        console.error("Upload error:", error.message);
        alert("Failed to upload image"); // Changed from "อัปโหลดรูปไม่สำเร็จ"
        return;
      }
    }

    const res = await fetch(`/api/profile?user_id=${user.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...profile,
        profile_image_url: imageUrl,
      }),
    });

    if (res.ok) {
      // รีเซ็ตค่า profileImageFile หลังอัพโหลดสำเร็จ
      setProfileImageFile(null);

      // อัพเดท AuthContext หลังบันทึกข้อมูลสำเร็จ
      if (imageUrl && imageUrl !== user.profile_image_url) {
        // อัพเดทเฉพาะถ้ามีการเปลี่ยนแปลง URL รูปภาพ
        updateUserData({
          ...user,
          profile_image_url: imageUrl,
          name: profile.name, // อัพเดทชื่อด้วยในกรณีที่มีการเปลี่ยน
        });
        console.log("Updated profile image in context:", imageUrl);
      } else {
        // ดึงข้อมูลใหม่จาก API เพื่อความมั่นใจ
        await fetchUser();
        console.log("Fetched fresh user data");
      }

      alert("Profile saved!");
    } else {
      alert("Failed to save profile data"); // Changed from "บันทึกข้อมูลไม่สำเร็จ"
    }
  };

  if (loading)
    return (
      <div className="flex flex-col min-h-screen bg-[#F9FAFB] relative">
        <div className="flex-1 flex justify-center items-center">
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#FF7C43] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  if (!authorized) return null; // หรือแสดง spinner

  console.log("🧪 profile:", profile);
  console.log("🧪 profile.profile_image_url:", profile.profile_image_url);

  const imageSrc =
    previewUrl ||
    profile?.profile_image_url ||
    "/assets/profile/profileimg.svg";

  return (
    <div className="bg-[#FAFAFB]">
      <div className="md:px-20 md:pt-10 md:pb-20">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:max-w-81 md:max-h-89 flex md:gap-6 md:pr-8">
            <Sidebar />
          </div>

          {/* Main */}
          <div className="bg-white px-4 py-6 md:p-10 md:rounded-2xl h-full w-full">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-6 md:gap-15"
            >
              <div className="flex items-center justify-start">
                <h1 className="text-xl md:text-2xl font-bold leading-7 md:leading-8">
                  Profile
                </h1>
              </div>
              <div className="flex flex-col gap-4 md:gap-6">
                {/* Profile Image */}
                <div className="flex items-center justify-start gap-10">
                  <ImageUpload
                    value={profileImageFile || profile.profile_image_url}
                    onChange={handleProfileImageChange}
                    requiresApproval={false}
                  />
                </div>
                {/* Form */}
                <div className="flex flex-col gap-4 md:gap-10 w-full">
                  <div className="flex flex-col lg:flex-row gap-4 md:gap-10">
                    <label
                      htmlFor="name"
                      className="font-medium flex flex-col gap-1 w-full"
                    >
                      Your Name*
                      <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        value={profile.name}
                        onChange={handleChange}
                        className="w-full leading-[150%] box-border h-12 border border-gray-200 rounded-lg pl-3 pr-4 py-3"
                        required
                        autoComplete="name"
                      />
                    </label>
                    <label
                      htmlFor="email"
                      className="font-medium flex flex-col gap-1 w-full"
                    >
                      Email*
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        value={profile.email}
                        onChange={handleChange}
                        className="w-full leading-[150%] box-border h-12 border border-gray-200 rounded-lg pl-3 pr-4 py-3"
                        required
                        autoComplete="email"
                      />
                    </label>
                  </div>
                  <div className="flex flex-col lg:flex-row gap-4 md:gap-10">
                    <label
                      htmlFor="phone"
                      className="font-medium flex flex-col gap-1 w-full"
                    >
                      Phone*
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        placeholder="Enter your phone number"
                        value={profile.phone}
                        onChange={handleChange}
                        className="w-full leading-[150%] box-border h-12 border border-gray-200 rounded-lg pl-3 pr-4 py-3"
                        required
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="tel"
                      />
                    </label>
                    <label
                      htmlFor="birthday"
                      className="font-medium flex flex-col gap-1 w-full"
                    >
                      Date of Birth
                      <div className="relative w-full">
                        <input
                          type="date"
                          id="birthday"
                          name="birthday"
                          placeholder="Select your date of birth"
                          value={profile.birthday || ""}
                          onChange={handleChange}
                          className="w-full leading-[150%] box-border h-12 border border-gray-200 rounded-lg pl-3 pr-10 py-3 
                                    [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute 
                                    [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full 
                                    [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                          {/* คุณสามารถใช้ไอคอนจาก library อื่นๆ หรือรูปภาพก็ได้ */}
                          <CalendarIcon className="w-5 h-5" color="#7B7E8F" />
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-[#FF7037] text-white px-6 py-3 rounded-full font-bold cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-[#FF986F]"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
