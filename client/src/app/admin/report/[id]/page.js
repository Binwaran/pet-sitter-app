"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";
import Sidebar from "@/components/admin/SidebarAdmin";
import Image from "next/image";
import CancelPopup from "@/components/admin/report/CancelPopup";
import ResolvePopup from "@/components/admin/report/ResolvePopup";

const statusColor = {
  "New Report": "text-pink-300",
  "Pending": "text-blue-300",
  "Resolved": "text-green-500",
  "Canceled": "text-red-500",
};

const statusLabel = {
  "New Report": "New Report",
  "Pending": "Pending",
  "Resolved": "Resolved",
  "Canceled": "Canceled",
};


export default function ReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [showCancel, setShowCancel] = useState(false);
  const [showResolve, setShowResolve] = useState(false);

  useEffect(() => {
  const fetchReport = async () => {
    let { data: reportData, error } = await supabase
      .from("report")
      .select(`*, reporter:reporter_id (name), target:target_id (name)`)
      .eq("id", id)
      .single();

    if (reportData) {
      // ถ้า status = new → อัปเดต แล้ว fetch ใหม่อีกรอบ
      if (reportData.status === "new") {
        await supabase
          .from("report")
          .update({ status: "pending" })
          .eq("id", id);

        // 🔁 ดึงใหม่หลังอัปเดต
        const { data: updatedReport } = await supabase
          .from("report")
          .select(`*, reporter:reporter_id (name), target:target_id (name)`)
          .eq("id", id)
          .single();

        setReport(updatedReport);
            } else {
              setReport(reportData);
            }
          }
        };

        fetchReport();
      }, [id]);

  const updateStatus = async (newStatus) => {
    await supabase
      .from("report")
      .update({ status: newStatus })
      .eq("id", id);
    setReport((prev) => ({ ...prev, status: newStatus }));
    setShowCancel(false);
    setShowResolve(false);
  };

  if (!report) return <div className="p-10">Loading...</div>;

  const canTakeAction = report.status === "pending";

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
    <div className="flex md:flex-row flex-col min-w-0">
      {/* Sidebar desktop */}
      <Sidebar className="hidden md:flex" />
      <div className="flex-1 flex flex-col">
        {/* Sidebar mobile */}
        <Sidebar className="flex flex-row md:hidden sticky top-0 z-10 bg-white" />

        {/* Main content */}
        <main className="flex-1 px-6 py-10">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold flex items-center">
              <div
                onClick={() => router.push("/admin/report")}
                className="cursor-pointer color-gray-800 hover:text-gray-700 mr-3"
              >
                <Image
                  src="/assets/arrow1.png"
                  alt="Back"
                  width={50}
                  height={50}
                />
              </div>
              {report.subject.length > 20
                        ? report.subject.slice(0, 20) + "...."
                        : report.subject}
              <span
                className={`ml-10 text-[18px] font-medium ${
                  {
                    pending: "text-blue-300",
                    resolved: "text-green-500",
                    canceled: "text-red-500",
                  }[report.status]
                }`}
              >
                <span className="text-[10px] mr-2 align-middle">●</span>
                {report.status === "new"
                  ? "New Report"
                  : report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </span>
            </h1>

            {canTakeAction && (
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCancel(true)}
                  className="bg-orange-100 text-orange-600 text-[18px] px-4 py-2 cursor-pointer rounded-full"
                >
                  Cancel Report
                </button>
                <button
                  onClick={() => setShowResolve(true)}
                  className="bg-orange-500 text-white text-[18px] px-6 py-3 cursor-pointer rounded-full"
                >
                  Resolve
                </button>
              </div>
            )}
            {showCancel && (
              <CancelPopup
                onCancel={() => setShowCancel(false)}
                onConfirm={() => updateStatus("canceled")}
              />
            )}
            {showResolve && (
              <ResolvePopup
                onCancel={() => setShowResolve(false)}
                onConfirm={() => updateStatus("resolved")}
              />
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm px-6 py-8 space-y-4">
            <div className="mb-6">
              <p className="text-[20px] text-gray-500 mb-2">Reported by</p>
              <p>{report.reporter?.name || report.reporter_id}</p>
              <hr className="my-4 border-t border-gray-200" />
            </div>
            <div className="mb-6">
              <p className="text-[20px] text-gray-500 mb-2">Reported Person</p>
              <p>{report.target?.name || report.target_id}</p>
            </div>
            <div className="mb-6">
              <p className="text-[20px] text-gray-500 mb-2">Issue</p>
              <p>{report.subject}</p>
            </div>
            <div className="mb-6">
              <p className="text-[20px] text-gray-500 mb-2">Description</p>
              <p>{report.description}</p>
            </div>
            <div>
              <p className="text-[20px] text-gray-500 mb-2">Date Submitted</p>
              <p>
                {new Date(report.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
  );
}
