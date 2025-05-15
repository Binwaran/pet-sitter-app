import Sidebar from "@/components/sitters/SidebarSitter";
import Topbar from "@/components/sitters/TopbarSitter";

const Calendar = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <div className="flex md:flex-row flex-col min-w-0">
        {/* Sidebar: row on mobile, column on desktop */}
        <Sidebar className="hidden md:flex" />
        <div className="flex-1 flex flex-col">
          <Topbar />
          {/* Sidebar: row on mobile, column on desktop */}
          <Sidebar className="flex flex-row md:hidden sticky top-0 z-10 bg-white" />
          <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="mt-4 text-gray-600">This is the calendar page.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
