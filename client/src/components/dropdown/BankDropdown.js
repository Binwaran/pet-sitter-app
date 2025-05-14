"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import BAAC from "/public/assets/bank/BAAC.png";
import BAY from "/public/assets/bank/BAY.png";
import BBL from "/public/assets/bank/BBL.png";
import CIMB from "/public/assets/bank/CIMB.png";
import GSB from "/public/assets/bank/GSB.png";
import KBANK from "/public/assets/bank/KBANK.png";
import KKP from "/public/assets/bank/KKP.png";
import KTB from "/public/assets/bank/KTB.png";
import PromptPay from "/public/assets/bank/PromptPay.png";
import SCB from "/public/assets/bank/SCB.png";
import TrueMoney from "/public/assets/bank/TrueMoney.png";
import TTB from "/public/assets/bank/TTB.png";
import UOB from "/public/assets/bank/UOB.png";

const bankOptions = [
  { name: "Prompt Pay", icon: PromptPay },
  { name: "True Money", icon: TrueMoney },
  { name: "Bangkok Bank", icon: BBL },
  { name: "Kasikorn Bank", icon: KBANK },
  { name: "Siam Commercial Bank", icon: SCB },
  { name: "Krungthai Bank", icon: KTB },
  { name: "Bank of Ayudhya", icon: BAY },
  { name: "TMBThanachart Bank", icon: TTB },
  { name: "Government Savings Bank (GSB)", icon: GSB },
  { name: "Kiatnakin Bank", icon: KKP },
  { name: "United Overseas Bank (UOB)", icon: UOB },
  { name: "CIMB Thai Bank", icon: CIMB },
  {
    name: "Bank for Agriculture and Agricultural Cooperatives (BAAC)",
    icon: BAAC,
  },
];

const BankDropdown = () => {
  const [bank, setBank] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (bank) => {
    setBank(bank);
    setIsOpen(false);
  };

  // ปิด dropdown ถ้าคลิกนอก component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div
        tabIndex={0}
        role="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-3 border border-[#DCDFED] rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary-orange-color-500)]"
      >
        {bank ? (
          <div className="flex items-center gap-2 text-[#344054]">
            <Image src={bank.icon} alt={bank.name} width={20} height={20} />
            {bank.name}
          </div>
        ) : (
          <span className="text-[#7B7E8F]"></span>
        )}
        <span className="text-xs text-[#9AA1B9]">⏷</span>
      </div>

      {isOpen && (
        <ul className="absolute z-10 mt-2 w-full bg-white border border-[#EAECF0] rounded-lg shadow-md max-h-[280px] overflow-auto">
          {bankOptions.map((option, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(option)}
              className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-[#F9FAFB]"
            >
              <Image
                src={option.icon}
                alt={option.name}
                width={20}
                height={20}
              />
              {option.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BankDropdown;
