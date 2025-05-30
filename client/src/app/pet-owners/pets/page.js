"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { typeColorMap } from "@/utils/typeColorMap";

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

  if (loading || fetchLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-8 mt-8">
      {/* Sidebar */}
      <div className="w-full md:w-1/4">
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
      </div>
      {/* Main Content */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Pet</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* การ์ดสัตว์เลี้ยง */}
          {pets.length === 0 ? (
            <div className="col-span-3 text-gray-500">No pets found.</div>
          ) : (
            pets.map((pet) => {
              const color = typeColorMap[pet.pet_type] || typeColorMap.default;
              return (
                <div
                  key={pet.pet_id}
                  className="bg-white rounded-2xl shadow p-6 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
                  onClick={() => {
                    router.push(`/pet-owners/edit-pet/${pet.pet_id}`);
                  }}
                >
                  <img
                    src={pet.pet_image_url || "/default-pet.png"}
                    alt={pet.pet_name}
                    className="w-20 h-20 rounded-full object-cover mb-3 border"
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
            className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition border-2 border-dashed border-orange-300"
            onClick={() => {
              router.push("/pet-owners/edit-pet/new");
            }}
          >
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-orange-50 mb-3 text-4xl text-orange-400">
              +
            </div>
            <div className="font-bold text-lg text-orange-500">Create Pet</div>
          </div>
        </div>
      </div>
    </div>
  );
}