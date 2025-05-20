"use client";
import Sidebar from "@/components/admin/SidebarAdmin";

export default function AdminReportPage() {

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <div className="flex md:flex-row flex-col min-w-0">
        {/* Sidebar: row on mobile, column on desktop */}
        <Sidebar className="hidden md:flex" />
        <div className="flex-1 flex flex-col">
          <Sidebar className="flex flex-row md:hidden sticky top-0 z-10 bg-white" />
          <main className="flex-1 flex flex-col items-center justify-center py-10">
            <h1 className="text-2xl font-bold mb-6">
              Welcome Back!
            </h1>
          </main>
        </div>
      </div>
    </div>
  );
}
