"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { typeColorMap } from "@/utils/typeColorMap";
import Sidebar from "@/components/profile/Sidebar";

export default function YourPetPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    const fetchPets = async () => {
      try {
        const res = await fetch(`/api/pets?ownerId=${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch pets");
        const data = await res.json();
        setPets(Array.isArray(data) ? data : [data]);
      } catch (e) {
        setPets([]);
      }
      setFetchLoading(false);
    };
    fetchPets();
  }, [user, loading, router]);

  if (loading || fetchLoading)
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

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="px-20 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar */}
          <Sidebar />
          {/* <div className="w-full md:w-1/4">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="font-bold text-lg mb-4">Account</div>
          <ul className="space-y-2">
            <li>
              <a href="/pet-owners/profile" className="text-gray-700 hover:underline">Profile</a>
            </li>
            <li>
              <span className="block font-semibold text-orange-500 bg-orange-50 rounded px-3 py-1">Your Pet</span>
            </li>
            <li>
              <a href="/pet-owners/booking-history" className="text-gray-700 hover:underline">Booking History</a>
            </li>
          </ul>
        </div>
      </div> */}

          {/* Main Content */}
          <div className="self-start">
            <div className="bg-white p-10 rounded-2xl shadow-md min-h-[824px]">
              <h2 className="text-2xl font-bold mb-14">Your Pet</h2>{" "}
              {/* ✅ เพิ่ม margin-bottom เพื่อความห่างจาก grid */}
              {/* ✅ ย้ายทั้ง .map() และการ์ด "Create Pet" เข้ามาไว้ใน grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 px-2 sm:px-6">
                {/* การ์ดสัตว์เลี้ยง */}
                {pets.length === 0 ? (
                  <div className="col-span-full text-gray-500">
                    {/* ✅ ใช้ col-span-full เพื่อให้ข้อความ No pets found ครอบทุกคอลัมน์ */}
                    No pets found.
                  </div>
                ) : (
                  pets.map((pet) => {
                    const color =
                      typeColorMap[pet.pet_type] || typeColorMap.default;
                    return (
                      <div
                        key={pet.pet_id}
                        className="bg-white w-[207px] h-[240px] rounded-2xl shadow p-6 flex flex-col items-center cursor-pointer hover:shadow-lg transition border border-gray-200"
                        onClick={() => {
                          router.push(`/pet-owners/edit-pet/${pet.pet_id}`);
                        }}
                      >
                        <img
                          src={pet.pet_image_url || "/default-pet.png"}
                          alt={pet.pet_name}
                          className="w-[104px] h-[104px] rounded-full object-cover mb-3 border"
                        />
                        <div className="font-bold text-lg">{pet.pet_name}</div>
                        <span
                          className={`mt-2 px-4 py-1 rounded-full text-sm font-semibold ${color.bg} ${color.text} ${color.border}`}
                        >
                          {pet.pet_type}
                        </span>
                      </div>
                    );
                  })
                )}

                {/* การ์ด Create Pet */}
                <div
                  className="bg-white w-[207px] h-[240px] rounded-2xl shadow p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition border-2 border-dashed border-orange-300"
                  onClick={() => {
                    router.push("/pet-owners/edit-pet/new");
                  }}
                >
                  <div className="w-[104px] h-[104px] flex items-center justify-center rounded-full bg-orange-50 mb-10 text-4xl text-orange-400">
                    +
                  </div>
                  <div className="font-bold text-lg text-orange-500">
                    Create Pet
                  </div>
                </div>
              </div>{" "}
              {/* ✅ ปิด grid ที่ย้ายมาครอบทั้ง map() และ create card */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
