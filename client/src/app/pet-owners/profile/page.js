"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRequireRole } from "@/hooks/useRequireRole";
import { useAuth } from "@/context/AuthContext";
import ImageUpload from "@/components/profile/ImageUpload";

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
      setPreviewUrl("");
    }
  }, [profileImageFile]);

  const handleProfileImageChange = (file) => {
    setProfileImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = profile.profile_image_url;

    // ตัวอย่าง: อัปโหลดไฟล์ไป storage ก่อน (ต้องเขียนฟังก์ชัน uploadToStorage เอง)
    if (profileImageFile) {
      // imageUrl = await uploadToStorage(profileImageFile);
      // setProfile({ ...profile, profile_image_url: imageUrl });
    }

    const res = await fetch(`/api/profile?user_id=${user.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, profile_image_url: imageUrl }),
    });
    if (res.ok) alert("Profile saved!");
  };

  if (loading) return <div>Loading...</div>;
  if (!authorized) return null; // หรือแสดง spinner

  return (
    <div className="flex min-h-screen bg-[#FAFAFB]">
      {/* Sidebar */}
      <aside className="w-full md:w-1/4 p-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold mb-6 text-lg">Account</h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-orange-500 font-semibold">
              <span className="inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
              Profile
            </li>
            <li className="text-gray-500 hover:text-orange-500 cursor-pointer transition">
              Your Pet
            </li>
            <li className="text-gray-500 hover:text-orange-500 cursor-pointer transition">
              Booking History
            </li>
          </ul>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 flex justify-center items-start py-12">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-10 w-full max-w-2xl">
          <h1 className="text-2xl font-bold mb-8">Profile</h1>
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-[140px] h-[140px] rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {(previewUrl || profile.profile_image_url) ? (
                <Image
                  src={previewUrl || profile.profile_image_url}
                  alt="avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="12" fill="#E5E7EB"/>
                  <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-6 2-6 4v2h12v-2c0-2-2-4-6-4z" fill="#BDBDBD"/>
                </svg>
              )}
              <div className="absolute bottom-2 right-2">
                <ImageUpload value={profileImageFile} onChange={handleProfileImageChange} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium">Your Name*</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2"
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
                className="w-full border rounded-lg px-4 py-2"
                required
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Email*</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Date of Birth</label>
              <input
                type="date"
                name="birthday"
                value={profile.birthday || ""}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-8 bg-orange-500 text-white px-8 py-2 rounded-full font-semibold"
          >
            Update Profile
          </button>
        </form>
      </main>
    </div>
  );
}