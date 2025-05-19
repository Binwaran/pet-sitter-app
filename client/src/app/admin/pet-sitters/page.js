"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "@/components/admin/SidebarAdmin";

const STATUS_MAP = {
  "waiting for approval": {
    text: "Waiting for approve",
    color: "text-[#FA8AC0]",
    dot: "bg-[#FA8AC0]",
  },
  approved: {
    text: "Approved",
    color: "text-[#1CCD83]",
    dot: "bg-[#1CCD83]",
  },
  rejected: {
    text: "Rejected",
    color: "text-[#EA1010]",
    dot: "bg-[#EA1010]",
  },
};

export default function AdminPetSittersPage() {
  const [sitters, setSitters] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSitters = async () => {
    setLoading(true);
    const res = await axios.get("/api/all-pet-sitters");
    setSitters(res.data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSitters();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F7F7FA]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 px-12 py-10">
        <h1 className="text-2xl font-bold mb-8">Pet Sitter</h1>
        {/* Search & Filter */}
        <div className="flex flex-row gap-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 rounded-lg border border-[#E4E4E7] bg-white w-[260px] pl-10"
              disabled // mockup only
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke="#B0B3C7" strokeWidth="2"/><path stroke="#B0B3C7" strokeWidth="2" strokeLinecap="round" d="M20 20l-3-3"/></svg>
            </span>
          </div>
          <select className="px-4 py-2 rounded-lg border border-[#E4E4E7] bg-white w-[160px]" disabled>
            <option>All status</option>
            <option>Waiting for approve</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-black text-white rounded-t-2xl">
                <th className="py-4 px-6 text-left rounded-tl-2xl font-medium">Full Name</th>
                <th className="py-4 px-6 text-left font-medium">Pet Sitter Name</th>
                <th className="py-4 px-6 text-left font-medium">Email</th>
                <th className="py-4 px-6 text-left rounded-tr-2xl font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8">Loading...</td>
                </tr>
              ) : sitters.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">No sitters found.</td>
                </tr>
              ) : (
                sitters.map((sitter) => (
                  <tr key={sitter.user_id} className="border-b border-[#F0F0F0] last:border-0">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img
                        src={sitter.profile_image || "/assets/sidebar/profile.svg"}
                        alt={sitter.full_name}
                        className="w-10 h-10 rounded-full object-cover bg-gray-100"
                      />
                      <span className="font-medium">{sitter.full_name}</span>
                    </td>
                    <td className="py-4 px-6">{sitter.trade_name}</td>
                    <td className="py-4 px-6">{sitter.email}</td>
                    <td className="py-4 px-6">
                      <span className={`flex items-center gap-2 font-medium ${STATUS_MAP[sitter.status]?.color}`}>
                        <span className={`inline-block w-2 h-2 rounded-full ${STATUS_MAP[sitter.status]?.dot}`} />
                        {STATUS_MAP[sitter.status]?.text || "-"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination (mockup) */}
        <div className="flex justify-center items-center gap-2 mt-8">
          <button className="text-gray-400 px-2 py-1 rounded" disabled>
            &lt;
          </button>
          <button className="bg-[#F7F7FA] text-black font-semibold px-3 py-1 rounded-full">1</button>
          <button className="bg-white text-black px-3 py-1 rounded-full">2</button>
          <span className="text-gray-400">...</span>
          <button className="bg-white text-black px-3 py-1 rounded-full">44</button>
          <button className="bg-white text-black px-3 py-1 rounded-full">45</button>
          <button className="text-gray-400 px-2 py-1 rounded" disabled>
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}