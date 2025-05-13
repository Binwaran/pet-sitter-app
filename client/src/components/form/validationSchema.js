import * as Yup from "yup";

// File validation
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];
const FILE_SIZE = 2 * 1024 * 1024; // 2MB

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
  profile_image: Yup.mixed()
    .test(
      "fileType",
      "Only .jpg, .jpeg, .png files are allowed",
      (value) => !value || (value && SUPPORTED_FORMATS.includes(value.type))
    )
    .test(
      "fileSize",
      "File size must be less than 2MB",
      (value) => !value || (value && value.size <= FILE_SIZE)
    ),
  trade_name: Yup.string().required("Trade name is required"),
  pet_types: Yup.array()
    .min(1, "Please select at least one pet type")
    .required("Pet type is required"),
  gallery: Yup.array()
    .max(10, "You can upload up to 10 images")
    .of(
      Yup.mixed()
        .test(
          "fileType",
          "Only .jpg, .jpeg, .png files are allowed",
          (value) => !value || (value && SUPPORTED_FORMATS.includes(value.type))
        )
        .test(
          "fileSize",
          "File size must be less than 2MB",
          (value) => !value || (value && value.size <= FILE_SIZE)
        )
    ),
  address_detail: Yup.string().required("Address detail is required"),
  province: Yup.string().required("Province is required"),
  district: Yup.string().required("District is required"),
  sub_district: Yup.string().required("Sub-district is required"),
  post_code: Yup.string().required("Post code is required"),
});
