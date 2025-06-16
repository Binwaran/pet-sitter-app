"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import Sidebar from "@/components/sitters/SidebarSitter";
import Topbar from "@/components/sitters/TopbarSitter";
import StatusDropdown from "@/components/dropdown/StatusDropdown";
import { useRouter } from "next/navigation";
import { Pagination, PaginationItem } from "@mui/material";
import { useAuth } from "@/context/AuthContext"; // เพิ่มการนำเข้า useAuth

// Define status constants with appropriate colors matching the Figma
const STATUS_MAP = {
  "waiting for confirm": {
    text: "Waiting for confirm",
    color: "text-[#FA8AC0]",
    dot: "bg-[#FA8AC0]",
  },
  "waiting for service": {
    text: "Waiting for service",
    color: "text-[#F9C846]",
    dot: "bg-[#F9C846]",
  },
  "in service": {
    text: "In service",
    color: "text-[#76D0FC]",
    dot: "bg-[#76D0FC]",
  },
  success: {
    text: "Success",
    color: "text-[#1CCD83]",
    dot: "bg-[#1CCD83]",
  },
  cancelled: {
    text: "Cancelled",
    color: "text-[#EA1010]",
    dot: "bg-[#EA1010]",
  },
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusKey = status?.toLowerCase() || "";
  const config = STATUS_MAP[statusKey] || {
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

// Pagination Component
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

// Search Input Component
const SearchInput = ({ value, onChange }) => (
  <div className="relative w-full sm:w-auto">
    <input
      id="search-input"
      name="search"
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

// Custom hook for managing booking data
const useBookings = () => {
  const { user } = useAuth(); // ใช้ user จาก context
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewedBookings, setViewedBookings] = useState([]);
  const rowsPerPage = 8;

  // เพิ่ม state สำหรับการเรียงลำดับ
  const [sortConfig, setSortConfig] = useState({
    key: "default", // เริ่มต้นใช้การเรียงลำดับเดิม
    direction: "desc",
  });

  // เพิ่มฟังก์ชันสำหรับการเรียงลำดับ
  const handleSort = useCallback((key) => {
    setSortConfig((prev) => {
      // ถ้าคลิกที่คอลัมน์เดิม
      if (prev.key === key) {
        // ถ้าเป็น desc อยู่แล้ว เปลี่ยนเป็น asc
        if (prev.direction === "desc") {
          return { key, direction: "asc" };
        }
        // ถ้าเป็น asc อยู่แล้ว เปลี่ยนกลับไปเป็น default (ยกเลิกการเรียง)
        else {
          return { key: "default", direction: "desc" };
        }
      }
      // ถ้าคลิกที่คอลัมน์ใหม่ เริ่มด้วย desc
      else {
        return { key, direction: "desc" };
      }
    });
  }, []);

  // โหลดข้อมูล viewedBookings จาก localStorage และ API เมื่อ component โหลด
  useEffect(() => {
    if (!user?.id) return;

    try {
      // ยังคงใช้ localStorage เพื่อให้การแสดงผลเร็วขึ้น
      const storedViewedBookings = JSON.parse(
        localStorage.getItem("sitterViewedBookings") || "[]"
      );
      setViewedBookings(storedViewedBookings);

      // ดึงข้อมูลการอ่านจากฐานข้อมูล
      const fetchViewedBookings = async () => {
        try {
          const res = await axios.get("/api/pet-sitters/viewed-bookings", {
            withCredentials: true,
          });

          if (res.data && Array.isArray(res.data.data)) {
            const serverViewedBookings = res.data.data.map(
              (item) => item.booking_id
            );

            // รวมข้อมูลจาก localStorage และ server แล้วกำจัดค่าซ้ำ
            const combinedViewedBookings = [
              ...new Set([...storedViewedBookings, ...serverViewedBookings]),
            ];

            // อัปเดต state และ localStorage
            setViewedBookings(combinedViewedBookings);
            localStorage.setItem(
              "sitterViewedBookings",
              JSON.stringify(combinedViewedBookings)
            );
          }
        } catch (err) {
        }
      };

      fetchViewedBookings();
    } catch (e) {
      localStorage.removeItem("sitterViewedBookings");
    }
  }, [user?.id]);

  // เพิ่มฟังก์ชันตรวจสอบว่า booking ได้ถูกดูแล้วหรือไม่
  const isBookingViewed = useCallback(
    (bookingId) => viewedBookings.includes(bookingId),
    [viewedBookings]
  );

  // เพิ่มฟังก์ชันบันทึกการดู booking
  const markBookingAsViewed = useCallback(
    async (bookingId) => {
      if (!isBookingViewed(bookingId)) {
        const newViewedBookings = [...viewedBookings, bookingId];
        setViewedBookings(newViewedBookings);
        localStorage.setItem(
          "sitterViewedBookings",
          JSON.stringify(newViewedBookings)
        );

        // บันทึกการอ่านลงฐานข้อมูล
        try {
          await axios.post(
            "/api/pet-sitters/mark-booking-viewed",
            { bookingId },
            { withCredentials: true }
          );
        } catch (err) {
        }
      }
    },
    [viewedBookings, isBookingViewed]
  );

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      // เปลี่ยนเป็นใช้ cookie แทน token ผ่าน withCredentials
      const res = await axios.get(`/api/pet-sitters/booking-list`, {
        withCredentials: true, // ส่ง cookie ไปกับ request
      });

      setBookings(res.data.data || []);
    } catch (err) {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // เพิ่ม user?.id ใน dependency

  // Filter bookings based on search and status
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchStatus =
        selectedStatus === "all" ? true : booking.status === selectedStatus;

      const keyword = search.trim().toLowerCase();
      const matchSearch =
        !keyword ||
        (booking.owner_name &&
          booking.owner_name.toLowerCase().includes(keyword));

      return matchStatus && matchSearch;
    });
  }, [bookings, selectedStatus, search]);

  // เพิ่มการเรียงลำดับตาม sortConfig
  const sortedBookings = useMemo(() => {
    if (filteredBookings.length === 0 || sortConfig.key === "default") {
      return filteredBookings;
    }

    const sortable = [...filteredBookings];

    return sortable.sort((a, b) => {
      // กำหนดตัวแปรสำหรับเก็บค่าที่จะนำมาเปรียบเทียบ
      let valueA, valueB;

      // ดึงค่าตามคอลัมน์ที่ต้องการเรียง
      switch (sortConfig.key) {
        case "owner_name":
          // เรียงตามชื่อ Pet Owner
          valueA = (a.owner_name || "").toLowerCase();
          valueB = (b.owner_name || "").toLowerCase();
          break;

        case "pet_count":
          // เรียงตามจำนวนสัตว์เลี้ยง
          valueA = parseInt(a.pet_count || 0);
          valueB = parseInt(b.pet_count || 0);
          break;

        case "duration":
          // เรียงตามระยะเวลา
          valueA = parseFloat(a.duration || 0);
          valueB = parseFloat(b.duration || 0);
          break;

        case "status":
          // เรียงตามสถานะ
          valueA = (a.status || "").toLowerCase();
          valueB = (b.status || "").toLowerCase();
          break;

        case "booked_date":
          // กรณีวันที่ ใช้โค้ดเดิม
          const startTimeA = a.start_time
            ? new Date(a.start_time)
            : new Date(0);
          const startTimeB = b.start_time
            ? new Date(b.start_time)
            : new Date(0);

          // เปรียบเทียบ start_time ตรงๆ ด้วย Date object
          const startComparison =
            sortConfig.direction === "asc"
              ? startTimeA - startTimeB // น้อยไปมาก (เก่าไปใหม่)
              : startTimeB - startTimeA; // มากไปน้อย (ใหม่ไปเก่า)

          // ถ้า start_time เท่ากัน ให้เรียงตาม end_time
          if (startComparison === 0) {
            const endTimeA = a.end_time ? new Date(a.end_time) : new Date(0);
            const endTimeB = b.end_time ? new Date(b.end_time) : new Date(0);

            return sortConfig.direction === "asc"
              ? endTimeA - endTimeB
              : endTimeB - endTimeA;
          }

          return startComparison;

        default:
          return 0; // ไม่มีการเรียงลำดับ
      }

      // เรียงลำดับตาม valueA และ valueB (ยกเว้นกรณี booked_date ที่ได้ return ไปแล้ว)
      if (sortConfig.key !== "booked_date") {
        if (valueA < valueB) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      }
    });
  }, [filteredBookings, sortConfig]);

  const totalPages = useMemo(
    () => Math.ceil(sortedBookings.length / rowsPerPage),
    [sortedBookings.length, rowsPerPage]
  );

  const paginatedBookings = useMemo(
    () => sortedBookings.slice((page - 1) * rowsPerPage, page * rowsPerPage),
    [sortedBookings, page, rowsPerPage]
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
    paginatedBookings,
    page,
    totalPages,
    selectedStatus,
    search,
    fetchBookings,
    handlePageChange,
    handleStatusChange,
    handleSearchChange,
    isBookingViewed,
    markBookingAsViewed,
    sortConfig, // เพิ่มค่า sortConfig
    handleSort, // เพิ่มฟังก์ชัน handleSort
  };
};

const BookingPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    loading,
    paginatedBookings,
    page,
    totalPages,
    selectedStatus,
    search,
    fetchBookings,
    handlePageChange,
    handleStatusChange,
    handleSearchChange,
    isBookingViewed,
    markBookingAsViewed,
    sortConfig, // รับค่า sortConfig
    handleSort, // รับฟังก์ชัน handleSort
  } = useBookings();

  // ย้าย handleBookingClick มาไว้ที่นี่ ก่อน conditional return
  const handleBookingClick = useCallback(
    (bookingId) => {
      markBookingAsViewed(bookingId);
      router.push(`/pet-sitters/booking-list/${bookingId}`);
    },
    [router, markBookingAsViewed]
  );

  useEffect(() => {
    if (user?.id) {
      fetchBookings();
    }
  }, [fetchBookings, user?.id]);

  // Show loading state while auth is in progress
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading user information...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-screen bg-[#F6F6F9] w-full min-w-0">
      <div className="flex w-full min-w-0">
        <Sidebar className="hidden md:flex w-full" />
        <div className="flex-1 flex flex-col w-full h-full min-w-0 bg-[#F6F6F9]">
          {/* Header container */}
          <div className="fixed top-0 left-0 right-0 z-50 md:left-[240px] flex flex-col">
            <Topbar className="w-full" />
            <div className="md:hidden w-full">
              <Sidebar className="flex flex-row md:hidden bg-white shadow-[4px_4px_24px_0px_#0000000A]" />
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 flex flex-col w-full max-w-full gap-6 px-4 py-6 md:px-10 md:pb-20 md:pt-10 mt-[123px] md:mt-[72px] transition-all duration-300 relative h-full min-w-0">
            <div className="flex flex-col items-center lg:flex-row sm:justify-between gap-6 w-full">
              <h1 className="text-2xl font-bold whitespace-nowrap">
                Booking List
              </h1>

              {/* Search & Filter */}
              <div className="flex flex-col lg:flex-row gap-4 w-full sm:justify-end">
                <SearchInput value={search} onChange={handleSearchChange} />
                <StatusDropdown
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  statusOptions={[
                    { value: "all", label: "All status" },
                    {
                      value: "waiting for confirm",
                      label: "Waiting for confirm",
                    },
                    {
                      value: "waiting for service",
                      label: "Waiting for service",
                    },
                    { value: "in service", label: "In service" },
                    { value: "success", label: "Success" },
                    { value: "cancelled", label: "Cancelled" },
                  ]}
                  className="w-full h-[48px] bg-white border border-[#E4E4E7] rounded-lg"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl overflow-x-auto w-full">
              <table className="min-w-[600px] w-full h-full">
                <thead>
                  <tr className="bg-black text-white rounded-t-2xl">
                    {/* เพิ่ม cursor-pointer และ onClick handler สำหรับ Pet Owner Name */}
                    <th
                      className="py-3 px-4 text-left rounded-tl-2xl font-medium whitespace-nowrap cursor-pointer hover:text-[#FF7037] transition-colors"
                      onClick={() => handleSort("owner_name")}
                    >
                      Pet Owner Name
                      {sortConfig.key === "owner_name" && (
                        <span className="ml-1 inline-block">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </th>

                    {/* เพิ่ม cursor-pointer และ onClick handler สำหรับ Pet(s) */}
                    <th
                      className="py-3 px-4 text-left font-medium cursor-pointer hover:text-[#FF7037] transition-colors"
                      onClick={() => handleSort("pet_count")}
                    >
                      Pet(s)
                      {sortConfig.key === "pet_count" && (
                        <span className="ml-1 inline-block">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </th>

                    {/* เพิ่ม cursor-pointer และ onClick handler สำหรับ Duration */}
                    <th
                      className="py-3 px-4 text-left font-medium cursor-pointer hover:text-[#FF7037] transition-colors"
                      onClick={() => handleSort("duration")}
                    >
                      Duration
                      {sortConfig.key === "duration" && (
                        <span className="ml-1 inline-block">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </th>

                    {/* Booked Date - เดิม */}
                    <th
                      className="py-3 px-4 text-left font-medium cursor-pointer hover:text-[#FF7037] transition-colors"
                      onClick={() => handleSort("booked_date")}
                    >
                      Booked Date
                      {sortConfig.key === "booked_date" && (
                        <span className="ml-1 inline-block">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </th>

                    {/* เพิ่ม cursor-pointer และ onClick handler สำหรับ Status */}
                    <th
                      className="py-3 px-4 text-left rounded-tr-2xl font-medium cursor-pointer hover:text-[#FF7037] transition-colors"
                      onClick={() => handleSort("status")}
                    >
                      Status
                      {sortConfig.key === "status" && (
                        <span className="ml-1 inline-block">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6">
                        Loading...
                      </td>
                    </tr>
                  ) : paginatedBookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6">
                        No bookings found.
                      </td>
                    </tr>
                  ) : (
                    paginatedBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="cursor-pointer border-b border-[#F0F0F0] last:border-0 hover:bg-gray-50 transition"
                        onClick={() => handleBookingClick(booking.id)}
                      >
                        <td className="py-6 px-4 gap-2.5 h-[92px] flex items-center">
                          <div className="flex items-center gap-2.5">
                            {/* เพิ่มจุดสีส้มสำหรับ booking ที่ยังไม่ถูกดู */}
                            {!isBookingViewed(booking.id) && (
                              <span className="inline-block w-[8px] h-[8px] rounded-full bg-[#FF7037]" />
                            )}
                            <span className="font-medium whitespace-nowrap">
                              {booking.owner_name}
                            </span>
                          </div>
                        </td>
                        <td className="font-medium py-6 px-4 gap-2.5 h-[92px] whitespace-nowrap">
                          {booking.pet_count || 0}
                        </td>
                        <td className="font-medium py-6 px-4 gap-2.5 h-[92px] whitespace-nowrap">
                          {booking.duration || 0} hours
                        </td>
                        <td className="font-medium py-6 px-4 gap-2.5 h-[92px] whitespace-nowrap">
                          {booking.booked_date || "N/A"}
                        </td>
                        <td className="py-6 px-4 gap-2.5 h-[92px]">
                          <StatusBadge status={booking.status} />
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
          </main>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
