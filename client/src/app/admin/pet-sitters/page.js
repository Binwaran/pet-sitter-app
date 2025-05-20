"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "@/components/admin/SidebarAdmin";
import StatusDropdown from "@/components/dropdown/StatusDropdown";
import { useRouter } from "next/navigation";

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
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [search, setSearch] = useState("");

  const router = useRouter();

  const fetchSitters = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/pet-sitters");
      setSitters(res.data.data || []);
    } catch (err) {
      setSitters([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSitters();
  }, []);

  // ฟิลเตอร์ sitters ตาม status และ search
  const filteredSitters = sitters.filter((s) => {
    const matchStatus =
      selectedStatus === "all" ? true : s.status === selectedStatus;
    const keyword = search.trim().toLowerCase();
    const matchSearch =
      !keyword ||
      (s.full_name && s.full_name.toLowerCase().includes(keyword)) ||
      (s.trade_name && s.trade_name.toLowerCase().includes(keyword)) ||
      (s.email && s.email.toLowerCase().includes(keyword));
    return matchStatus && matchSearch;
  });

  return (
    <div className="flex flex-col max-h-screen bg-[#F9FAFB] w-full min-w-0">
      <div className="flex w-full min-w-0">
        {/* Sidebar Desktop (Left) */}
        <Sidebar className="hidden md:flex h-full sticky top-0 left-0" />
        <div className="flex-1 flex flex-col w-full h-full min-w-0">
          {/* Sidebar Mobile (Top) */}
          <Sidebar
            className="flex flex-row md:hidden sticky top-0 z-30 w-full"
            horizontal
          />
          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-4 pt-[56px] md:pt-12 px-2 sm:px-4 md:px-8 lg:px-12 py-6 md:py-10 max-w-full w-full transition-all duration-300 relative h-full max-h-screen min-w-0">
            <div className="flex flex-col md:flex-row md:justify-between gap-6 w-full">
              <h1 className="text-2xl font-bold mb-2 md:mb-2">Pet Sitter</h1>
              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-2">
                <div className="relative w-full sm:w-auto">
                  <input
                    id="search"
                    name="search"
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-[#E4E4E7] bg-white h-[48px] w-full sm:w-[260px] pl-10"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                      <circle
                        cx="11"
                        cy="11"
                        r="7"
                        stroke="#B0B3C7"
                        strokeWidth="2"
                      />
                      <path
                        stroke="#B0B3C7"
                        strokeWidth="2"
                        strokeLinecap="round"
                        d="M20 20l-3-3"
                      />
                    </svg>
                  </span>
                </div>
                <StatusDropdown
                  value={selectedStatus}
                  onChange={(value) => setSelectedStatus(value)}
                  className="w-full h-[48px] bg-white border border-[#E4E4E7] rounded-lg"
                />
              </div>
            </div>
            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-x-auto w-full">
              <table className="min-w-[600px] w-full">
                <thead>
                  <tr className="bg-black text-white rounded-t-2xl">
                    <th className="py-4 px-4 sm:px-6 text-left rounded-tl-2xl font-medium">
                      Full Name
                    </th>
                    <th className="py-4 px-4 sm:px-6 text-left font-medium">
                      Pet Sitter Name
                    </th>
                    <th className="py-4 px-4 sm:px-6 text-left font-medium">
                      Email
                    </th>
                    <th className="py-4 px-4 sm:px-6 text-left rounded-tr-2xl font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4}>Loading...</td>
                    </tr>
                  ) : filteredSitters.length === 0 ? (
                    <tr>
                      <td colSpan={4}>No sitters found.</td>
                    </tr>
                  ) : (
                    filteredSitters.map((sitter) => (
                      <tr
                        key={sitter.user_id}
                        className="cursor-pointer border-b border-[#F0F0F0] last:border-0 hover:bg-gray-50 transition"
                        onClick={() =>
                          router.push(`/admin/pet-sitters/${sitter.user_id}`)
                        }
                      >
                        <td className="py-4 px-4 sm:px-6 flex items-center gap-3">
                          <img
                            src={
                              sitter.profile_image_url ||
                              "/assets/sidebar/profile.svg"
                            }
                            alt={sitter.full_name}
                            className="w-10 h-10 rounded-full object-cover bg-gray-100"
                          />
                          <span className="font-medium">
                            {sitter.full_name}
                          </span>
                        </td>
                        <td className="py-4 px-4 sm:px-6">
                          {sitter.trade_name}
                        </td>
                        <td className="py-4 px-4 sm:px-6">{sitter.email}</td>
                        <td className="py-4 px-4 sm:px-6">
                          <span
                            className={`flex items-center gap-2 font-medium ${
                              STATUS_MAP[sitter.status]?.color
                            }`}
                          >
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${
                                STATUS_MAP[sitter.status]?.dot
                              }`}
                            />
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
            <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
              <button className="text-gray-400 px-2 py-1 rounded" disabled>
                &lt;
              </button>
              <button className="bg-[#F7F7FA] text-black font-semibold px-3 py-1 rounded-full">
                1
              </button>
              <button className="bg-white text-black px-3 py-1 rounded-full">
                2
              </button>
              <span className="text-gray-400">...</span>
              <button className="bg-white text-black px-3 py-1 rounded-full">
                44
              </button>
              <button className="bg-white text-black px-3 py-1 rounded-full">
                45
              </button>
              <button className="text-gray-400 px-2 py-1 rounded" disabled>
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
