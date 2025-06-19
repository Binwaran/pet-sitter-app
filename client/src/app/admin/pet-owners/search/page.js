"use client";
import { useEffect, useState } from "react";

export default function OwnerSearchPage() {
  const [owners, setOwners] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwners = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/owners?search=${encodeURIComponent(search)}`);
        if (!res.ok) throw new Error("Failed to fetch owners");
        const data = await res.json();
        setOwners(data);
      } catch (err) {
        setOwners([]);
      }
      setLoading(false);
    };
    fetchOwners();
  }, [search]);

  return (
    <div className="p-8 bg-[#F7F8FA] min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Pet Owner</h1>
      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-4 py-2 rounded w-72"
        />
      </div>
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-black text-white">
              <th className="py-3 px-4 text-left font-normal">Pet Owner</th>
              <th className="py-3 px-4 text-left font-normal">Phone</th>
              <th className="py-3 px-4 text-left font-normal">Email</th>
              <th className="py-3 px-4 text-left font-normal">Pet(s)</th>
              <th className="py-3 px-4 text-left font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8">Loading...</td>
              </tr>
            ) : owners.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8">ไม่พบข้อมูล</td>
              </tr>
            ) : (
              owners.slice(0, 8).map(owner => (
                <tr key={owner.id} className="border-b last:border-b-0">
                  <td className="py-4 px-4 flex items-center gap-3">
                    <img
                      src={owner.profile_image_url || "/default-profile.png"}
                      alt={owner.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span>{owner.name}</span>
                  </td>
                  <td className="py-4 px-4">{owner.phone}</td>
                  <td className="py-4 px-4">{owner.email}</td>
                  <td className="py-4 px-4 text-center">{owner.pet_count ?? 2}</td>
                  <td className="py-4 px-4">
                    {owner.status === "ban" || owner.status === "banned" ? (
                      <span className="flex items-center gap-1 text-red-500 font-medium">
                        <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                        Baned
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-500 font-medium">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                        Normal
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination (mockup) */}
      <div className="flex justify-center mt-6">
        <nav className="flex gap-2 items-center text-gray-400">
          <button className="px-2 py-1" disabled>&lt;</button>
          <button className="w-8 h-8 rounded-full bg-black text-white">1</button>
          <button className="w-8 h-8 rounded-full hover:bg-gray-200">2</button>
          <span>...</span>
          <button className="w-8 h-8 rounded-full hover:bg-gray-200">44</button>
          <button className="w-8 h-8 rounded-full hover:bg-gray-200">45</button>
          <button className="px-2 py-1">&gt;</button>
        </nav>
      </div>
    </div>
  );
}