'use client'

import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from 'dayjs';
import '@/styles/FullCalendarCustom.css';
import CalendarHeader from './CalendarHeader'
import { useState } from 'react'

export default function FullCalendarWrapper({ events, onEventClick }) {
  const calendarRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState('timeGridWeek');

  const handleNavigate = (direction) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      if (direction === 'prev') calendarApi.prev();
      if (direction === 'next') calendarApi.next();
    }
  };

  return (
    <div>
        <CalendarHeader 
        currentDate={currentDate} 
        viewType={viewType}
        onNavigate={handleNavigate}
        />
        <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        allDaySlot={false}
        slotMinTime="06:00:00"
        slotDuration="00:30:00"
        slotLabelInterval="00:30:00"
        slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        headerToolbar={false}
        customButtons={{
            customToday: {
            text: 'Today',
            click: () => {
                calendarRef.current?.getApi().today();
            }
            },
            customPrev: {
            text: '<',
            click: () => {
                calendarRef.current?.getApi().prev();
            }
            },
            customNext: {
            text: '>',
            click: () => {
                calendarRef.current?.getApi().next();
            }
            },
        }}
        events={events}
        eventClick={(info) => {
            onEventClick(info.event.extendedProps);
        }}
        eventContent={(arg) => {
            const status = arg.event.extendedProps.status;
            let style = '';

            if (status === 'waiting') {
            style = 'bg-pink-100 border-2 border-pink-400 text-pink-700';
            } else if (status === 'booked') {
            style = 'bg-orange-100 border-2 border-orange-500 text-orange-700';
            } else if (status === 'success') {
            style = 'bg-green-100 border-2 border-green-500 text-green-700';
            }

            return (
            <div className={`w-full h-full flex items-center justify-center font-medium rounded-md ${style}`}>
                {arg.event.title}
            </div>
            );
        }}
        height="auto"
        datesSet={(arg) => {
          setCurrentDate(arg.start);
          setViewType(arg.view.type);
        }}

        dayHeaderContent={(arg) => {
        const dayName = dayjs(arg.date).format('ddd').toUpperCase(); // SUN
        const dayNumber = dayjs(arg.date).format('D'); // 23
        return (
            <div>
            <div>{dayName}</div>
            <div>{dayNumber}</div>
            </div>
        );
        }}

        />
    </div>
  );
}
