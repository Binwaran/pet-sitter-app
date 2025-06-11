"use client";

import Sidebar from "@/components/sitters/SidebarSitter";
import Topbar from "@/components/sitters/TopbarSitter";
import Image from "next/image";
import { Formik, Form, useFormikContext } from "formik";
import { useEffect, useState, useMemo, memo, useRef } from "react";
import { profileSchema } from "@/components/form/validationSchema";
import ImageUpload from "@/components/profile/ImageUpload";
import GalleryUpload from "@/components/profile/GalleryUpload";
import exclamationcircle from "/public/assets/profile/exclamation-circle.svg";
import axios from "axios";
import { ButtonOrange } from "@/components/buttons/OrangeButtons";
import { toast, Toaster } from "sonner";
import dynamic from "next/dynamic";
import subdistricts from "@/app/data/subdistricts.json";
import { useAuth } from "@/context/AuthContext"; // เพิ่มการนำเข้า useAuth

// Components
import FormField from "@/components/form/FormField";
import FormTextArea from "@/components/form/FormTextArea";
import {
  ProvinceField,
  DistrictField,
  SubdistrictField,
} from "@/components/form/AddressFields";

// Helper functions
import {
  findProvinceCodeByName,
  findDistrictCodeByName,
  findSubDistrictCodeByName,
} from "@/utils/addressHelpers";
import { uploadFile, uploadMultipleFiles } from "@/utils/uploadHelpers";

// อัพเดต Dynamic Import
export const MapSitterWithNoSSR = dynamic(
  () => import("@/components/profile/MapSitter"),
  {
    ssr: false,
    loading: () => <LoadingSpinner text="กำลังโหลดแผนที่..." />,
  }
);

// Loading spinner component
const LoadingSpinner = memo(({ text = "Loading..." }) => (
  <div className="flex items-center justify-center w-full h-full">
    <div className="text-center">
      <div className="inline-block w-8 h-8 border-4 border-[#FF7C43] border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-2 text-gray-600">{text}</p>
    </div>
  </div>
));

LoadingSpinner.displayName = "LoadingSpinner";

