'use client'

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import SidebarSitter from '@/components/sitters/SidebarSitter';
import TopbarSitter from '@/components/sitters/TopbarSitter'
import Image from 'next/image';
import FullCalendarWrapper from '@/components/sitters/FullCalendarWrapper.jsx';

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState('all');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('week');


  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('booking')
        .select('booking_id, start_time, end_time, status, owner:owner_id(name)');

      if (error) {
        console.error('❌ Failed to fetch bookings:', error.message);
        return;
      }

      const formatted = data
        .filter(item => item.start_time && item.end_time)
        .map((item) => {
          let mappedStatus = 'default'; // fallback

          if (item.status === 'pending' || item.status === 'waiting for confirm' || item.status === 'waiting for service') {
            mappedStatus = 'waiting';
          } else if (item.status === 'in service') {
            mappedStatus = 'booked';
          } else if (item.status === 'success') {
            mappedStatus = 'success';
          }

          return {
            id: item.booking_id,
            title: item.owner?.name || 'Unknown',
            start: new Date(item.start_time),
            end: new Date(item.end_time),
            status: mappedStatus,
          };
        });

      setEvents(formatted);
    };

    fetchBookings();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;


  const handleSelectEvent = (event) => {
    router.push(`/pet-sitters/booking-list/${event.id}`);
  };

  return (
  <div className="flex min-h-screen">
    <SidebarSitter /> {/* ✅ Sidebar ด้านซ้าย */}
    <div className="flex-1">
      <TopbarSitter />
      <div className="bg-stone-200 w-full pt-15 pl-15 pr-15 h-full">
          <div className="mb-6 flex flex-row justify-between items-center">
              <h1 className="text-2xl font-semibold mb-4">Calendar</h1>

              {/* ✅ Search Box*/}
              <div className="mb-4 relative w-full max-w-sm">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-4 pr-1 py-2 bg-white border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
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
            <div className="bg-white rounded-lg shadow-md p-4 overflow-y-hidden">
              <FullCalendarWrapper
              events={events.filter(event =>
                (filters === 'all' || event.status === filters) &&
                event.title.toLowerCase().includes(searchTerm)
              )}
              onEventClick={handleSelectEvent}
            />
          </div>
        </div>
    </div>
  </div>
);
}

