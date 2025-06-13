import toast, { Toaster } from "react-hot-toast";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import DatePicker from "react-datepicker";
import Select from 'react-select';
import { format } from "date-fns";
import useUnavailableTimes from "@/hooks/booking/useUnavailableTimes";
import { supabase } from "@/utils/supabase";


export default function BookingModal({ sitterId, isOpen, onClose }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const unavailableTimes = useUnavailableTimes(sitterId, date);

  const timeOptions = useMemo(() => {
    return Array.from({ length: 48 }, (_, i) => {
      const hour = String(Math.floor(i / 2)).padStart(2, "0");
      const minute = i % 2 === 0 ? "00" : "30";
      const time = `${hour}:${minute}`;
      return {
        value: time,
        label: time,
        isDisabled: unavailableTimes.includes(time),
      };
    });
  }, [unavailableTimes]);
  console.log("timeOptions", timeOptions);

  const buildDateTime = (date, timeStr) => {
    const [hourStr, minuteStr] = timeStr.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    const result = new Date(date);
    result.setHours(hour);
    result.setMinutes(minute);
    result.setSeconds(0);
    result.setMilliseconds(0);
    return result.toLocaleString("sv-SE").replace(" ", "T");// ✅ แปลงเป็น ISO string
  };


  const handleContinue = async () => {
    if (!date || !startTime || !endTime) {
      toast.error("Please select all required fields.");
      return;
    }

    const startDateTime = buildDateTime(date, startTime);
    const endDateTime = buildDateTime(date, endTime);

    if (startDateTime >= endDateTime) {
      toast.error("End time must be after start time.");
      return;
    }
    
    // ✅ เช็คว่าระยะเวลาน้อยกว่า 1 ชั่วโมงมั้ย
  const diffMs = new Date(endDateTime) - new Date(startDateTime);
    const hours = diffMs / (60 * 60 * 1000);

    if (hours < 1) {
      toast.error("Booking must be at least 1 hour.");
      return;
    }

    console.log("Blocked times: ", unavailableTimes);
    if (!Array.isArray(unavailableTimes)) {
      toast.error("Booking data is still loading. Please wait a moment.");
      return;
    }

    const isOverlapping = unavailableTimes.some((time) => {
      const [hour, minute] = time.split(":").map(Number);
      const blocked = new Date(date);
      blocked.setHours(hour, minute, 0, 0);
      const isoBlocked = blocked.toISOString();
      return isoBlocked >= startDateTime && isoBlocked < endDateTime;
    });

    if (isOverlapping) {
      
      return;
    }

    const { data, error } = await supabase
      .from("booking")
      .insert([
        {
          owner_id: user?.id, // ✅ สำคัญมาก
          sitter_id: sitterId,
          start_time: startDateTime,
          end_time: endDateTime,
          date: startDateTime.split("T")[0], // ✅ แยก date เก็บเฉพาะวัน
          duration_hour: hours,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ])
      .select(); // ✅ เพื่อเอา booking_id กลับมา

    if (error) {
      toast.error("Failed to create booking. Please try again.");
      console.error("Insert booking error:", JSON.stringify(error, null, 2));
      return;
    }

    const bookingId = data[0]?.booking_id;
    if (!bookingId) {
      toast.error("Booking created but booking ID not returned.");
      return;
    }

    // ✅ ดึง trade_name ของ sitter ปัจจุบันจาก Supabase แล้วอัปเดต bookingDetails ใน localStorage
    const { data: sitterData } = await supabase
      .from('pet_sitter')
      .select('trade_name')
      .eq('user_id', sitterId)
      .single();

    // โหลด bookingDetails เดิม (ถ้ามี)
    const prev = localStorage.getItem('bookingDetails');
    let bookingDetails = prev ? JSON.parse(prev) : {};
    bookingDetails = {
      ...bookingDetails,
      sitter_id: sitterId,
      trade_name: sitterData?.trade_name || '',
      start_time: startDateTime,
      end_time: endDateTime,
      date: startDateTime.split("T")[0],
      duration_hour: hours,
      booking_id: bookingId,
    };
    localStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
    console.log('Saved bookingDetails:', bookingDetails); // Debug: confirm trade_name is present

    onClose();
    router.push("/pet-sitters/booking");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 sm:z-50 bg-black/50 flex items-start sm:items-center justify-center w-[375px] sm:w-full h-full">
      <Toaster
        position="top-center"
        containerStyle={{
          top: '50%',
          transform: 'translateY(-50%)',
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            fontSize: '16px',
            border: '1px solid #eee',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            iconTheme: {
              primary: 'green',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: 'red',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="bg-white rounded-lg p-6 w-full max-w-md h-full sm:h-[300px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Booking</h2>
          <button className="cursor-pointer" onClick={onClose}>✕</button>
        </div>
        <p className="mb-4">Select date and time you want to schedule the service.</p>

        <div className="space-y-4 w-full">
            {/* Date Picker */}
            
            <div className="flex items-center gap-3 w-full max-w-sm">
              <Image
                src="/assets/icon=calender.png"
                alt="calendar"
                width={20}
                height={20}
                className="opacity-50"
              />
              <DatePicker
                selected={date}
                onChange={(date) => setDate(date)}
                dateFormat="dd MMM, yyyy"
                placeholderText="Select date"
                className="custom-input hover:border-orange-500 transition-colors duration-200"
                calendarClassName="custom-calendar"
                popperPlacement="bottom-start"
                formatWeekDay={(nameOfDay) => nameOfDay.charAt(0)}
                minDate={new Date()} // ✅ ห้ามเลือกวันย้อนหลัง!
                dayClassName={(day) => {
                  const isToday =
                    day.toDateString() === new Date().toDateString() &&
                    day.getMonth() === new Date().getMonth();

                  return isToday ? "today-only" : "";
                }}
                renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
                <div className="flex justify-between items-center px-4 py-2 w-full">
                  <h2 className="text-xl font-semibold">
                    {format(date, 'MMMM yyyy')}
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={decreaseMonth}>
                      <Image
                        src="/assets/icon=arrow-l.png"
                        alt="previous month"
                        width={20}
                        height={20}
                        className="opacity-50"
                      />
                    </button>
                    <button onClick={increaseMonth}>
                      <Image
                        src="/assets/icon=arrow-r.png"
                        alt="previous month"
                        width={20}
                        height={20}
                        className="opacity-50"
                      />
                    </button>
                  </div>
                </div>
              )}
                
                              
              />
            </div>

            {/* Time Pickers */}
            <div className="flex gap-3">
              {/* Start Time */}
              <div className="flex items-center gap-3 w-1/2">
                <Image
                  src="/assets/icon=clock.png"
                  alt="start time"
                  width={20}
                  height={20}
                  className="opacity-50"
                />
                <Select
                  options={timeOptions}
                  onChange={(selected) => setStartTime(selected.value)}
                  className=" w-[140px] sm:w-[177px] cursor-text"
                  classNamePrefix="react-select"
                  placeholder="Start Time"
                  isOptionDisabled={(option) => option.isDisabled}
                  styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused ? "#f97316" : "#d1d5db", // 🧡 ส้มตอน focus, เทาตอนปกติ
                    boxShadow: state.isFocused ? "0 0 0 1px #f97316" : "none",
                    "&:hover": {
                      borderColor: "#f97316"
                    },
                  }),
                }}
                />
              </div>
              <h2 className="flex justify-center items-center">-</h2>

              {/* End Time */}
              <div className="flex items-center gap-3 w-1/2">
                <Select
                  options={timeOptions}
                  onChange={(selected) => setEndTime(selected.value)}
                  className="w-[140px] sm:w-[177px] cursor-text"
                  classNamePrefix="react-select"
                  placeholder="End Time"
                  isOptionDisabled={(option) => option.isDisabled}
                  styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused ? "#f97316" : "#d1d5db", // 🧡 ส้มตอน focus, เทาตอนปกติ
                    boxShadow: state.isFocused ? "0 0 0 1px #f97316" : "none",
                    "&:hover": {
                      borderColor: "#f97316"
                    },
                  }),
                }}
                />
              </div>
            </div>
        </div>

        <button
          onClick={handleContinue}
          className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded cursor-pointer"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