export default function PetSitterProfilePage() {
  const { user, updateUserData, fetchUserData } = useAuth();
  const [initialValues, setInitialValues] = useState({
    full_name: "",
    experience: "",
    phone_number: "",
    email: "",
    introduction: "",
    trade_name: "",
    services: "",
    my_place: "",
    address_detail: "",
    district: "",
    sub_district: "",
    province: "",
    post_code: "",
    profile_image: null,
    gallery: [],
    pet_type: [],
    latitude: null,
    longitude: null,
  });
  const [sitterStatus, setSitterStatus] = useState(null);
  const [adminSuggestion, setAdminSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // เรียกข้อมูลโปรไฟล์
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const response = await axios.get("/api/pet-sitters/update-profile", {
          withCredentials: true,
        });

        if (response.data?.data) {
          const data = response.data.data;

          // อัพเดต initialValues ด้วยข้อมูลที่ได้จาก API
          setInitialValues({
            full_name: data.full_name ?? "",
            experience: data.experience ?? "",
            phone_number: data.phone_number ?? "",
            email: data.email ?? "",
            introduction: data.introduction ?? "",
            trade_name: data.trade_name ?? "",
            services: data.services ?? "",
            my_place: data.my_place ?? "",
            address_detail: data.address_detail ?? "",
            province: data.province
              ? {
                  value:
                    data.province_id || findProvinceCodeByName(data.province),
                  label: data.province,
                }
              : "",
            district: data.district
              ? {
                  value:
                    data.district_id ||
                    findDistrictCodeByName(data.district, data.province_id),
                  label: data.district,
                }
              : "",
            sub_district: data.sub_district
              ? {
                  value:
                    data.sub_district_id ||
                    findSubDistrictCodeByName(
                      data.sub_district,
                      data.district_id
                    ),
                  label: data.sub_district,
                  postalCode: data.post_code,
                }
              : "",
            post_code: data.post_code ?? "",
            // ใช้รูปภาพที่แสดงผล (pending หรือ approved แล้วแต่กรณี)
            profile_image: data.display_profile_image_url ?? null,
            gallery: data.display_gallery_image_url ?? [],
            pet_type: data.pet_type ?? [],
            // เพิ่มข้อมูลสถานะการรออนุมัติของรูปภาพ
            has_pending_profile: data.has_pending_profile ?? false,
            has_pending_gallery: data.has_pending_gallery ?? false,
            latitude: data.lat || null,
            longitude: data.lng || null,
          });

          setSitterStatus(data.status);
          setAdminSuggestion(data.admin_suggestion);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Could not fetch profile data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleSubmit = async (
    values,
    { setSubmitting, errors: formikErrors }
  ) => {
    // Basic validation check
    if (formikErrors && Object.keys(formikErrors).length > 0) {
      toast.error("โปรดตรวจสอบข้อมูลที่กรอกให้ถูกต้อง");
      setSubmitting(false);
      return;
    }

    // Schema validation
    try {
      await profileSchema.validate(values, { abortEarly: false });
    } catch (validationError) {
      toast.error(`พบข้อผิดพลาด: ${validationError.errors.join(", ")}`);
      setSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error("You need to be logged in");
        setIsSubmitting(false);
        return;
      }

      toast.loading("Preparing submission...");

      // Upload files
      let profileImageUrl = values.profile_image;
      let galleryUrls = values.gallery || [];

      // Handle profile image upload
      if (values.profile_image instanceof File) {
        try {
          toast.loading("Uploading profile image...");
          profileImageUrl = await uploadFile(values.profile_image, "profile"); // เพิ่มพารามิเตอร์ "profile"
          toast.dismiss();
          toast.success("Profile image uploaded successfully");
        } catch (error) {
          console.error("Profile image upload failed:", error);
          profileImageUrl =
            typeof values.profile_image === "string"
              ? values.profile_image
              : null;
          toast.dismiss();
          toast.warning(
            "Profile image upload failed, continuing with other data"
          );
        }
      }

      // Handle gallery uploads - ปรับปรุงการจัดการการอัพโหลดแกลเลอรี่
      if (Array.isArray(values.gallery) && values.gallery.length > 0) {
        // แยก File objects และ URLs ที่มีอยู่แล้ว
        const filesToUpload = values.gallery.filter(
          (item) => item instanceof File
        );
        const existingUrls = values.gallery.filter(
          (item) => typeof item === "string"
        );

        galleryUrls = [...existingUrls]; // เริ่มต้นด้วย URLs ที่มีอยู่แล้ว

        if (filesToUpload.length > 0) {
          try {
            toast.loading(
              `Uploading gallery images (0/${filesToUpload.length})...`
            );

            let uploadedCount = 0;

            // อัพโหลดทีละไฟล์และแสดงความคืบหน้า
            for (const file of filesToUpload) {
              try {
                toast.loading(
                  `Uploading image ${uploadedCount + 1}/${
                    filesToUpload.length
                  }...`,
                  { id: "upload-progress" }
                );

                const url = await uploadFile(file);
                if (url) {
                  galleryUrls.push(url);
                  uploadedCount++;
                  toast.success(
                    `Uploaded ${uploadedCount}/${filesToUpload.length} images`,
                    { id: "upload-progress" }
                  );
                }
              } catch (fileError) {
                console.error(`Failed to upload gallery image:`, fileError);
                toast.error(`Failed to upload image: ${file.name}`, {
                  id: "upload-error",
                });
                // รอสักครู่ก่อนดำเนินการต่อ
                await new Promise((r) => setTimeout(r, 1000));
              }
            }

            toast.dismiss();

            if (uploadedCount === filesToUpload.length) {
              toast.success("All gallery images uploaded successfully");
            } else if (uploadedCount > 0) {
              toast.warning(
                `Uploaded ${uploadedCount}/${filesToUpload.length} images`
              );
            } else {
              toast.error("Failed to upload gallery images");
            }
          } catch (error) {
            console.error("Gallery upload error:", error);
            toast.dismiss();
            toast.error("Gallery uploads failed");
          }
        }
      }

      // Create API payload
      const payload = {
        // User ID จะถูกดึงจาก cookie บน server
        full_name: values.full_name,
        email: values.email,
        phone_number: values.phone_number,
        profile_image_url: profileImageUrl,
        experience: values.experience,
        introduction: values.introduction,
        trade_name: values.trade_name,
        services: values.services,
        pet_type: values.pet_type,
        my_place: values.my_place,
        address_detail: values.address_detail,
        province:
          typeof values.province === "object"
            ? values.province.label
            : values.province,
        district:
          typeof values.district === "object"
            ? values.district.label
            : values.district,
        sub_district:
          typeof values.sub_district === "object"
            ? values.sub_district.label
            : values.sub_district,
        post_code: values.post_code,
        gallery_image_url: galleryUrls.filter(
          (url) => url && typeof url === "string"
        ),
        lat: values.latitude ? parseFloat(values.latitude) : null,
        lng: values.longitude ? parseFloat(values.longitude) : null,
      };

      // Submit to API
      toast.loading("Saving your profile...");
      const response = await axios.post(
        "/api/pet-sitters/update-profile",
        payload,
        {
          withCredentials: true,
          headers: {
            "X-Form-Submit": "true",
          },
        }
      );

      toast.dismiss();

      if (response.data.success) {
        toast.success(
          "Profile saved successfully. Your changes and images will be visible after admin approval."
        );
        setSitterStatus("waiting for approval");

        // เพิ่มโค้ดส่วนนี้เพื่ออัพเดท AuthContext
        if (profileImageUrl && typeof profileImageUrl === "string") {
          // อัพเดทข้อมูล user ใน context โดยตรงด้วยรูปใหม่
          updateUserData({
            ...user,
            profile_image_url: profileImageUrl,
          });
          console.log(
            "Updated profile image in user context:",
            profileImageUrl
          );
        } else {
          // ถ้าไม่ได้อัพโหลดรูปใหม่ แต่ต้องการให้แน่ใจว่าข้อมูล user เป็นข้อมูลล่าสุด
          await fetchUserData();
          console.log("Fetched updated user data after profile save");
        }
      } else {
        toast.warning(
          response.data.message || "Operation completed but status unclear"
        );
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setSubmitting(false);
      setIsSubmitting(false);
    }
  };

  // Only log validation errors that actually occur
  const FormikErrorLogger = () => {
    const formik = useFormikContext();
    useEffect(() => {
      // ตรวจสอบว่า formik.errors มีค่าและไม่ใช่ object ว่าง
      if (formik?.errors && Object.keys(formik.errors).length > 0) {
        console.error("Form validation errors:", formik.errors);
      }
    }, [formik?.errors]);
    return null;
  };

  // Memoized status indicator to prevent re-renders
  const StatusIndicator = memo(({ status }) => {
    if (status === "approved") {
      return (
        <span className="text-[16px] text-[#1CCD83] font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#1CCD83]" />
          Approved
        </span>
      );
    } else if (status === "waiting for approval") {
      return (
        <span className="text-[16px] text-[#FA8AC0] font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#FA8AC0]" />
          Waiting for approve
        </span>
      );
    } else if (status === "rejected") {
      return (
        <span className="text-[16px] text-[#EA1010] font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#EA1010]" />
          Rejected
        </span>
      );
    }
    return null;
  });

  StatusIndicator.displayName = "StatusIndicator";

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F9FAFB] relative">
        <div className="flex-1 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] relative">
      <Toaster position="top-center" />
      <div className="flex md:flex-row flex-col min-w-0">
        <Sidebar className="hidden md:flex" />
        <div className="flex-1 flex flex-col">
          {/* Header container */}
          <div className="fixed top-0 left-0 right-0 z-50 md:left-[240px] flex flex-col">
            <Topbar className="w-full" />
            <div className="md:hidden w-full">
              <Sidebar className="flex flex-row md:hidden bg-white border-b border-[#DCDFED]" />
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 flex flex-col items-center w-full relative mt-[123px] md:mt-[72px] bg-[#F6F6F9]">
            <Formik
              initialValues={initialValues}
              enableReinitialize
              validationSchema={profileSchema}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue, errors, touched, submitForm }) => (
                <Form
                  noValidate
                  className="w-full flex flex-col gap-6 px-4 py-6 md:px-10 md:pb-20 md:pt-10"
                >
                  <FormikErrorLogger />

                  {/* Header with status indicator */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center justify-center gap-4">
                      <h1 className="text-[20px] md:text-[24px] font-semibold text-[#22223B]">
                        Pet Sitter Profile
                      </h1>
                      <StatusIndicator status={sitterStatus} />
                    </div>
                    <ButtonOrange
                      type="submit"
                      className="w-full sm:w-auto"
                      text={isSubmitting ? "Submitting..." : "Update"}
                    />
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

                  {/* Basic Information Section */}
                  <BasicInfoSection
                    values={values}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    touched={touched}
                  />

                  {/* Pet Sitter Info Section */}
                  <PetSitterInfoSection
                    values={values}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    touched={touched}
                  />

                  {/* Address Section */}
                  <AddressSection />
                </Form>
              )}
            </Formik>
          </main>
        </div>
      </div>
    </div>
  );
}

