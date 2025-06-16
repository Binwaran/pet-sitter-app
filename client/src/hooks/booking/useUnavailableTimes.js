import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { format } from "date-fns";

export default function useUnavailableTimes(sitterId, selectedDate) {
  const [unavailable, setUnavailable] = useState([]);

  useEffect(() => {
    if (!sitterId || !selectedDate) return;

    const fetchUnavailable = async () => {
      const startOfDay = new Date(
        Date.UTC(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          0,
          0,
          0
        )
      );

      const endOfDay = new Date(
        Date.UTC(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          23,
          59,
          59
        )
      );

      const { data, error } = await supabase
        .from("booking")
        .select("start_time, end_time")
        .eq("sitter_id", sitterId)
        .in("status", [
          "pending",
          "waiting for confirm",
          "waiting for service",
          "in service",
        ])
        .gte("start_time", startOfDay.toISOString())
        .lte("end_time", endOfDay.toISOString());

      if (error) {
        return;
      }

      const disabledTimes = new Set();

      data.forEach(({ start_time, end_time }) => {
        const start = new Date(start_time);
        const end = new Date(end_time);

        const time = new Date(start);
        while (time < end) {
          const formatted = time.toISOString().slice(11, 16);
          disabledTimes.add(formatted);
          time.setMinutes(time.getMinutes() + 30);
        }
      });

      setUnavailable([...disabledTimes]);
    };

    fetchUnavailable();
  }, [sitterId, selectedDate]);

  return unavailable;
}
