"use client";
import { useEffect, useState } from "react";

const TABS = ["Profile", "Pets", "Reviews"];

export default function AdminOwnerDetailPage({ params }) {
  const { userId } = params;
  const [tab, setTab] = useState("Profile");
  const [owner, setOwner] = useState(null);
  const [pets, setPets] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      // ดึงข้อมูล owner
      const ownerRes = await fetch(`/api/owners/${userId}`);
      const ownerData = ownerRes.ok ? await ownerRes.json() : null;
      setOwner(ownerData);

      // ดึงข้อมูล pets
      const petsRes = await fetch(`/api/pets?ownerId=${userId}`);
      const petsData = petsRes.ok ? await petsRes.json() : [];
      setPets(petsData);

      // ดึงข้อมูล reviews
      const reviewsRes = await fetch(`/api/reviews/owner?ownerId=${userId}`);
      const reviewsData = reviewsRes.ok ? await reviewsRes.json() : [];
      setReviews(reviewsData);

      setLoading(false);
    }
    fetchAll();
  }, [userId]);

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }
  if (!owner) {
    return <div className="flex justify-center items-center h-96">ไม่พบข้อมูล Owner</div>;
  }

  return (
    <div className="p-8 min-h-screen bg-[#F7F8FA]">
      <div className="max-w-5xl mx-auto">
        <div className="text-xl font-bold mb-6">{owner.name}</div>
        <div className="bg-white rounded-2xl p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {TABS.map((t) => (
              <button
                key={t}
                className={`px-6 py-2 rounded-t-lg font-medium ${
                  tab === t
                    ? "bg-white border-b-2 border-[#FF7037] text-[#FF7037]"
                    : "bg-[#F7F8FA] text-gray-400"
                }`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          {/* Tab Content */}
          {tab === "Profile" && (
            <div className="flex gap-10">
              <img
                src={owner.profile_image_url || "/default-profile.png"}
                alt={owner.name}
                className="w-40 h-40 rounded-full object-cover"
              />
              <div className="flex flex-col gap-2 mt-2">
                <div>
                  <span className="text-gray-400 font-semibold">Pet Owner Name</span>
                  <div>{owner.name}</div>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold">Email</span>
                  <div>{owner.email}</div>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold">Phone</span>
                  <div>{owner.phone}</div>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold">ID Number</span>
                  <div>{owner.id_number}</div>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold">Date of Birth</span>
                  <div>{owner.dob}</div>
                </div>
                <button className="text-[#FF7037] font-semibold mt-4 self-end">
                  Ban This User
                </button>
              </div>
            </div>
          )}
          {tab === "Pets" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {pets.map((pet) => (
                <div
                  key={pet.pet_id}
                  className="flex flex-col items-center border rounded-xl p-4"
                >
                  <img
                    src={pet.image_url || "/default-pet.png"}
                    alt={pet.pet_name}
                    className="w-20 h-20 rounded-full object-cover mb-2"
                  />
                  <div className="font-medium">{pet.pet_name}</div>
                  <span
                    className={`mt-1 px-3 py-0.5 rounded-full text-xs font-semibold ${
                      pet.type === "Dog"
                        ? "bg-green-50 text-green-500 border border-green-200"
                        : pet.type === "Cat"
                        ? "bg-pink-50 text-pink-400 border border-pink-200"
                        : "bg-blue-50 text-blue-400 border border-blue-200"
                    }`}
                  >
                    {pet.type}
                  </span>
                </div>
              ))}
            </div>
          )}
          {tab === "Reviews" && (
            <div>
              {reviews.length === 0 ? (
                <div className="text-gray-400">No reviews yet.</div>
              ) : (
                reviews.map((review, idx) => (
                  <div key={idx} className="flex gap-4 items-start py-4 border-b last:border-b-0">
                    <img
                      src={review.reviewer_avatar || "/default-profile.png"}
                      alt={review.reviewer_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex gap-2 items-center">
                        <span className="font-medium">{review.reviewer_name}</span>
                        <span className="flex gap-0.5">
                          {[1,2,3,4,5].map(i => (
                            <span key={i} style={{color: i <= review.rating ? "#22c55e" : "#e5e7eb", fontSize: 18}}>★</span>
                          ))}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mb-1">
                        {review.created_at && new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <div>{review.comment}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}