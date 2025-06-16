"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/profile/Sidebar";
import ImageUpload from "@/components/profile/ImageUpload";
import { uploadFile } from "@/utils/uploadHelpers";

const petTypes = [
  "Dog",
  "Cat",
  "Bird",
  "Rabbit",
  "Mouse",
  "Turtle",
  "Snake",
  "Other",
];
const sexes = [
  { value: "เพศผู้", label: "เพศผู้" },
  { value: "เพศเมีย", label: "เพศเมีย" },
  { value: "ไม่ระบุ", label: "ไม่ระบุ" },
];

export default function EditPetPageInner() {
  const { user, loading: authLoading, setRedirectPath } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params.pet_id === "new" ? null : params.pet_id;
  const [pet, setPet] = useState(null);
  const [form, setForm] = useState({
    pet_name: "",
    pet_type: "",
    breed: "",
    sex: "",
    age: "",
    color: "",
    weight: "",
    about: "",
    pet_image_url: "",
  });
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [petImageFile, setPetImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRedirectPath(window.location.pathname); // เก็บ path ปัจจุบันไว้ใน context
      router.replace("/login");
      return;
    }
    if (user.role !== "owner") {
      router.replace("/unauthorized");
      return;
    }
    if (!petId) {
      setFetchLoading(false);
      return;
    }
    const fetchPet = async () => {
      try {
        const res = await fetch(`/api/pets/${petId}`);
        if (!res.ok) {
          setError("Pet not found or API error");
          setFetchLoading(false);
          return;
        }
        const data = await res.json();
        setPet(data);
        setForm({
          pet_name: data.pet_name || "",
          pet_type: data.pet_type || "",
          breed: data.breed || "",
          sex: data.sex || "",
          age: data.age || "",
          color: data.color || "",
          weight: data.weight || "",
          about: data.about || "",
          pet_image_url: data.pet_image_url || "",
        });
        setFetchLoading(false);
      } catch (err) {
        setError("Failed to fetch pet data");
        setFetchLoading(false);
      }
    };
    fetchPet();
  }, [user, authLoading, router, petId, setRedirectPath]);

  useEffect(() => {
    if (petImageFile) {
      const url = URL.createObjectURL(petImageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null); // fallback โดย JSX
    }
  }, [petImageFile]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePetImageChange = (file) => {
    setPetImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let imageUrl = form.pet_image_url;

      if (petImageFile) {
        try {
          imageUrl = await uploadFile(petImageFile, "pets");
        } catch (error) {
          console.error("Upload error:", error.message);
          alert("Failed to upload image");
          return;
        }
      }

      const payload = {
        ...form,
        age: form.age === "" ? null : Number(form.age),
        weight: form.weight === "" ? null : Number(form.weight),
        pet_image_url: imageUrl,
      };

      let res;
      if (petId) {
        res = await fetch(`/api/pets/${petId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/pets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, owner_id: user.id }),
        });
      }

      if (res.ok) {
        router.push("/pet-owners/pets");
      } else {
        const err = await res.json();
        setError(err.error || "Save failed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  if (authLoading || fetchLoading)
    return (
      <div className="flex flex-col min-h-screen bg-[#F9FAFB] relative">
        <div className="flex-1 flex justify-center items-center">
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#FF7C43] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  if (!user) return <div>Please sign in</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-[#FAFAFB]">
      <div className="md:px-20 md:pt-10 md:pb-20">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:max-w-81 md:max-h-89 flex md:gap-6 md:pr-8">
            <Sidebar />
          </div>

          {/* Main */}
          <div className="bg-white px-4 py-6 md:p-10 md:rounded-2xl h-full w-full">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-15">
              {/* Header */}
              <div className="flex items-center justify-start">
                <h1 className="text-xl md:text-2xl font-bold leading-7 md:leading-8">
                  {petId ? "Edit Pet" : "Add New Pet"}
                </h1>
              </div>

              {/* Form Content */}
              <div className="flex flex-col gap-4 md:gap-10 w-full">
                {/* Pet Image Upload - ปรับแต่ง UI ให้เหมือนหน้า Profile */}
                <div className="flex items-center justify-start gap-10">
                  <ImageUpload
                    value={petImageFile || form.pet_image_url}
                    onChange={handlePetImageChange}
                    requiresApproval={false}
                    type="pet" /* เพิ่ม prop type เพื่อใช้ pet avatar default */
                  />
                </div>

                {/* First Row */}
                <div className="flex flex-col lg:flex-row gap-4 md:gap-10">
                  <label className="font-medium flex flex-col gap-1 w-full">
                    Pet Name*
                    <input
                      type="text"
                      name="pet_name"
                      value={form.pet_name}
                      onChange={handleChange}
                      placeholder="Pet name"
                      required
                      className="w-full leading-[150%] box-border h-12 border border-gray-200 rounded-lg pl-3 pr-4 py-3"
                    />
                  </label>
                  <label className="font-medium flex flex-col gap-1 w-full">
                    Pet Type*
                    <select
                      name="pet_type"
                      value={form.pet_type}
                      onChange={handleChange}
                      required
                      className="w-full leading-[150%] box-border h-12 border border-gray-200 rounded-lg pl-3 pr-4 py-3"
                    >
                      <option value="">Select your pet type</option>
                      {petTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Second Row */}
                <div className="flex flex-col lg:flex-row gap-4 md:gap-10">
                  <label className="font-medium flex flex-col gap-1 w-full">
                    Breed*
                    <input
                      type="text"
                      name="breed"
                      value={form.breed}
                      onChange={handleChange}
                      placeholder="Breed of your pet"
                      required
                      className="w-full leading-[150%] box-border h-12 border border-gray-200 rounded-lg pl-3 pr-4 py-3"
                    />
                  </label>
                  <label className="font-medium flex flex-col gap-1 w-full">
                    Sex*
                    <select
                      name="sex"
                      value={form.sex}
                      onChange={handleChange}
                      required
                      className="w-full leading-[150%] box-border h-12 border border-gray-200 rounded-lg pl-3 pr-4 py-3"
                    >
                      <option value="">Select sex of your pet</option>
                      {sexes.map((sex) => (
                        <option key={sex.value} value={sex.value}>
                          {sex.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Third Row */}
                <div className="flex flex-col lg:flex-row gap-4 md:gap-10">
                  <label className="font-medium flex flex-col gap-1 w-full">
                    Age (Month)*
                    <input
                      type="number"
                      name="age"
                      value={form.age}
                      onChange={handleChange}
                      placeholder="Age of your pet"
                      min={0}
                      required
                      className="w-full leading-[150%] box-border h-12 border border-gray-200 rounded-lg pl-3 pr-4 py-3"
                    />
                  </label>
                  <label className="font-medium flex flex-col gap-1 w-full">
                    Weight (Kilogram)*
                    <input
                      type="number"
                      name="weight"
                      value={form.weight}
                      onChange={handleChange}
                      placeholder="Weight of your pet"
                      min={0}
                      required
                      className="w-full leading-[150%] box-border h-12 border border-gray-200 rounded-lg pl-3 pr-4 py-3"
                    />
                  </label>
                </div>

                {/* Fourth Row */}
                <div className="flex flex-col lg:flex-row gap-4 md:gap-10">
                  <label className="font-medium flex flex-col gap-1 w-full">
                    Color*
                    <input
                      type="text"
                      name="color"
                      value={form.color}
                      onChange={handleChange}
                      placeholder="Describe color of your pet"
                      required
                      className="w-full leading-[150%] box-border h-12 border border-gray-200 rounded-lg pl-3 pr-4 py-3"
                    />
                  </label>
                </div>
                
                {/* About Section */}
                <div className="w-full">
                  <label className="font-medium flex flex-col gap-1">
                    About
                    <textarea
                      name="about"
                      value={form.about}
                      onChange={handleChange}
                      placeholder="Describe more about your pet..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg pl-3 pr-4 py-3"
                    />
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => router.push("/pet-owners/pets")}
                  className="px-6 py-3 rounded-full font-bold border border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </button>
                {petId && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete this pet?")) {
                        const res = await fetch(`/api/pets/${petId}`, {
                          method: "DELETE",
                        });
                        if (res.ok) {
                          router.push("/pet-owners/pets");
                        } else {
                          const err = await res.json();
                          setError(err.error || "Delete failed");
                        }
                      }
                    }}
                    className="px-6 py-3 rounded-full font-bold bg-red-500 text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-[#FF7037] text-white px-6 py-3 rounded-full font-bold cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-[#FF986F]"
                >
                  {petId ? "Update Pet" : "Add Pet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
