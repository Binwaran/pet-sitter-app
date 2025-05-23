"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const petTypes = ["Dog", "Cat", "Other"];
const sexes = ["Male", "Female", "Unknown"];

export default function EditPetPageInner() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const petId = searchParams.get("pet_id"); // <-- ดึง pet_id จาก query
  const [pet, setPet] = useState(null);
  const [form, setForm] = useState({
    name: "",
    type: "",
    breed: "",
    sex: "",
    age: "",
    color: "",
    weight: "",
    about: "",
  });
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setFetchLoading(false);
      return;
    }
    if (user.role !== "owner") {
      router.replace("/unauthorized");
      return;
    }
    if (!petId) {
      setError("No pet selected");
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
          name: data.name || "",
          type: data.type || "",
          breed: data.breed || "",
          sex: data.sex || "",
          age: data.age || "",
          color: data.color || "",
          weight: data.weight || "",
          about: data.about || "",
        });
        setFetchLoading(false);
      } catch (err) {
        setError("Failed to fetch pet data");
        setFetchLoading(false);
      }
    };
    fetchPet();
  }, [user, authLoading, router, petId]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await fetch(`/api/pets/${petId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/owner/pets");
  };

  if (authLoading || fetchLoading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 rounded-2xl shadow max-w-3xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Your Pet</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block font-medium mb-1">Pet Name*</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Pet name"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Pet Type*</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select your pet type</option>
            {petTypes.map(type => (
              <option key={type} value={type}>{type}</option>
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
            {sexes.map(sex => (
              <option key={sex} value={sex}>{sex}</option>
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
            required
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
          onClick={() => router.push("/owner/pets")}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded-full bg-orange-500 text-white font-semibold"
        >
          Save
        </button>
      </div>
    </form>
  );
}