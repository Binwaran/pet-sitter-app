"use client";
import Sidebar from "@/components/admin/SidebarAdmin";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [sitters, setSitters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState({});
  const router = useRouter();

  // โหลดรายชื่อ pet sitters ที่รออนุมัติ
  const fetchSitters = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/all-pet-sitters");
      setSitters(res.data.data || []);
    } catch (e) {
      setSitters([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSitters();
  }, []);

  const handleApprove = async (user_id) => {
    await axios.post("/api/pet-sitter-admin", {
      user_id,
      status: "approved",
      admin_suggestion: null,
    });
    fetchSitters();
  };

  const handleReject = async (user_id) => {
    const reason = rejectReason[user_id] || "";
    if (!reason.trim()) {
      alert("กรุณากรอกเหตุผลที่ปฏิเสธ");
      return;
    }
    await axios.post("/api/pet-sitter-admin", {
      user_id,
      status: "rejected",
      admin_suggestion: reason,
    });
    setRejectReason((prev) => ({ ...prev, [user_id]: "" }));
    fetchSitters();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <div className="flex md:flex-row flex-col min-w-0">
        {/* Sidebar: row on mobile, column on desktop */}
        <Sidebar className="hidden md:flex" />
        <div className="flex-1 flex flex-col">
          <Sidebar className="flex flex-row md:hidden sticky top-0 z-10 bg-white" />
          <main className="flex-1 flex flex-col items-center py-10">
            <h1 className="text-2xl font-bold mb-6">
              Pet Sitter Waiting for Approval
            </h1>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <ul className="w-full max-w-2xl space-y-4">
                {sitters.length === 0 && (
                  <li className="text-center text-gray-500">
                    No sitters waiting for approval.
                  </li>
                )}
                {sitters.map((sitter) => (
                  <li
                    key={sitter.user_id}
                    className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div>
                      <div className="font-semibold">{sitter.full_name}</div>
                      <div className="text-sm text-gray-500">
                        {sitter.email}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        onClick={() => handleApprove(sitter.user_id)}
                      >
                        Approve
                      </button>
                      <input
                        type="text"
                        placeholder="เหตุผลที่ปฏิเสธ"
                        className="border rounded px-2 py-1"
                        value={rejectReason[sitter.user_id] || ""}
                        onChange={(e) =>
                          setRejectReason((prev) => ({
                            ...prev,
                            [sitter.user_id]: e.target.value,
                          }))
                        }
                      />
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        onClick={() => handleReject(sitter.user_id)}
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
