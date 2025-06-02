"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRequireRole } from "@/hooks/useRequireRole";
import { useAuth } from "@/context/AuthContext";
import ImageUpload from "@/components/profile/ImageUpload";
import Sidebar from "@/components/profile/Sidebar";
import profileimg from "public/assets/profile/profileimg.svg";

const uploadToStorage = async (file) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error } = await supabase.storage
    .from("profile-images") // เปลี่ยนชื่อ bucket ตามจริง
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("profile-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export default function OwnerProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
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
        imageUrl = await uploadToStorage(profileImageFile);

        // ✅ อัปเดต state ให้รูปใหม่แสดงทันที
        setProfile((prev) => ({
          ...prev,
          profile_image_url: imageUrl,
        }));
      } catch (error) {
        console.error("Upload error:", error.message);
        alert("อัปโหลดรูปไม่สำเร็จ");
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
      alert("Profile saved!");
    } else {
      alert("บันทึกข้อมูลไม่สำเร็จ");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!authorized) return null; // หรือแสดง spinner

  console.log("🧪 profile:", profile);
  console.log("🧪 profile.profile_image_url:", profile.profile_image_url);

  const imageSrc =
    previewUrl?.trim() ||
    (profile?.profile_image_url?.startsWith("blob:")
      ? ""
      : profile?.profile_image_url?.trim()) ||
    "/assets/profile/profileimg.svg";

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="px-20 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar */}
          <Sidebar />

          {/* Main */}
          <div className="bg-white p-10 rounded-2xl shadow-md min-h-[824px]">
            <form onSubmit={handleSubmit}>
              <h1 className="text-2xl font-bold mb-14">Profile</h1>

              <div className="flex flex-col items-start mb-14">
                <div className="relative w-[240px] h-[240px]">
                  {/* Profile image circle */}
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    <Image
                      key={imageSrc}
                      src={imageSrc}
                      alt="avatar"
                      fill
                      className={`object-cover transition-all duration-300 ${
                        imageSrc.includes("/assets/profile/profileimg.svg")
                          ? "scale-45" // 👈 ทำให้รูป default เล็กลง 75%
                          : ""
                      }`}
                    />
                  </div>

                  {/* Upload button */}
                  <div className="absolute bottom-1 right-1 rounded-full shadow-md">
                    <ImageUpload
                      value={profileImageFile}
                      onChange={handleProfileImageChange}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-1 font-medium ">Your Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Email*</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Phone*</label>
                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                    required
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="birthday"
                    value={profile.birthday || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-10">
                <button
                  type="submit"
                  className="bg-orange-500  text-white px-6 py-3 rounded-full font-semibold cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-orange-400"
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
