"use client";

import Sidebar from "@/components/sitters/SidebarSitter";
import Topbar from "@/components/sitters/TopbarSitter";
import Image from "next/image";
import ProvinceDropdown from "@/components/dropdown/ProvinceDropdown";
import DistrictDropdown from "@/components/dropdown/DistrictDropdown";
import SubdistrictDropdown from "@/components/dropdown/SubdistrictDropdown";
import subdistricts from "@/app/data/subdistricts.json";
import map from "/public/mock/map.png";
import { Formik, Form, Field, useFormikContext } from "formik";
import { useEffect, useState } from "react";
import { profileSchema } from "@/components/form/validationSchema";
import ImageUpload from "@/components/profile/ImageUpload";
import GalleryUpload from "@/components/profile/GalleryUpload";
import exclamationcircle from "/public/assets/profile/exclamation-circle.svg";
import ExperienceDropdown from "@/components/dropdown/ExperienceDropdown";
import PetTypeMultiSelect from "@/components/dropdown/PetTypeMultiSelect";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default function PetSitterProfilePage() {
  const [initialValues, setInitialValues] = useState({
    full_name: "",
    experience: "",
    phone_number: "",
    email: "",
    introduction: "",
    trade_name: "",
    services: "",
    place_description: "",
    account_number: "",
    address_detail: "",
    district: "",
    sub_district: "",
    province: "",
    post_code: "",
    profile_image: null,
    gallery: [],
    pet_types: [],
  });
  const [sitterStatus, setSitterStatus] = useState(null);
  const [adminSuggestion, setAdminSuggestion] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const decoded = jwtDecode(token);
      const user_id = decoded.user_id || decoded.sub || decoded.id;

      try {
        const res = await axios.get(
          `/api/pet-sitter/update-profile?user_id=${user_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = res.data.data;
        if (data) {
          setInitialValues({
            full_name: data.full_name ?? "",
            experience: data.experience ?? "",
            phone_number: data.phone_number ?? "",
            email: data.email ?? "",
            introduction: data.introduction ?? "",
            trade_name: data.trade_name ?? "",
            services: data.services ?? "",
            place_description: data.place_description ?? "",
            account_number: data.account_number ?? "",
            address_detail: data.address_detail ?? "",
            district: data.district ?? "",
            sub_district: data.sub_district ?? "",
            province: data.province ?? "",
            post_code: data.post_code ?? "",
            profile_image: data.profile_image ?? null,
            gallery: data.gallery ?? [],
            pet_types: data.pet_types ?? [],
          });
          setSitterStatus(data.status);
          setAdminSuggestion(data.admin_suggestion);
        }
      } catch (error) {
        // handle error
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (values) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const decoded = jwt_decode(token);
    const user_id = decoded.user_id || decoded.sub || decoded.id;

    const payload = {
      ...values,
      user_id,
      status: "waiting for approval",
    };
    try {
      await axios.post("/api/pet-sitter/update-profile", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // แจ้งเตือนหรือ redirect ได้
    } catch (error) {
      // handle error
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <div className="flex md:flex-row flex-col min-w-0">
        {/* Sidebar: row on mobile, column on desktop */}
        <Sidebar className="hidden md:flex" />
        <div className="flex-1 flex flex-col">
          <Topbar />
          {/* Sidebar: row on mobile, column on desktop */}
          <Sidebar className="flex flex-row md:hidden sticky top-0 z-10 bg-white" />
          {/* Main content */}
          <main className="flex-1 flex flex-col items-center w-full px-2 sm:px-4 md:px-8 py-6">
            <Formik
              initialValues={initialValues}
              enableReinitialize
              validationSchema={profileSchema}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue, errors, touched }) => (
                <Form className="w-full max-w-[1200px] flex flex-col gap-8 px-2 sm:px-4 md:px-8">
                  {/* Title */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-4">
                      <h1 className="text-[24px] font-semibold text-[#22223B]">
                        Pet Sitter Profile
                      </h1>
                      {/* Status Dot & Text */}
                      {sitterStatus === "approved" && (
                        <span className="text-[16px] text-[#1CCD83] font-medium flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-[#1CCD83]" />
                          Approved
                        </span>
                      )}
                      {sitterStatus === "waiting for approval" && (
                        <span className="text-[16px] text-[#FA8AC0] font-medium flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-[#FA8AC0]" />
                          Waiting for approve
                        </span>
                      )}
                      {sitterStatus === "rejected" && (
                        <span className="text-[16px] text-[#EA1010] font-medium flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-[#EA1010]" />
                          Rejected
                        </span>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="bg-[#FF6B00] text-white px-6 py-2 rounded-full font-semibold"
                    >
                      {sitterStatus === null || sitterStatus === "rejected"
                        ? "Request for approval"
                        : "Update"}
                    </button>
                  </div>

                  {/* Admin Suggestion (เฉพาะ rejected) */}
                  {sitterStatus === "rejected" && (
                    <div className="bg-[#E9EAF6] text-[#EA1010] px-6 py-3 rounded-lg mt-4 flex items-center gap-2">
                      <Image
                        src={exclamationcircle}
                        alt="exclamationcircle"
                        width={16}
                        height={16}
                      />
                      <span>
                        Your request has not been approved:{" "}
                        {`'${adminSuggestion}'`}
                      </span>
                    </div>
                  )}

                  {/* Basic Information */}
                  <section className="bg-white rounded-2xl px-4 sm:px-6 md:px-10 py-6 sm:py-8 shadow-sm mb-8">
                    <h2 className="text-[#AEB1C3] font-semibold text-[18px] sm:text-[20px] mb-4 sm:mb-6">
                      Basic Information
                    </h2>
                    <div className="flex flex-col gap-6 sm:gap-8">
                      {/* Profile Image */}
                      <div className="flex flex-col items-start">
                        <p className="mb-4 text-[16px] font-medium">
                          Profile Image
                        </p>
                        <ImageUpload
                          value={values.profile_image}
                          onChange={(file) =>
                            setFieldValue("profile_image", file)
                          }
                          error={touched.profile_image && errors.profile_image}
                        />
                      </div>
                      {/* Form Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Full Name */}
                        <div className="flex flex-col">
                          <label
                            htmlFor="full_name"
                            className="pb-1 text-[16px] font-medium"
                          >
                            Your full name*
                          </label>
                          <div className="relative">
                            <Field
                              type="text"
                              id="full_name"
                              name="full_name"
                              className={`input border-[#DCDFED] ${
                                touched.full_name && errors.full_name
                                  ? "pr-10 border-red-500"
                                  : ""
                              }`}
                            />
                            {touched.full_name && errors.full_name && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Image
                                  src={exclamationcircle}
                                  alt="error"
                                  width={13}
                                  height={13}
                                />
                              </span>
                            )}
                          </div>
                          {touched.full_name && errors.full_name && (
                            <div className="text-red-500 text-xs">
                              {errors.full_name}
                            </div>
                          )}
                        </div>
                        {/* Experience */}
                        <div className="flex flex-col">
                          <label
                            htmlFor="experience"
                            className="pb-1 text-[16px] font-medium"
                          >
                            Experience*
                          </label>
                          <div className="relative">
                            <ExperienceDropdown
                              id="experience"
                              name="experience"
                              value={values.experience}
                              onChange={(value) =>
                                setFieldValue("experience", value)
                              }
                              className={`input border-[#DCDFED] ${
                                touched.experience && errors.experience
                                  ? "pr-10 border-red-500"
                                  : ""
                              }`}
                            />
                            {touched.experience && errors.experience && (
                              <span className="absolute right-8 top-1/2 -translate-y-1/2">
                                <Image
                                  src={exclamationcircle}
                                  alt="error"
                                  width={13}
                                  height={13}
                                />
                              </span>
                            )}
                          </div>
                          {touched.experience && errors.experience && (
                            <div className="text-red-500 text-xs">
                              {errors.experience}
                            </div>
                          )}
                        </div>
                        {/* Phone Number */}
                        <div className="flex flex-col">
                          <label
                            htmlFor="phone_number"
                            className="pb-1 text-[16px] font-medium"
                          >
                            Phone Number*
                          </label>
                          <div className="relative">
                            <Field
                              name="phone_number"
                              className={`input border-[#DCDFED] ${
                                touched.phone_number && errors.phone_number
                                  ? "pr-10 border-red-500"
                                  : ""
                              }`}
                            />
                            {touched.phone_number && errors.phone_number && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Image
                                  src={exclamationcircle}
                                  alt="error"
                                  width={13}
                                  height={13}
                                />
                              </span>
                            )}
                          </div>
                          {touched.phone_number && errors.phone_number && (
                            <div className="text-red-500 text-xs">
                              {errors.phone_number}
                            </div>
                          )}
                        </div>
                        {/* Email */}
                        <div className="flex flex-col">
                          <label
                            htmlFor="email"
                            className="pb-1 text-[16px] font-medium"
                          >
                            Email*
                          </label>
                          <div className="relative">
                            <Field
                              name="email"
                              className={`input border-[#DCDFED] ${
                                touched.email && errors.email
                                  ? "pr-10 border-red-500"
                                  : ""
                              }`}
                            />
                            {touched.email && errors.email && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Image
                                  src={exclamationcircle}
                                  alt="error"
                                  width={13}
                                  height={13}
                                />
                              </span>
                            )}
                          </div>
                          {touched.email && errors.email && (
                            <div className="text-red-500 text-xs">
                              {errors.email}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Introduction */}
                      <div className="flex flex-col">
                        <label
                          htmlFor="introduction"
                          className="pb-1 text-[16px] font-medium"
                        >
                          Introduction (Describe about yourself as pet sitter)
                        </label>
                        <div className="relative">
                          <Field
                            as="textarea"
                            name="introduction"
                            className={`w-full min-h-[120px] border border-[#DCDFED] rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--primary-orange-color-500)] ${
                              touched.introduction && errors.introduction
                                ? "pr-10 border-red-500"
                                : ""
                            }`}
                          />
                          {touched.introduction && errors.introduction && (
                            <span className="absolute right-3 top-3">
                              <Image
                                src={exclamationcircle}
                                alt="error"
                                width={13}
                                height={13}
                              />
                            </span>
                          )}
                        </div>
                        {touched.introduction && errors.introduction && (
                          <div className="text-red-500 text-xs">
                            {errors.introduction}
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                  {/* เงื่อนไข: approved เท่านั้นถึงแสดงส่วนอื่น */}
                  {sitterStatus === "approved" && (
                    <>
                      {/* Pet Sitter Info */}
                      <section className="bg-white rounded-2xl px-4 sm:px-6 md:px-10 py-6 sm:py-8 shadow-sm mb-8">
                        <h2 className="text-[#AEB1C3] font-semibold text-[18px] sm:text-[20px] mb-4 sm:mb-6">
                          Pet Sitter
                        </h2>
                        <div className="flex flex-col gap-4">
                          <label
                            htmlFor="trade_name"
                            className="pb-1 text-[16px] font-medium"
                          >
                            Pet sitter name (Trade Name)*
                          </label>
                          <div className="relative">
                            <Field
                              type="text"
                              id="trade_name"
                              name="trade_name"
                              className={`input border-[#DCDFED] ${
                                touched.trade_name && errors.trade_name
                                  ? "pr-10 border-red-500"
                                  : ""
                              }`}
                            />
                            {touched.trade_name && errors.trade_name && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Image
                                  src={exclamationcircle}
                                  alt="error"
                                  width={13}
                                  height={13}
                                />
                              </span>
                            )}
                          </div>
                          {touched.trade_name && errors.trade_name && (
                            <div className="text-red-500 text-xs">
                              {errors.trade_name}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <label
                              id="pet_types-label"
                              htmlFor="pet_types"
                              className="pb-1 text-[16px] font-medium"
                            >
                              Pet type*
                            </label>
                            <div className="relative">
                              <PetTypeMultiSelect
                                id="pet_types"
                                name="pet_types"
                                value={values.pet_types}
                                onChange={(val) =>
                                  setFieldValue("pet_types", val)
                                }
                                className={
                                  touched.pet_types && errors.pet_types
                                    ? "border-red-500"
                                    : ""
                                }
                              />
                              {touched.pet_types && errors.pet_types && (
                                <span className="absolute right-6 top-1/2 -translate-y-1/2">
                                  <Image
                                    src={exclamationcircle}
                                    alt="error"
                                    width={13}
                                    height={13}
                                  />
                                </span>
                              )}
                            </div>
                            {touched.pet_types && errors.pet_types && (
                              <div className="text-red-500 text-xs">
                                {errors.pet_types}
                              </div>
                            )}
                          </div>
                          <div>
                            <label
                              htmlFor="services"
                              className="pb-1 text-[16px] font-medium"
                            >
                              Services (Describe all of your service for pet
                              sitting)
                            </label>
                            <div className="relative">
                              <Field
                                type="text"
                                id="services"
                                as="textarea"
                                name="services"
                                className={`w-full min-h-[120px] border border-[#DCDFED] rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--primary-orange-color-500)] ${
                                  touched.services && errors.services
                                    ? "pr-10 border-red-500"
                                    : ""
                                }`}
                              />
                              {touched.services && errors.services && (
                                <span className="absolute right-3 top-3">
                                  <Image
                                    src={exclamationcircle}
                                    alt="error"
                                    width={13}
                                    height={13}
                                  />
                                </span>
                              )}
                            </div>
                            {touched.services && errors.services && (
                              <div className="text-red-500 text-xs">
                                {errors.services}
                              </div>
                            )}
                          </div>
                          <div>
                            <label
                              htmlFor="place_description"
                              className="pb-1 text-[16px] font-medium"
                            >
                              My Place (Describe you place)
                            </label>
                            <div className="relative">
                              <Field
                                type="text"
                                id="place_description"
                                as="textarea"
                                name="place_description"
                                className={`w-full min-h-[120px] border border-[#DCDFED] rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--primary-orange-color-500)] ${
                                  touched.place_description &&
                                  errors.place_description
                                    ? "pr-10 border-red-500"
                                    : ""
                                }`}
                              />
                              {touched.place_description &&
                                errors.place_description && (
                                  <span className="absolute right-3 top-3">
                                    <Image
                                      src={exclamationcircle}
                                      alt="error"
                                      width={13}
                                      height={13}
                                    />
                                  </span>
                                )}
                            </div>
                            {touched.place_description &&
                              errors.place_description && (
                                <div className="text-red-500 text-xs">
                                  {errors.place_description}
                                </div>
                              )}
                          </div>
                          <div>
                            <p className="text-[16px] mb-2 font-medium">
                              Image Gallery (Maximum 10 images)
                            </p>
                            <GalleryUpload
                              value={values.gallery}
                              onChange={(files) =>
                                setFieldValue("gallery", files)
                              }
                              error={touched.gallery && errors.gallery}
                            />
                          </div>
                        </div>
                      </section>

                      {/* Address */}
                      <AddressSection />
                    </>
                  )}
                </Form>
              )}
            </Formik>
          </main>
        </div>
      </div>
    </div>
  );
}

const AddressSection = () => {
  const { values, setFieldValue, errors, touched } = useFormikContext();

  useEffect(() => {
    if (values.province && values.district && values.sub_district) {
      const sub = subdistricts.find(
        (s) => String(s.subdistrictCode) === String(values.sub_district)
      );
      if (sub && sub.postalCode) {
        setFieldValue("post_code", sub.postalCode);
      }
    }
  }, [values.province, values.district, values.sub_district, setFieldValue]);

  return (
    <section className="bg-white rounded-2xl px-4 sm:px-6 md:px-10 py-6 sm:py-8 shadow-sm mb-8">
      <h2 className="text-[#AEB1C3] font-semibold text-[18px] sm:text-[20px] mb-4 sm:mb-6">
        Address
      </h2>
      <div className="flex flex-col mb-6">
        <label
          htmlFor="address_detail"
          className="pb-1 text-[16px] font-medium"
        >
          Address Detail*
        </label>
        <div className="relative">
          <Field
            name="address_detail"
            className={`input border-[#DCDFED] ${
              touched.address_detail && errors.address_detail
                ? "pr-10 border-red-500"
                : ""
            }`}
          />
          {touched.address_detail && errors.address_detail && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <Image
                src={exclamationcircle}
                alt="error"
                width={13}
                height={13}
              />
            </span>
          )}
        </div>
        {touched.address_detail && errors.address_detail && (
          <div className="text-red-500 text-xs">{errors.address_detail}</div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Province */}
        <div className="flex flex-col">
          <label
            id="province-label"
            htmlFor="province"
            className="pb-1 text-[16px] font-medium"
          >
            Province*
          </label>
          <div className="relative">
            <ProvinceDropdown
              value={values.province}
              onChange={(value) => {
                setFieldValue("province", value);
                setFieldValue("district", "");
                setFieldValue("sub_district", "");
                setFieldValue("post_code", "");
              }}
              className={`${
                touched.province && errors.province
                  ? "border-red-500"
                  : "border-[#DCDFED]"
              }`}
            />
            {touched.province && errors.province && (
              <span className="absolute right-8 top-1/2 -translate-y-1/2">
                <Image
                  src={exclamationcircle}
                  alt="error"
                  width={13}
                  height={13}
                />
              </span>
            )}
          </div>
          {touched.province && errors.province && (
            <div className="text-red-500 text-xs">{errors.province}</div>
          )}
        </div>
        {/* District */}
        <div className="flex flex-col">
          <label
            id="district-label"
            htmlFor="district"
            className="pb-1 text-[16px] font-medium"
          >
            District*
          </label>
          <div className="relative">
            <DistrictDropdown
              provinceCode={values.province}
              value={values.district}
              onChange={(value) => {
                setFieldValue("district", value);
                setFieldValue("sub_district", "");
                setFieldValue("post_code", "");
              }}
              className={`${
                touched.district && errors.district
                  ? "border-red-500"
                  : "border-[#DCDFED]"
              }`}
            />
            {touched.district && errors.district && (
              <span className="absolute right-8 top-1/2 -translate-y-1/2">
                <Image
                  src={exclamationcircle}
                  alt="error"
                  width={13}
                  height={13}
                />
              </span>
            )}
          </div>
          {touched.district && errors.district && (
            <div className="text-red-500 text-xs">{errors.district}</div>
          )}
        </div>
        {/* Subdistrict */}
        <div className="flex flex-col">
          <label
            id="sub_district-label"
            htmlFor="sub_district"
            className="pb-1 text-[16px] font-medium"
          >
            Subdistrict*
          </label>
          <div className="relative">
            <SubdistrictDropdown
              districtCode={values.district}
              value={values.sub_district}
              onChange={(value) => {
                setFieldValue("sub_district", value);
                setFieldValue("post_code", "");
              }}
              className={`${
                touched.sub_district && errors.sub_district
                  ? "border-red-500"
                  : "border-[#DCDFED]"
              }`}
            />
            {touched.sub_district && errors.sub_district && (
              <span className="absolute right-8 top-1/2 -translate-y-1/2">
                <Image
                  src={exclamationcircle}
                  alt="error"
                  width={13}
                  height={13}
                />
              </span>
            )}
          </div>
          {touched.sub_district && errors.sub_district && (
            <div className="text-red-500 text-xs">{errors.sub_district}</div>
          )}
        </div>
        {/* Post Code */}
        <div className="flex flex-col">
          <label htmlFor="post_code" className="pb-1 text-[16px] font-medium">
            Post Code*
          </label>
          <div className="relative">
            <Field
              name="post_code"
              className={`input border-[#DCDFED] ${
                touched.post_code && errors.post_code
                  ? "pr-10 border-red-500"
                  : ""
              }`}
            />
            {touched.post_code && errors.post_code && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <Image
                  src={exclamationcircle}
                  alt="error"
                  width={13}
                  height={13}
                />
              </span>
            )}
          </div>
          {touched.post_code && errors.post_code && (
            <div className="text-red-500 text-xs">{errors.post_code}</div>
          )}
        </div>
      </div>
      <div className="bg-gray-300 rounded-xl overflow-hidden relative w-full h-[220px] sm:h-[300px] md:h-[400px] mt-6">
        <Image
          src={map}
          alt="Map"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
    </section>
  );
};
