"use client";
import Sidebar from "@/components/sitters/SidebarSitter";
import Topbar from "@/components/sitters/TopbarSitter";
import { ButtonOrange } from "@/components/buttons/OrangeButtons";
import { useState, useEffect } from "react";
import axios from "axios";
import BookBankUpload from "@/components/payout/BookBankUpload";
import { uploadBookBankImage } from "@/utils/uploadHelpers";
import { useRouter } from "next/navigation";
import BankDropdown from "@/components/dropdown/BankDropdown";
import Modal from "@/components/Modal";
import { Toaster, toast } from "sonner"; // เพิ่ม import

export default function BankAccountPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [bankData, setBankData] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    bookBankImage: null,
  });
  const [uploadError, setUploadError] = useState("");
  const [formErrors, setFormErrors] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    bookBankImage: "",
  });
  // เพิ่มสถานะสำหรับ Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Load existing bank account details (if available)
  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const response = await axios.get("/api/pet-sitters/bank-account");

        if (response.data && response.data.bankDetails) {
          const {
            bank_name,
            account_number,
            account_name,
            book_bank_image_url,
          } = response.data.bankDetails;

          setBankData({
            bankName: bank_name || "",
            accountNumber: account_number || "",
            accountName: account_name || "",
            bookBankImage: book_bank_image_url || null,
          });
        }
      } catch (error) {
        console.error("Failed to fetch bank details:", error);
      }
    };

    fetchBankDetails();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBankData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user inputs data
    setFormErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Handle bank selection from dropdown
  const handleBankSelect = (bank) => {
    setBankData((prev) => ({
      ...prev,
      bankName: bank.name,
    }));

    // Clear error when user selects a bank
    setFormErrors((prev) => ({
      ...prev,
      bankName: "",
    }));
  };

  // Handle book bank image changes
  const handleImageChange = (file) => {
    setBankData((prev) => ({
      ...prev,
      bookBankImage: file,
    }));

    setFormErrors((prev) => ({
      ...prev,
      bookBankImage: "",
    }));
  };

  // Validate form before submission
  const validateForm = () => {
    let isValid = true;
    const errors = {
      bankName: "",
      accountNumber: "",
      accountName: "",
      bookBankImage: "",
    };

    if (!bankData.bankName) {
      errors.bankName = "Please select a bank";
      isValid = false;
    }

    if (!bankData.accountNumber) {
      errors.accountNumber = "Please enter your account number";
      isValid = false;
    } else if (!/^\d+$/.test(bankData.accountNumber)) {
      errors.accountNumber = "Account number must contain only digits";
      isValid = false;
    }

    // Validate account name
    if (!bankData.accountName) {
      errors.accountName = "Please enter your account name";
      isValid = false;
    }

    if (!bankData.bookBankImage) {
      errors.bookBankImage = "Please upload your book bank image";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // แก้ไขฟังก์ชัน handleSubmit ให้แสดง Modal เมื่อ validate ผ่าน
  const handleSubmit = () => {
    if (!validateForm()) return;

    // เปิด Modal ให้ยืนยัน
    setShowConfirmModal(true);
  };

  // เพิ่มฟังก์ชัน confirmSubmit สำหรับดำเนินการเมื่อยืนยัน
  const confirmSubmit = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);
    setUploadError("");

    try {
      // Upload book bank image (if it's a new file)
      let bookBankImageUrl = bankData.bookBankImage;

      if (bankData.bookBankImage instanceof File) {
        bookBankImageUrl = await uploadBookBankImage(bankData.bookBankImage);
      }

      // Save data to database
      await axios.post("/api/pet-sitters/bank-account", {
        bankName: bankData.bankName,
        accountNumber: bankData.accountNumber,
        accountName: bankData.accountName,
        book_bank_image_url: bookBankImageUrl,
      });

      // แสดง toast notification สำเร็จ
      toast.success("Payout information updated successfully!", {
        position: "top-center",
        duration: 3000,
      });

      // ดีเลย์การ redirect เล็กน้อยเพื่อให้ผู้ใช้เห็น toast
      setTimeout(() => {
        // Return to payout page after successful save
        router.push("/pet-sitters/payout");
      }, 1000); // ดีเลย์ 1 วินาทีก่อน redirect
    } catch (error) {
      console.error("Error updating bank account:", error);
      setUploadError("An error occurred while saving. Please try again.");

      // แสดง toast notification ข้อผิดพลาด
      toast.error("Error updating bank account. Please try again.", {
        position: "top-center",
        duration: 5000,
      });

      setIsLoading(false);
    }
  };

  // เพิ่มฟังก์ชัน cancelSubmit สำหรับยกเลิก
  const cancelSubmit = () => {
    setShowConfirmModal(false);
  };

  return (
    <div className="flex flex-col max-h-screen bg-[#F6F6F9] w-full min-w-0">
      {/* เพิ่ม Toaster component */}
      <Toaster richColors closeButton />

      <div className="flex w-full min-w-0">
        <Sidebar className="hidden md:flex w-full" />
        <div className="flex-1 flex flex-col w-full h-full min-w-0 bg-[#F6F6F9]">
          {/* Header container */}
          <div className="fixed top-0 left-0 right-0 z-50 md:left-[240px] flex flex-col">
            <Topbar className="w-full" />
            <div className="md:hidden w-full">
              <Sidebar className="flex flex-row md:hidden bg-white shadow-[4px_4px_24px_0px_#0000000A]" />
            </div>
          </div>
          <main className="flex-1 flex flex-col items-center w-full relative mt-[123px] md:mt-[72px] bg-[#F6F6F9]">
            <div className="w-full px-10 pt-10 pb-20 flex flex-col gap-6">
              <div className="flex flex-row gap-6 items-center justify-between">
                <div className="flex flex-1 flex-row items-center gap-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="cursor-pointer"
                    onClick={() => router.push("/pet-sitters/payout")}
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M15.6339 3.37658C15.1457 2.87447 14.3543 2.87447 13.8661 3.37658L6.36612 11.0909C5.87796 11.593 5.87796 12.407 6.36612 12.9091L13.8661 20.6234C14.3543 21.1255 15.1457 21.1255 15.6339 20.6234C16.122 20.1213 16.122 19.3073 15.6339 18.8051L9.01777 12L15.6339 5.19485C16.122 4.69275 16.122 3.87868 15.6339 3.37658Z"
                      fill="#7B7E8F"
                    />
                  </svg>

                  <h1 className="text-2xl font-bold text-[#2A2E3F] leading-8">
                    Payout Option
                  </h1>
                </div>
                <ButtonOrange
                  id="update"
                  text={isLoading ? "Updating..." : "Update"}
                  width="w-fit"
                  onClick={handleSubmit}
                  disabled={isLoading}
                />
              </div>

              {uploadError && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg">
                  {uploadError}
                </div>
              )}

              <div className="flex flex-col w-full bg-white p-10 gap-15 rounded-2xl">
                {/* Book Bank Image Upload Section */}
                <div className="flex flex-col gap-4 max-w-240">
                  <p className="font-medium leading-[150%]">Book Bank Image*</p>
                  <div className="flex items-center justify-start gap-10 max-w-240">
                    <BookBankUpload
                      value={bankData.bookBankImage}
                      onChange={handleImageChange}
                      error={formErrors.bookBankImage}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-10">
                  <div className="flex flex-col md:flex-row gap-10">
                    {/* Account Number Section */}
                    <div className="flex flex-col gap-1 w-full box-border h-19 md:max-w-125">
                      <p className="font-medium leading-[150%] whitespace-nowrap">
                        Bank Account Number*
                      </p>
                      <input
                        type="text"
                        name="accountNumber"
                        value={bankData.accountNumber}
                        onChange={handleChange}
                        placeholder="Please enter your bank account number"
                        className={`w-full flex flex-row pl-3 pr-4 py-3 gap-2 h-12 border rounded-lg focus:outline-none focus:ring-none ${
                          formErrors.accountNumber
                            ? "border-red-500"
                            : "border-[#DCDFED] focus:border-[var(--primary-orange-color-500)]"
                        }`}
                      />
                      {formErrors.accountNumber && (
                        <p className="text-red-500 text-sm">
                          {formErrors.accountNumber}
                        </p>
                      )}
                    </div>

                    {/* Account Name Section */}
                    <div className="flex flex-col gap-1 w-full box-border h-19 md:max-w-125">
                      <p className="font-medium leading-[150%]">
                        Account Name*
                      </p>
                      <input
                        type="text"
                        name="accountName"
                        value={bankData.accountName}
                        onChange={handleChange}
                        placeholder="Please enter your bank account name"
                        className={`w-full flex flex-row pl-3 pr-4 py-3 gap-2 h-12 border rounded-lg focus:outline-none focus:ring-none ${
                          formErrors.accountName
                            ? "border-red-500"
                            : "border-[#DCDFED] focus:border-[var(--primary-orange-color-500)]"
                        }`}
                      />
                      {formErrors.accountName && (
                        <p className="text-red-500 text-sm">
                          {formErrors.accountName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bank Selection Section - Changed to BankDropdown */}
                  <div className="flex flex-col gap-1 box-border h-19 md:max-w-125">
                    <p className="font-medium leading-[150%]">Bank Name*</p>
                    <div className="w-full">
                      <BankDropdown
                        selectedBank={bankData.bankName}
                        onSelect={handleBankSelect}
                        hasError={!!formErrors.bankName}
                      />
                    </div>
                    {formErrors.bankName && (
                      <p className="text-red-500 text-sm">
                        {formErrors.bankName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <Modal
          open={showConfirmModal}
          title="Payout Confirmation"
          onClose={() => setShowConfirmModal(false)}
          onConfirm={confirmSubmit}
          confirmText="Yes, I'm sure"
          cancelText="Cancel"
          disabled={isLoading}
          maxWidthClass="md:max-w-100"
        >
          <p className="text-[#7B7E8F] font-medium leading-7">
            Are you sure to change your payout?
          </p>
        </Modal>
      )}
    </div>
  );
}
