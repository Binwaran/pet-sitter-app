"use client";
import { useState, useEffect } from "react";
import FilterSidebar from "@/components/pet-sitters/FilterSidebar";
import MapWrapper from "@/components/MapWrapper";
import SearchHeader from "@/components/pet-sitters/SearchHeader";

const SearchMapPage = () => {
  const [filters, setFilters] = useState({
    keyword: "",
    petTypes: [],
    rating: "",
    experience: "",
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (e) => {
    const { value, checked } = e.target;
    setFilters((prev) => {
      const pet_type = checked
        ? [...prev.pet_type, value]
        : prev.pet_type.filter((type) => type !== value);
      return { ...prev, pet_type };
    });
  };

  const handleSearch = () => {
    // คุณสามารถ fetch หรือส่ง filters ไปยัง MapWrapper ได้ที่นี่ถ้าต้องการ
  };

  const handleClear = () => {
    setFilters({ keyword: "", pet_type: [], rating: "", experience: "" });
  };

  return (
    <>
      <div className="hidden md:flex justify-center items-center bg-gray-50 py-4">
        <SearchHeader />
      </div>

      <div className="flex flex-col md:flex-row min-h-screen px-4 md:px-20 py-5 gap-5 md:gap-10 bg-gray-50 justify-center">
        {/* Sidebar sticky (desktop only) */}
        <div className="block md:sticky md:top-28 md:self-start md:w-1/4">
          <FilterSidebar
            filters={filters}
            onChange={handleChange}
            onCheckbox={handleCheckbox}
            onSearch={handleSearch}
            onClear={handleClear}
          />
        </div>

        {/* Map Wrapper */}
        <div className="flex-1 relative">
          <MapWrapper filters={filters} />
        </div>
      </div>
    </>
  );
};

export default SearchMapPage;
