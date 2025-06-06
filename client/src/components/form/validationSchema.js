import * as Yup from "yup";

// File validation
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];
const FILE_SIZE = 2 * 1024 * 1024; // 2MB

// ฟังก์ชันสำหรับตรวจสอบประเภทไฟล์ โดยไม่ตรวจสอบ URL
const validateFileType = (value) => {
  // ถ้าไม่มีค่า หรือเป็น string (URL) ให้ผ่านการตรวจสอบ
  if (!value || typeof value === "string") return true;

  // ถ้าเป็น File object ให้ตรวจสอบประเภทไฟล์
  return SUPPORTED_FORMATS.includes(value.type);
};

// ฟังก์ชันสำหรับตรวจสอบขนาดไฟล์ โดยไม่ตรวจสอบ URL
const validateFileSize = (value) => {
  // ถ้าไม่มีค่า หรือเป็น string (URL) ให้ผ่านการตรวจสอบ
  if (!value || typeof value === "string") return true;

  // ถ้าเป็น File object ให้ตรวจสอบขนาดไฟล์
  return value.size <= FILE_SIZE;
};

const createLocationFieldTest = (errorMessage) =>
  Yup.mixed()
    .required(errorMessage)
    .test("is-valid-location", errorMessage, (value) => {
      // กรณีส่งเป็น object (แบบใหม่)
      if (typeof value === "object" && value !== null) {
        return value.value && value.label;
      }
      // กรณีส่งเป็น string (แบบเดิม)
      return typeof value === "string" && value.trim() !== "";
    });

export const profileSchema = Yup.object().shape({
  full_name: Yup.string()
    .min(6, "Full name must be more than 6 characters")
    .max(20, "Full name must be less than 20 characters")
    .required("Full name is required"),
  experience: Yup.string()
    .oneOf(["0-2", "3-5", "5+"], "Please select your experience")
    .required("Experience is required"),
  phone_number: Yup.string()
    .matches(/^0\d{9}$/, "Phone number must start with 0 and be 10 digits")
    .required("Phone number is required"),
  email: Yup.string()
    .email("Invalid email format")
    .matches(/^[\w-.]+@[\w-]+\.[\w-.]+$/, "Email must be a valid email address")
    .required("Email is required"),

  // แก้ไข validation สำหรับ profile_image
  profile_image: Yup.mixed()
    .test(
      "fileType",
      "Only .jpg, .jpeg, .png files are allowed",
      validateFileType
    )
    .test("fileSize", "File size must be less than 2MB", validateFileSize),

  trade_name: Yup.string().required("Trade name is required"),
  pet_type: Yup.array()
    .min(1, "Please select at least one pet type")
    .required("Pet type is required"),

  // แก้ไข validation สำหรับ gallery
  gallery: Yup.array()
    .max(10, "You can upload up to 10 images")
    .of(
      Yup.mixed()
        .test(
          "fileType",
          "Only .jpg, .jpeg, .png files are allowed",
          validateFileType
        )
        .test("fileSize", "File size must be less than 2MB", validateFileSize)
    ),

  address_detail: Yup.string().required("Address detail is required"),
  province: createLocationFieldTest("Province is required"),
  district: createLocationFieldTest("District is required"),
  sub_district: createLocationFieldTest("Sub-district is required"),
  post_code: Yup.string().required("Post code is required"),
});
