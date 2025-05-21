"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function OwnerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    birthday: "",
    profile_image_url: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ตรวจสอบ login และ role
    const userId = localStorage.getItem("user_id");
    const role = localStorage.getItem("role");
    if (!userId || role !== "owner") {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      const res = await fetch(`/api/profile?user_id=${userId}`);
      const data = await res.json();
      if (res.ok && data) setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  // handle input change
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // handle update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const userId = localStorage.getItem("user_id");
    const res = await fetch(`/api/profile?user_id=${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setLoading(false);
    if (res.ok) alert("Profile saved!");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F9FAFB]">
      {/* Sidebar */}
      <aside className="w-full md:w-1/4 p-6">
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="font-semibold mb-4">Account</h2>
          <ul className="space-y-2">
            <li className="text-orange-500 font-medium">Profile</li>
            <li className="text-gray-500">Your Pet</li>
            <li className="text-gray-500">Booking History</li>
            <li className="text-gray-500">Change Password</li>
          </ul>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 flex justify-center items-start py-10">
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow p-8 w-full max-w-2xl"
          >
            <h1 className="text-2xl font-bold mb-8">Profile</h1>
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <Image
                  src={profile.profile_image_url || "/default-avatar.png"}
                  alt="avatar"
                  width={120}
                  height={120}
                  className="rounded-full bg-gray-100"
                />
                <button
                  type="button"
                  className="absolute bottom-2 right-2 bg-orange-100 text-orange-500 rounded-full p-2"
                >
                  +
                </button>
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
              disabled={loading}
            >
              {loading ? "Saving..." : "Update Profile"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}