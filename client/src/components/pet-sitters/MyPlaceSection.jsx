"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";

// ใช้ map ของเพื่อนแบบ dynamic import (ห้ามแก้ไฟล์เพื่อน)
const MapSitterWithNoSSR = dynamic(
  () => import("@/components/profile/MapSitter"),
  {
    ssr: false,
    loading: () => <p className="text-center">Loading map...</p>,
  }
);

export default function MyPlaceSection({ sitter }) {
  const hasLocation = sitter?.lat && sitter?.lng;

  const mapComponent = useMemo(() => {
    if (!hasLocation) return null;

    const lat = parseFloat(sitter.lat);
    const lng = parseFloat(sitter.lng);
    const initialPosition = [lat, lng];

    const addressDetails = {
      province: sitter.province,
      district: sitter.district,
      subDistrict: sitter.sub_district,
      postalCode: sitter.post_code,
      addressDetail: `${sitter.house_number || ""} ${sitter.village || ""}`.trim(),
    };

    return (
      <div className="rounded-lg overflow-hidden w-full h-64">
        <MapSitterWithNoSSR
          addressDetails={addressDetails}
          initialPosition={initialPosition}
          allowManualPin={false}
          key={`map-${sitter.id}-${lat}-${lng}`}
        />
      </div>
    );
  }, [sitter]);

  return (
    <section id="my-map-section" className="mb-10">
      <h2 className="text-3xl font-semibold mb-1">My Place</h2>
      <p className="text-gray-700 mb-4 whitespace-pre-wrap text-lg sm:mb-10 leading-relaxed">
        {sitter.my_place}
      </p>
      {mapComponent || (
        <p className="text-gray-500 italic">Location not available</p>
      )}
    </section>
  );
}
