"use client";
import Sidebar from "@/components/admin/SidebarAdmin";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";

const statusColor = {
  new: "text-pink-300",
  pending: "text-blue-300",
  resolved: "text-green-500",
  canceled: "text-red-500",
};

export default function AdminReportPage() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
  const fetchReports = async () => {
    let { data, error } = await supabase
      .from("report")
      .select(`
        *,
        reporter:reporter_id ( name ),
        target:target_id ( name )
      `)
      .order("created_at", { ascending: false });

    if (data) setReports(data);
  };
  fetchReports();
}, []);

  const filteredReports =
    filter === "all" ? reports : reports.filter((r) => r.status === filter);

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <div className="flex md:flex-row flex-col min-w-0">
        {/* Sidebar desktop */}
        <Sidebar className="hidden md:flex" />
        <div className="flex-1 flex flex-col">
          {/* Sidebar mobile */}
          <Sidebar className="flex flex-row md:hidden sticky top-0 z-10 bg-white" />
          <main className="flex-1 px-6 py-10">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Report</h1>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="all">All status</option>
                <option value="new">New Report</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>

            <table className="w-full text-left border bg-white rounded-lg overflow-hidden ">
              <thead className="bg-black text-white text-md font-medium">
                <tr>
                  <th className="p-3 py-6 w-1/5 text-[20px]">User</th>
                  <th className="p-3 py-6 w-1/5 text-[20px]">Reported Person</th>
                  <th className="p-3 py-6 w-1/5 text-[20px]">Issue</th>
                  <th className="p-3 py-6 w-1/5 text-[20px]">Date Submitted</th>
                  <th className="p-3 py-6 w-1/5 text-[20px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                    onClick={() => router.push(`/admin/report/${report.id}`)}
                  >
                    <td className="px-3 py-6 text-[18px]">{report.reporter?.name || report.reporter_id}</td>
                    <td className="px-3 py-6 text-[18px]">{report.target?.name || report.target_id}</td>
                    <td className="px-3 py-6 text-[18px]">
                      {report.subject.length > 20
                        ? report.subject.slice(0, 20) + "..."
                        : report.subject}
                    </td>

                    <td className="px-3 py-6 text-[18px]">
                      {new Date(report.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-3">
                      <span className={`flex items-center gap-1 font-medium ${statusColor[report.status]}`}>
                        <span className="text-xl leading-none">•</span>
                        {report.status === "new"
                          ? "New Report"
                          : report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </main>
        </div>
      </div>
    </div>
  );
}
