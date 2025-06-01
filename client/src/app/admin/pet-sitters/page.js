"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import Sidebar from "@/components/admin/SidebarAdmin";
import StatusDropdown from "@/components/dropdown/StatusDropdown";
import { useRouter } from "next/navigation";
import { Pagination, PaginationItem } from "@mui/material";

// แยก constant ออกมาให้ชัดเจน
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

// แยก components ย่อยออกมา
const StatusBadge = ({ status }) => {
  const config = STATUS_MAP[status] || {
    color: "text-gray-400",
    dot: "bg-gray-400",
    text: "Unknown",
  };

  return (
    <span
      className={`flex items-center gap-2.5 font-medium whitespace-nowrap ${config.color}`}
    >
      <span
        className={`inline-block w-[6px] h-[6px] rounded-full ${config.dot}`}
      />
      {config.text}
    </span>
  );
};

const PaginationControls = ({ count, page, onChange }) => (
  <Pagination
    count={count}
    page={page}
    onChange={onChange}
    siblingCount={1}
    boundaryCount={2}
    showFirstButton={false}
    showLastButton={false}
    sx={{
      "& .MuiPaginationItem-root": {
        backgroundColor: "#FFFFFF",
        color: "#AEB1C3",
        borderRadius: "999px",
        fontWeight: 700,
        fontSize: "16px",
        width: 40,
        height: 40,
      },
      "& .MuiPaginationItem-root.Mui-selected": {
        backgroundColor: "#FFF1EC",
        color: "#FF7037",
      },
      "& .MuiPaginationItem-root.Mui-selected:hover, & .MuiPaginationItem-root.Mui-selected.Mui-focusVisible":
        {
          backgroundColor: "#FFF1EC",
          color: "#FF7037",
        },
      "& .MuiPaginationItem-previousNext": {
        width: 36,
        height: 36,
        backgroundColor: "#F6F6F9",
      },
      "& .MuiPaginationItem-ellipsis": {
        verticalAlign: "bottom",
        display: "inline-flex",
        alignItems: "flex-end",
        justifyContent: "center",
        width: 40,
        height: 25,
        backgroundColor: "#F6F6F9",
      },
    }}
    renderItem={(item) => (
      <PaginationItem
        {...item}
        slots={{
          previous: () => (
            <svg width={8} height={15} viewBox="0 0 8 15" fill="none">
              <path
                d="M7 1L1 7.5L7 14"
                stroke="#AEB1C3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
          next: () => (
            <svg width={8} height={15} viewBox="0 0 8 15" fill="none">
              <path
                d="M1 14L7 7.5L1 1"
                stroke="#AEB1C3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
        }}
      />
    )}
  />
);

const SearchInput = ({ value, onChange }) => (
  <div className="relative w-full sm:w-auto">
    <input
      type="text"
      placeholder="Search..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="pl-3 pr-4 py-3 rounded-lg border border-[#E4E4E7] bg-white h-[48px] w-full sm:min-w-[240px]"
    />
    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="7" stroke="#B0B3C7" strokeWidth="2" />
        <path
          stroke="#B0B3C7"
          strokeWidth="2"
          strokeLinecap="round"
          d="M20 20l-3-3"
        />
      </svg>
    </span>
  </div>
);

// Custom hook สำหรับการจัดการข้อมูล Pet Sitters
const usePetSitters = () => {
  const [sitters, setSitters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  const fetchSitters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/pet-sitters");
      // กรณีที่ backend ยังไม่ได้เรียงลำดับให้ หรือต้องการเรียงอีกครั้งหลังการกรอง
      const sortedData = (res.data.data || []).sort((a, b) => {
        // เรียงตาม updated_at ถ้ามี หรือไม่ก็ใช้ created_at
        const dateA = new Date(a.updated_at || a.created_at || 0);
        const dateB = new Date(b.updated_at || b.created_at || 0);
        return dateB - dateA; // เรียงจากใหม่ไปเก่า (มากไปน้อย)
      });
      setSitters(sortedData);
    } catch (err) {
      console.error("Error fetching pet sitters:", err);
      setSitters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ใช้ useMemo เพื่อคำนวณเฉพาะเมื่อข้อมูลเปลี่ยน
  const filteredSitters = useMemo(() => {
    return sitters.filter((s) => {
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
  }, [sitters, selectedStatus, search]);

  const totalPages = useMemo(
    () => Math.ceil(filteredSitters.length / rowsPerPage),
    [filteredSitters.length, rowsPerPage]
  );

  const paginatedSitters = useMemo(
    () => filteredSitters.slice((page - 1) * rowsPerPage, page * rowsPerPage),
    [filteredSitters, page, rowsPerPage]
  );

  const handlePageChange = useCallback((_, value) => {
    setPage(value);
  }, []);

  const handleStatusChange = useCallback((value) => {
    setSelectedStatus(value);
    setPage(1); // Reset page when filter changes
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    setPage(1); // Reset page when search changes
  }, []);

  return {
    loading,
    paginatedSitters,
    page,
    totalPages,
    selectedStatus,
    search,
    fetchSitters,
    handlePageChange,
    handleStatusChange,
    handleSearchChange,
  };
};

export default function AdminPetSittersPage() {
  const router = useRouter();
  const {
    loading,
    paginatedSitters,
    page,
    totalPages,
    selectedStatus,
    search,
    fetchSitters,
    handlePageChange,
    handleStatusChange,
    handleSearchChange,
  } = usePetSitters();

  useEffect(() => {
    fetchSitters();
  }, [fetchSitters]);

  const handleSitterClick = useCallback(
    (sitterId) => {
      router.push(`/admin/pet-sitters/${sitterId}`);
    },
    [router]
  );

  return (
    <div className="flex flex-col max-h-screen bg-[#F6F6F9] w-full min-w-0">
      <div className="flex w-full min-w-0">
        {/* Sidebar Desktop */}
        <Sidebar className="hidden md:flex h-full sticky top-0 left-0" />

        <div className="flex-1 flex flex-col w-full h-full min-w-0 bg-[#F6F6F9]">
          {/* Sidebar Mobile */}
          <Sidebar
            className="flex flex-row md:hidden sticky top-0 z-30 w-full"
            horizontal
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-6 pt-10 px-12 pb-20 max-w-full w-full transition-all duration-300 relative h-full min-w-0">
            <div className="flex flex-col items-center lg:flex-row sm:justify-between gap-6 w-full">
              <h1 className="text-2xl font-bold whitespace-nowrap">
                Pet Sitter
              </h1>

              {/* Search & Filter */}
              <div className="flex flex-col lg:flex-row gap-4 w-full sm:justify-end">
                <SearchInput value={search} onChange={handleSearchChange} />
                <StatusDropdown
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="w-full h-[48px] bg-white border border-[#E4E4E7] rounded-lg"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl overflow-x-auto w-full">
              <table className="min-w-[600px] w-full h-full">
                <thead>
                  <tr className="bg-black text-white rounded-t-2xl">
                    <th className="py-3 px-4 text-left rounded-tl-2xl font-medium">
                      Full Name
                    </th>
                    <th className="py-3 px-4 text-left font-medium">
                      Pet Sitter Name
                    </th>
                    <th className="py-3 px-4 text-left font-medium">Email</th>
                    <th className="py-3 px-4 text-left rounded-tr-2xl font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6">
                        Loading...
                      </td>
                    </tr>
                  ) : paginatedSitters.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6">
                        No sitters found.
                      </td>
                    </tr>
                  ) : (
                    paginatedSitters.map((sitter) => (
                      <tr
                        key={sitter.user_id}
                        className="cursor-pointer border-b border-[#F0F0F0] last:border-0 hover:bg-gray-50 transition"
                        onClick={() => handleSitterClick(sitter.user_id)}
                      >
                        <td className="py-6 px-4 gap-2.5 h-[92px] flex items-center">
                          <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden">
                            <img
                              src={
                                sitter.profile_image_url ||
                                "/assets/sidebar/profile.svg"
                              }
                              alt={sitter.full_name}
                              className="w-full h-full object-cover bg-gray-100"
                            />
                          </div>
                          <span className="font-medium whitespace-nowrap">
                            {sitter.full_name}
                          </span>
                        </td>
                        <td className="font-medium py-6 px-4 gap-2.5 h-[92px]">
                          {sitter.trade_name}
                        </td>
                        <td className="font-medium py-6 px-4 gap-2.5 h-[92px]">
                          {sitter.email}
                        </td>
                        <td className="py-6 px-4 gap-2.5 h-[92px]">
                          <StatusBadge status={sitter.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-baseline flex-wrap">
              <PaginationControls
                count={totalPages}
                page={page}
                onChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
