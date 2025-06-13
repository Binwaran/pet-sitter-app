
'use client'

import { useEffect, useState } from 'react';
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import SidebarSitter from '@/components/sitters/SidebarSitter';
import TopbarSitter from '@/components/sitters/TopbarSitter'
import CustomToolbar from '@/components/sitters/CalendarToolbar'


const localizer = dayjsLocalizer(dayjs);

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState('all');

  const router = useRouter();

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('booking')
        .select('booking_id, start_time, end_time, status, owner:owner_id(name)');

      if (error) {
        console.error('❌ Failed to fetch bookings:', error.message);
        return;
      }

      const formatted = data.map((item) => ({
        id: item.booking_id,
        title: item.owner?.name || 'Unknown',
        start: new Date(item.start_time),
        end: new Date(item.end_time),
        status: item.status,
      }));

      setEvents(formatted);
    };

    fetchBookings();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };


  const eventStyleGetter = (event) => {
    let bgColor = '#f3f3f3';
    if (event.status === 'waiting') bgColor = '#fcd6ea';
    if (event.status === 'booked') bgColor = '#fde9d6';
    if (event.status === 'success') bgColor = '#d6fce6';
    return {
      style: {
        backgroundColor: bgColor,
        border: '1px solid #f97316',
        color: '#000',
        fontWeight: 500,
        fontSize: '14px',
      },
    };
  };

  const handleSelectEvent = (event) => {
    router.push(`/pet-sitters/booking/${event.id}`);
  };

  return (
  <div className="flex min-h-screen">
    <SidebarSitter /> {/* ✅ Sidebar ด้านซ้าย */}
    <div className="flex-1">
      <TopbarSitter />
      <div className="bg-stone-200 w-full pt-15 pl-15 pr-15 h-full">
          <div className="mb-6 flex flex-row justify-between items-center">
              <h1 className="text-2xl font-semibold mb-4">Calendar</h1>

              {/* ✅ Search Box ต้องอยู่นอก Calendar */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <Calendar
                localizer={localizer}
                events={events.filter(event =>
                  (filters === 'all' || event.status === filters) &&
                  event.title.toLowerCase().includes(searchTerm)
                )}
                defaultView="week"
                views={['week']}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 'calc(100vh - 64px)' }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent}
                components={{
                  toolbar: (props) => (
                    <CustomToolbar {...props} filters={filters} setFilters={setFilters} />
                  )
                }}
              />
          </div>
        </div>
    </div>
  </div>
);
}