// Basic Info Section Component
const BasicInfoSection = memo(({ values, setFieldValue, errors, touched }) => {
  return (
    <section className="bg-white rounded-2xl px-4 sm:px-6 md:px-20 py-6 sm:py-10 flex flex-col gap-6">
      <h2 className="text-[#AEB1C3] font-bold text-[18px] sm:text-[20px]">
        Basic Information
      </h2>
      <div className="flex flex-col gap-6 sm:gap-8">
        {/* Profile Image */}
        <div className="flex flex-col gap-4 items-start">
          <p className="text-[16px] font-medium">Profile Image</p>
          <ImageUpload
            value={values.profile_image}
            onChange={(file) => setFieldValue("profile_image", file)}
            error={touched.profile_image && errors.profile_image}
            requiresApproval={true} // แสดง badge pending approval เสมอเมื่อมีการอัพโหลดใหม่
            isPending={values.has_pending_profile} // บอกว่ารูปนี้กำลังรออนุมัติอยู่ (สำหรับรูปที่มาจาก API)
          />
        </div>

        {/* Form Fields in 2 columns */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 w-full">
          <FormField
            label="Your full name*"
            name="full_name"
            type="text"
            touched={touched}
            errors={errors}
            autoComplete="name"
          />
          <FormField
            label="Experience*"
            name="experience"
            type="dropdown"
            component="ExperienceDropdown"
            touched={touched}
            errors={errors}
            onChange={(value) => setFieldValue("experience", value)}
            value={values.experience}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 w-full">
          <FormField
            label="Phone Number*"
            name="phone_number"
            type="text"
            touched={touched}
            errors={errors}
            autoComplete="tel"
          />
          <FormField
            label="Email*"
            name="email"
            type="text"
            touched={touched}
            errors={errors}
            autoComplete="email"
          />
        </div>

        {/* Introduction */}
        <FormTextArea
          label="Introduction (Describe about yourself as pet sitter)"
          name="introduction"
          touched={touched}
          errors={errors}
        />
      </div>
    </section>
  );
});

BasicInfoSection.displayName = "BasicInfoSection";

// Pet Sitter Info Section Component
const PetSitterInfoSection = memo(
  ({ values, setFieldValue, errors, touched }) => {
    return (
      <section className="bg-white rounded-2xl px-4 sm:px-6 md:px-20 py-6 sm:py-10 flex flex-col gap-6">
        <h2 className="text-[#AEB1C3] font-bold text-[18px] sm:text-[20px]">
          Pet Sitter
        </h2>

        <FormField
          label="Pet sitter name (Trade Name)*"
          name="trade_name"
          type="text"
          touched={touched}
          errors={errors}
        />

        <FormField
          label="Pet type*"
          name="pet_type"
          type="dropdown"
          component="PetTypeMultiSelect"
          touched={touched}
          errors={errors}
          onChange={(val) => setFieldValue("pet_type", val)}
          value={values.pet_type}
        />

        <FormTextArea
          label="Services (Describe all of your service for pet sitting)"
          name="services"
          touched={touched}
          errors={errors}
        />

        <FormTextArea
          label="My Place (Describe you place)"
          name="my_place"
          touched={touched}
          errors={errors}
        />

        <div className="flex flex-col gap-1">
          <p className="text-[16px] font-medium">
            Image Gallery (Maximum 10 images)
          </p>
          <GalleryUpload
            value={values.gallery}
            onChange={(files) => setFieldValue("gallery", files)}
            error={touched.gallery && errors.gallery}
            requiresApproval={true} // แสดง badge pending approval เสมอเมื่อมีการอัพโหลดใหม่
            isPending={values.has_pending_gallery} // บอกว่ามีรูปในแกลเลอรี่ที่กำลังรออนุมัติอยู่
          />
        </div>
      </section>
    );
  }
);

PetSitterInfoSection.displayName = "PetSitterInfoSection";

// Address Section Component
const AddressSection = memo(() => {
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const lastPositionRef = useRef({ lat: null, lng: null });

  // Update postal code when subdistrict changes
  useEffect(() => {
    if (values.sub_district) {
      if (
        typeof values.sub_district === "object" &&
        values.sub_district.postalCode
      ) {
        setFieldValue("post_code", values.sub_district.postalCode);
      } else if (
        typeof values.sub_district === "number" ||
        typeof values.sub_district === "string"
      ) {
        const sub = subdistricts.find(
          (s) => String(s.subdistrictCode) === String(values.sub_district)
        );
        if (sub && sub.postalCode) {
          setFieldValue("post_code", sub.postalCode);
        }
      }
    }
  }, [values.sub_district, setFieldValue]);

  // Determine if we should show the map
  const showMap = useMemo(() => {
    return (
      (values.province?.value || values.province) &&
      (values.district?.value || values.district)
    );
  }, [values.province, values.district]);

  // Generate address details props for map
  const addressDetails = useMemo(
    () => ({
      province:
        typeof values.province === "object"
          ? values.province.label
          : values.province,
      district:
        typeof values.district === "object"
          ? values.district.label
          : values.district,
      subDistrict:
        typeof values.sub_district === "object"
          ? values.sub_district.label
          : values.sub_district,
      postalCode: values.post_code,
      addressDetail: values.address_detail,
      // เพิ่มข้อมูลจาก database ด้วย
      provinceId:
        typeof values.province === "object" ? values.province.value : null,
      districtId:
        typeof values.district === "object" ? values.district.value : null,
      subdistrictId:
        typeof values.sub_district === "object"
          ? values.sub_district.value
          : null,
    }),
    [
      values.province,
      values.district,
      values.sub_district,
      values.post_code,
      values.address_detail,
    ]
  );

  // สร้าง initialPosition สำหรับส่งให้ MapSitter
  const initialPosition = useMemo(() => {
    if (values.latitude && values.longitude) {
      const lat = parseFloat(values.latitude);
      const lng = parseFloat(values.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        return [lat, lng];
      }
    }
    return null;
  }, [values.latitude, values.longitude]);

  return (
    <section className="bg-white flex flex-col rounded-2xl px-4 sm:px-6 md:px-20 py-6 sm:py-10 gap-6">
      <h2 className="text-[#AEB1C3] font-bold text-[18px] sm:text-[20px]">
        Address
      </h2>

      <FormField
        label="Address Detail*"
        name="address_detail"
        type="text"
        touched={touched}
        errors={errors}
        autoComplete="street-address"
      />

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 w-full">
        <ProvinceField
          onChange={(selectedProvince) => {
            console.log("Province change in form state only");
            setFieldValue("province", selectedProvince);
            setFieldValue("district", "");
            setFieldValue("sub_district", "");
            setFieldValue("post_code", "");
          }}
        />

        <DistrictField
          provinceCode={values.province}
          onChange={(selectedDistrict) => {
            setFieldValue("district", selectedDistrict);
            setFieldValue("sub_district", "");
            setFieldValue("post_code", "");
          }}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 w-full">
        <SubdistrictField
          districtCode={values.district}
          onChange={(selectedSubdistrict) => {
            setFieldValue("sub_district", selectedSubdistrict);
            if (selectedSubdistrict.postalCode) {
              setFieldValue("post_code", selectedSubdistrict.postalCode);
            }
          }}
        />

        <FormField
          label="Post Code*"
          name="post_code"
          type="text"
          touched={touched}
          errors={errors}
          autoComplete="postal-code"
        />
      </div>

      <div className="bg-gray-300 z-0 rounded-lg overflow-hidden relative w-full h-[400px]">
        {showMap ? (
          <MapSitterWithNoSSR
            initialPosition={initialPosition}
            addressDetails={addressDetails}
            autoSave={false}
            allowManualPin={true} // เปิดให้ผู้ใช้ปักหมุดเองได้
            onPositionChange={(lat, lng) => {
              if (
                lastPositionRef.current.lat !== lat ||
                lastPositionRef.current.lng !== lng
              ) {
                lastPositionRef.current = { lat, lng };
                setFieldValue("latitude", lat);
                setFieldValue("longitude", lng);
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500">กรุณาเลือกจังหวัดและอำเภอก่อน</p>
          </div>
        )}
      </div>

      {/* เพิ่มช่องแสดงพิกัดปัจจุบัน */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 w-full">
        <div className="text-xs text-gray-500 flex gap-2">
          <span>พิกัดปัจจุบัน:</span>
          {values.latitude && values.longitude ? (
            <span className="font-medium">
              {parseFloat(values.latitude).toFixed(6)},{" "}
              {parseFloat(values.longitude).toFixed(6)}
            </span>
          ) : (
            <span className="italic">ไม่ได้ระบุพิกัด</span>
          )}
        </div>
      </div>
    </section>
  );
});

AddressSection.displayName = "AddressSection";
