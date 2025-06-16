"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      age: form.age === "" ? null : Number(form.age),
      weight: form.weight === "" ? null : Number(form.weight),
    };
    try {
      let res;
      if (petId) {
        // แก้ไข ไม่ต้องส่ง owner_id
        res = await fetch(`/api/pets/${petId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // สร้างใหม่ ต้องส่ง owner_id
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
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-8 rounded-2xl shadow max-w-3xl mx-auto mt-8"
    >
      <h2 className="text-xl font-bold mb-4">Your Pet</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block font-medium mb-1">Pet Name*</label>
          <input
            type="text"
            name="pet_name"
            value={form.pet_name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Pet name"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Pet Type*</label>
          <select
            name="pet_type"
            value={form.pet_type}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select your pet type</option>
            {petTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Breed*</label>
          <input
            type="text"
            name="breed"
            value={form.breed}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Breed of your pet"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Sex*</label>
          <select
            name="sex"
            value={form.sex}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select sex of your pet</option>
            {sexes.map((sex) => (
              <option key={sex.value} value={sex.value}>
                {sex.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Age (Month)*</label>
          <input
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Age of your pet"
            min={0}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Color*</label>
          <input
            type="text"
            name="color"
            value={form.color}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Describe color of your pet"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Weight (Kilogram)*</label>
          <input
            type="number"
            name="weight"
            value={form.weight}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Weight of your pet"
            min={0}
            step="any"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Image URL</label>
          <input
            type="text"
            name="pet_image_url"
            value={form.pet_image_url}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="https://..."
          />
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">About</label>
        <textarea
          name="about"
          value={form.about}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          placeholder="Describe more about your pet..."
          rows={3}
        />
      </div>
      <div className="flex justify-between mt-6">
        <button
          type="button"
          className="px-6 py-2 rounded-full bg-gray-100 text-gray-700 font-semibold"
          onClick={() => router.push("/pet-owners/pets")}
        >
          Cancel
        </button>
        <div>
          {petId && (
            <button
              type="button"
              className="px-6 py-2 rounded-full bg-red-500 text-white font-semibold mr-2"
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
            >
              Delete
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 rounded-full bg-orange-500 text-white font-semibold"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
}
