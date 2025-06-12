"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/sitters/SidebarSitter";
import Topbar from "@/components/sitters/TopbarSitter";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const Payout = () => {
  // State hooks
  const [loading, setLoading] = useState(true);
  const [totalEarning, setTotalEarning] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [bankAccount, setBankAccount] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  // Add state for sorting
  const [sortConfig, setSortConfig] = useState({
    key: "default",
    direction: "desc",
  });

  // Fetch payout data
  useEffect(() => {
    const fetchPayoutData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        // Fetch Pet Sitter's payout data
        const response = await axios.get("/api/pet-sitters/payout", {
          withCredentials: true,
        });

        console.log("Full API response:", response.data);

        if (response.data) {
          // Set total earning
          setTotalEarning(response.data.totalEarning || 0);

          // Set transactions
          if (Array.isArray(response.data.transactions)) {
            setTransactions(response.data.transactions);
          }

          // Set bank account info
          console.log("Bank info received:", response.data.bankInfo);

          if (response.data.bankInfo) {
            setBankAccount(response.data.bankInfo);
            console.log(
              "Bank account state after setting:",
              response.data.bankInfo
            );
          } else {
            console.log("No bank info in response");
          }
        }
      } catch (error) {
        console.error("Failed to fetch payout data:", error);
        toast.error("Unable to load payment information");
      } finally {
        setLoading(false);
      }
    };

    fetchPayoutData();
  }, [user?.id]);

  // Format currency
  const formatCurrency = (amount) => {
    return (
      Number(amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + " THB"
    );
  };

  // Format date
  const formatDate = (dateString) => {
    // Check if dateString is a valid date string
    if (!dateString || dateString === "-" || dateString === "N/A") {
      return "-";
    }

    const date = new Date(dateString);
    // Check if date is valid
    return !isNaN(date.getTime())
      ? date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";
  };

  // Convert bank name to abbreviation
  const getBankAbbreviation = (bankName) => {
    if (!bankName) return "";

    // Map bank names to abbreviations
    const bankMap = {
      "Prompt Pay": "Prompt Pay",
      "True Money": "True Money",
      "Bangkok Bank": "BBL",
      "Kasikorn Bank": "KBANK",
      "Siam Commercial Bank": "SCB",
      "Krungthai Bank": "KTB",
      "Bank of Ayudhya": "BAY",
      "TMBThanachart Bank": "TTB",
      "Government Savings Bank (GSB)": "GSB",
      "Kiatnakin Bank": "KKP",
      "United Overseas Bank (UOB)": "UOB",
      "CIMB Thai Bank": "CIMB",
      "Bank for Agriculture and Agricultural Cooperatives (BAAC)": "BAAC",
    };

    return bankMap[bankName] || bankName;
  };

  const handleBankAccountClick = () => {
    // Add navigation to edit bank account page or show modal
    router.push("/pet-sitters/payout/bank-account");
    console.log("Edit bank account clicked");
  };

  // Function to handle sorting
  const handleSort = useCallback((key) => {
    setSortConfig((prev) => {
      // If clicking the same column
      if (prev.key === key) {
        // If it's already desc, change to asc
        if (prev.direction === "desc") {
          return { key, direction: "asc" };
        }
        // If it's already asc, change back to default (cancel sorting)
        else {
          return { key: "default", direction: "desc" };
        }
      }
      // If clicking a new column, start with desc
      else {
        return { key, direction: "desc" };
      }
    });
  }, []);

  // Function to display sort icon (↑/↓)
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  // Sort transactions
  const sortedTransactions = [...transactions].sort((a, b) => {
    // If default, don't sort
    if (sortConfig.key === "default") return 0;

    let valueA, valueB;

    // Get values based on the column to sort
    switch (sortConfig.key) {
      case "date":
        // Convert dates to Date objects
        valueA = a.date ? new Date(a.date) : new Date(0);
        valueB = b.date ? new Date(b.date) : new Date(0);

        // Compare dates directly using Date objects
        return sortConfig.direction === "asc"
          ? valueA - valueB // old to new
          : valueB - valueA; // new to old

      case "from":
        valueA = (a.ownerName || a.from || "").toLowerCase();
        valueB = (b.ownerName || b.from || "").toLowerCase();
        break;

      case "transaction_no":
        valueA = a.transaction_no || a.transactionNo || "";
        valueB = b.transaction_no || b.transactionNo || "";
        break;

      case "amount":
        valueA = Number(a.amount || a.total_price || 0);
        valueB = Number(b.amount || b.total_price || 0);
        break;

      default:
        return 0;
    }

    // Sort based on valueA and valueB except for the date case that was already returned
    if (valueA < valueB) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="flex flex-col max-h-screen bg-[#F6F6F9] w-full min-w-0">
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

          {/* Main content */}
          <main className="flex-1 flex flex-col items-center w-full relative mt-[123px] md:mt-[72px] bg-[#F6F6F9]">
            <div className="w-full px-10 pt-10 pb-20 flex flex-col gap-6">
              <h1 className="text-2xl font-bold text-[#2A2E3F] leading-8">
                Payout Option
              </h1>

              {/* Cards */}
              <div className="flex flex-1 h-auto flex-col md:flex-row gap-6 w-full">
                {/* Total Earning Card */}
                <div className="bg-white flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl w-full gap-4">
                  <div className="flex flex-1 flex-row gap-2 items-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M11.7313 6.75C11.6257 6.75 11.5401 6.84402 11.5401 6.96V7.89644H9.44118C9.33559 7.89644 9.25 7.99047 9.25 8.10644L9.25 15.8936C9.25 16.0095 9.33559 16.1036 9.44118 16.1036H11.5401V17.04C11.5401 17.156 11.6257 17.25 11.7313 17.25H12.5406C12.6462 17.25 12.7318 17.156 12.7318 17.04V16.1036H13.2793C13.7245 16.1036 14.137 16.0111 14.5139 15.8233C14.8936 15.6342 15.1984 15.358 15.4179 14.9903C15.6423 14.6204 15.75 14.1969 15.75 13.7213C15.75 13.1857 15.6297 12.7311 15.3706 12.3781C15.1977 12.1426 14.9705 11.9627 14.6956 11.834C14.8649 11.7041 15.0134 11.5457 15.1376 11.3572C15.3575 11.0235 15.4673 10.6343 15.4673 10.1915C15.4673 9.46389 15.2663 8.87856 14.8384 8.4765C14.4167 8.0803 13.8212 7.89644 13.0814 7.89644L12.7318 7.89644V6.96C12.7318 6.84402 12.6462 6.75 12.5406 6.75H11.7313ZM10.5477 11.3291L10.5477 9.05392H11.5401L11.5401 11.3291H10.5477ZM12.7318 11.3291L12.7318 9.05392L12.9188 9.05392C13.4113 9.05392 13.723 9.15936 13.8976 9.32239C14.0632 9.47697 14.1696 9.75558 14.1696 10.215C14.1696 10.6014 14.0658 10.8691 13.8873 11.0436C13.7047 11.2221 13.4214 11.3291 13.0107 11.3291H12.7318ZM10.5477 14.9494V12.4832H11.5401V14.9494H10.5477ZM12.7318 14.9494V12.4832H12.9541C13.5178 12.4832 13.8936 12.592 14.1214 12.7718C14.3269 12.9366 14.4523 13.2254 14.4523 13.6979C14.4523 14.1937 14.3302 14.4923 14.1344 14.6579C13.9168 14.8423 13.5771 14.9494 13.0814 14.9494H12.7318Z"
                        fill="#454754"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z"
                        fill="#454754"
                      />
                    </svg>
                    <p className="font-medium leading-7">Total Earning</p>
                  </div>
                  <p className="font-medium leading-7">
                    {loading ? "Loading..." : formatCurrency(totalEarning)}
                  </p>
                </div>

                {/* Bank Account Card */}
                <div className="bg-white flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl w-full gap-4">
                  <div className="flex flex-1 flex-row gap-2 items-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19 7H18V6C18 5.20435 17.6839 4.44129 17.1213 3.87868C16.5587 3.31607 15.7956 3 15 3L5 3C4.20435 3 3.44129 3.31607 2.87868 3.87868C2.31607 4.44129 2 5.20435 2 6L2 18C2 18.7956 2.31607 19.5587 2.87868 20.1213C3.44129 20.6839 4.20435 21 5 21L19 21C19.7956 21 20.5587 20.6839 21.1213 20.1213C21.6839 19.5587 22 18.7956 22 18L22 10C22 9.20435 21.6839 8.44129 21.1213 7.87868C20.5587 7.31607 19.7956 7 19 7ZM5 5L15 5C15.2652 5 15.5196 5.10536 15.7071 5.29289C15.8946 5.48043 16 5.73478 16 6V7L5 7C4.73478 7 4.48043 6.89464 4.29289 6.70711C4.10536 6.51957 4 6.26522 4 6C4 5.73478 4.10536 5.48043 4.29289 5.29289C4.48043 5.10536 4.73478 5 5 5ZM20 15H19C18.7348 15 18.4804 14.8946 18.2929 14.7071C18.1054 14.5196 18 14.2652 18 14C18 13.7348 18.1054 13.4804 18.2929 13.2929C18.4804 13.1054 18.7348 13 19 13H20V15ZM20 11H19C18.2044 11 17.4413 11.3161 16.8787 11.8787C16.3161 12.4413 16 13.2044 16 14C16 14.7956 16.3161 15.5587 16.8787 16.1213C17.4413 16.6839 18.2044 17 19 17H20L20 18C20 18.2652 19.8946 18.5196 19.7071 18.7071C19.5196 18.8946 19.2652 19 19 19H5C4.73478 19 4.48043 18.8946 4.29289 18.7071C4.10536 18.5196 4 18.2652 4 18L4 8.83C4.32127 8.94302 4.65943 9.00051 5 9L19 9C19.2652 9 19.5196 9.10536 19.7071 9.29289C19.8946 9.48043 20 9.73478 20 10V11Z"
                        fill="#3A3B46"
                      />
                    </svg>
                    <p className="font-medium leading-7">Bank Account</p>
                  </div>
                  <div className="flex flex-row items-center gap-4">
                    {loading ? (
                      <p className="font-medium leading-7">Loading...</p>
                    ) : bankAccount &&
                      bankAccount.bankName &&
                      bankAccount.accountNumber ? (
                      <p className="font-medium leading-7 text-[#FF7037]">
                        {getBankAbbreviation(bankAccount.bankName)} *
                        {bankAccount.accountNumber?.slice(-3)}
                      </p>
                    ) : (
                      <p className="font-medium leading-7 text-[#FF7037]">
                        No account added
                      </p>
                    )}
                    <div
                      onClick={handleBankAccountClick}
                      className="cursor-pointer"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M8.36612 20.6234C8.85427 21.1255 9.64573 21.1255 10.1339 20.6234L17.6339 12.9091C18.122 12.407 18.122 11.593 17.6339 11.0909L10.1339 3.37657C9.64573 2.87447 8.85427 2.87447 8.36612 3.37657C7.87796 3.87868 7.87796 4.69275 8.36612 5.19485L14.9822 12L8.36612 18.8051C7.87796 19.3073 7.87796 20.1213 8.36612 20.6234Z"
                          fill="#AEB1C4"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-2xl overflow-x-auto flex flex-1 h-auto">
                <table className="min-w-[600px] w-full h-full">
                  <thead className="">
                    <tr className="bg-black text-white rounded-t-2xl">
                      <th
                        className="py-3 px-4 text-left rounded-tl-2xl font-medium whitespace-nowrap cursor-pointer hover:text-[#FF7037] transition-colors"
                        onClick={() => handleSort("date")}
                      >
                        Date
                        {getSortIcon("date") && (
                          <span className="ml-1 inline-block">
                            {getSortIcon("date")}
                          </span>
                        )}
                      </th>
                      <th
                        className="py-3 px-4 text-left font-medium cursor-pointer hover:text-[#FF7037] transition-colors"
                        onClick={() => handleSort("from")}
                      >
                        From
                        {getSortIcon("from") && (
                          <span className="ml-1 inline-block">
                            {getSortIcon("from")}
                          </span>
                        )}
                      </th>
                      <th
                        className="py-3 px-4 text-left font-medium cursor-pointer hover:text-[#FF7037] transition-colors"
                        onClick={() => handleSort("transaction_no")}
                      >
                        Transaction No.
                        {getSortIcon("transaction_no") && (
                          <span className="ml-1 inline-block">
                            {getSortIcon("transaction_no")}
                          </span>
                        )}
                      </th>
                      <th
                        className="py-3 px-4 text-right rounded-tr-2xl font-medium cursor-pointer hover:text-[#FF7037] transition-colors"
                        onClick={() => handleSort("amount")}
                      >
                        Amount
                        {getSortIcon("amount") && (
                          <span className="ml-1 inline-block">
                            {getSortIcon("amount")}
                          </span>
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="text-center py-6">
                          <div className="flex justify-center items-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7037]"></div>
                          </div>
                        </td>
                      </tr>
                    ) : sortedTransactions.length > 0 ? (
                      sortedTransactions.map((transaction, index) => (
                        <tr
                          key={transaction.id || index}
                          className="border-b border-[#F0F0F0] last:border-0"
                        >
                          <td className="font-medium leading-7 py-6 px-4 gap-2.5">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="font-medium leading-7 py-6 px-4 gap-2.5">
                            {transaction.ownerName ||
                              transaction.from ||
                              "Unknown"}
                          </td>
                          <td className="font-medium leading-7 py-6 px-4 gap-2.5">
                            {transaction.transaction_no ||
                              transaction.transactionNo ||
                              "-"}
                          </td>
                          <td className="font-medium leading-7 py-6 px-4 gap-2.5 text-[#1CCD83] text-right">
                            {formatCurrency(
                              transaction.amount || transaction.total_price || 0
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center py-6 text-gray-500"
                        >
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Payout;
