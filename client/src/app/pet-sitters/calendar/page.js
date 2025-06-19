"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import Sidebar from "@/components/sitters/SidebarSitter";
import Topbar from "@/components/sitters/TopbarSitter";
import Image from "next/image";
import FullCalendarWrapper from "@/components/sitters/FullCalendarWrapper.jsx";
import { useAuth } from "@/context/AuthContext";

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState("all");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("week");
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true); // เพิ่ม loading state

      try {
        const { data, error } = await supabase
          .from("booking")
          .select(
            "booking_id, start_time, end_time, status, owner:owner_id(name)"
          )
          // ถ้าเป็น pet sitter ให้ดึงเฉพาะรายการของตัวเอง
          .eq("sitter_id", user?.id);

        if (error) {
          throw error;
        }

        const formatted = data
          .filter((item) => item.start_time && item.end_time)
          .map((item) => {
            let mappedStatus = "default"; // fallback

            if (
              item.status === "pending" ||
              item.status === "waiting for confirm"
            ) {
              mappedStatus = "waiting";
            } else if (
              item.status === "waiting for service" ||
              item.status === "in service"
            ) {
              mappedStatus = "booked";
            } else if (item.status === "success") {
              mappedStatus = "success";
            }

            return {
              id: item.booking_id,
              title: item.owner?.name || "Unknown",
              start: new Date(item.start_time),
              end: new Date(item.end_time),
              status: mappedStatus,
            };
          });

        setEvents(formatted);
      } catch (err) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchBookings();
    }
  }, [user?.id]);

  const [searchTerm, setSearchTerm] = useState("");
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSelectEvent = (eventInfo) => {
    if (eventInfo && eventInfo.event && eventInfo.event.id) {
      const bookingId = eventInfo.event.id;
      router.push(`/pet-sitters/booking-list/${bookingId}`);
    } else {
      router.push("/pet-sitters/booking-list");
    }
  };

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

          <div className="flex-1 flex flex-col w-full max-w-full gap-6 px-4 py-6 md:px-10 md:pb-20 md:pt-10 mt-[123px] md:mt-[72px] transition-all duration-300 relative h-full min-w-0">
            <div className="flex flex-col items-center lg:flex-row justify-center gap-6 w-full">
              <h1 className="text-2xl font-bold w-full">Calendar</h1>

              {/* ✅ Search Box*/}
              <div className="relative lg:max-w-60 w-full">
                <input
                  id="searchInput"
                  name="searchInput"
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-3 pr-4 py-3 bg-white border border-gray-300 rounded-lg w-full box-border h-12 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Image
                    src="/assets/searchicon.png"
                    alt="Search"
                    width={20}
                    height={20}
                    priority
                    unoptimized
                  />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl flex flex-col p-6 gap-4 overflow-y-hidden">
              {loading ? (
                <div className="py-20 text-center text-gray-500">
                  Loading calendar events...
                </div>
              ) : (
                <FullCalendarWrapper
                  events={events.filter(
                    (event) =>
                      (filters === "all" || event.status === filters) &&
                      event.title.toLowerCase().includes(searchTerm)
                  )}
                  onEventClick={handleSelectEvent}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
