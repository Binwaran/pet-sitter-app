"use client";

import React, { useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import "@/styles/FullCalendarCustom.css";
import CalendarHeader from "./CalendarHeader";
import { useState } from "react";

export default function FullCalendarWrapper({ events, onEventClick }) {
  const calendarRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState("timeGridWeek");

  const handleNavigate = (direction) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      if (direction === "prev") calendarApi.prev();
      if (direction === "next") calendarApi.next();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <CalendarHeader
        currentDate={currentDate}
        viewType={viewType}
        onNavigate={handleNavigate}
      />
      {/* เพิ่ม div ครอบนอกสุดเพื่อควบคุม overflow */}
      <div className="calendar-container overflow-x-auto">
        <div className="relative min-w-[800px]">
          <FullCalendar
            ref={calendarRef}
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            allDaySlot={false}
            slotMinTime="06:00:00"
            slotDuration="00:30:00"
            slotLabelInterval="00:30:00"
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
            headerToolbar={false}
            customButtons={{
              customToday: {
                text: "Today",
                click: () => {
                  calendarRef.current?.getApi().today();
                },
              },
              customPrev: {
                text: "<",
                click: () => {
                  calendarRef.current?.getApi().prev();
                },
              },
              customNext: {
                text: ">",
                click: () => {
                  calendarRef.current?.getApi().next();
                },
              },
            }}
            events={events}
            eventClick={(info) => {
              if (onEventClick && typeof onEventClick === "function") {
                onEventClick(info);
              }
            }}
            eventContent={(arg) => {
              const status = arg.event.extendedProps?.status || "default";
              let style = "";

              if (status === "waiting") {
                style =
                  "bg-[#FFF0F1] border-4 border-[#FA8AC0] text-[#FA8AC0] text-center";
              } else if (status === "booked") {
                style =
                  "bg-[#FFF1EC] border-4 border-[#FF7037] text-[#E44A0C] text-center";
              } else if (status === "success") {
                style = "bg-[#E7FDF4] text-[#1CCD83] text-center";
              }

              return (
                <div
                  className={`w-full h-full flex items-center justify-center font-medium text-sm leading-6 overflow-hidden cursor-pointer ${style}`}
                >
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
              const dayName = dayjs(arg.date).format("ddd").toUpperCase(); // SUN
              const dayNumber = dayjs(arg.date).format("D"); // 23
              return (
                <div>
                  <div>{dayName}</div>
                  <div>{dayNumber}</div>
                </div>
              );
            }}
          />
          <img
            src="/assets/clock.svg"
            className="absolute left-0.75 top-0.75 w-7.5 h-7.5 z-10"
            alt="Clock"
          />
        </div>
      </div>
    </div>
  );
}
