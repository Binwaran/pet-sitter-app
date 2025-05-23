"use client";
import { Suspense } from "react";
import EditPetPageInner from "./EditPetPageInner";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditPetPageInner />
    </Suspense>
  );
}