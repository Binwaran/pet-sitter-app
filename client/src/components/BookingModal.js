
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import DatePicker from "react-datepicker";
import Select from 'react-select';
import { format } from "date-fns";



export default function BookingModal({ sitterId, isOpen, onClose }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  const timeOptions = [
  "05:00 AM", "05:30 AM", "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM",
  "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM",
  "08:00 PM", "08:30 PM", "09:00 PM", "09:30 PM", "10:00 PM", "10:30 PM",
  "11:00 PM", "11:30 PM", "12:00 AM", "12:30 AM", "01:00 AM", "01:30 AM",
  "02:00 AM", "02:30 AM", "03:00 AM", "03:30 AM", "04:00 AM", "04:30 AM"
].map(time => ({ value: time, label: time }));

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleContinue = () => {
    if (!date || !startTime || !endTime) {
      alert("Please select all required fields.");
      return;
    }
    console.log("Booking confirmed", { sitterId, date, startTime, endTime });
    onClose();
  };
  console.log("BookingModal mounted", { isOpen });
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 sm:z-50 bg-white sm:bg-black/50 flex items-center justify-center w-[375px] sm:w-full sm:h-full">
      <div className="bg-white rounded-lg p-6 w-full sm:w-[90%] max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Booking</h2>
          <button onClick={onClose}>✕</button>
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
                className="custom-input"
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
                  className="w-[177px] cursor-text"
                  classNamePrefix="react-select"
                  placeholder="Start Time"
                />
              </div>
              <h2 className="flex justify-center items-center">-</h2>

              {/* End Time */}
              <div className="flex items-center gap-3 w-1/2">
                <Select
                  options={timeOptions}
                  onChange={(selected) => setEndTime(selected.value)}
                  className="w-[177px] cursor-text"
                  classNamePrefix="react-select"
                  placeholder="End Time"
                />
              </div>
            </div>
        </div>

        <button onClick={handleContinue} className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded cursor-pointer">
          Continue
        </button>
      </div>
    </div>
  );
}
