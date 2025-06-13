import { supabase } from "@/utils/supabase";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // ดึง token จาก cookie
    const { token } = req.cookies;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // ตรวจสอบ token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.user_id || decoded.sub;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Invalid user ID" });
    }

    // 1. ดึงข้อมูล pet_sitter จาก user_id
    const { data: sitterData, error: sitterError } = await supabase
      .from("pet_sitter")
      .select("user_id")
      .eq("user_id", userId)
      .single();

    if (sitterError || !sitterData) {
      return res.status(404).json({ message: "Pet sitter not found" });
    }

    // 2. ดึงข้อมูลการจองที่สำเร็จหรืออยู่ระหว่างการให้บริการ
    const { data: bookings, error: bookingsError } = await supabase
      .from("booking")
      .select(
        `
    booking_id, 
    total_price, 
    transaction_no,
    transaction_date, 
    created_at, 
    status,
    owner_id
  `
      )
      .eq("sitter_id", userId)
      .eq("status", "success")
      .order("created_at", { ascending: false });

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return res.status(500).json({ message: "Failed to fetch transactions" });
    }

    // Separately fetch owner names if needed
    const ownerIds = bookings
      .map((booking) => booking.owner_id)
      .filter(Boolean);
    let ownersMap = {};

    if (ownerIds.length > 0) {
      const { data: owners, error: ownersError } = await supabase
        .from("users")
        .select("id, name")
        .in("id", ownerIds);

      if (!ownersError && owners) {
        ownersMap = owners.reduce((map, owner) => {
          map[owner.id] = owner;
          return map;
        }, {});
      }
    }

    // 3. คำนวณยอดรวม
    const totalEarning = bookings.reduce(
      (sum, booking) => sum + (Number(booking.total_price) || 0),
      0
    );

    // 4. ดึงข้อมูลบัญชีธนาคาร
    const { data: bankData, error: bankError } = await supabase
      .from("pet_sitter")
      .select("bank_name, acc_no")
      .eq("user_id", userId) // ใช้ userId แทน sitterId
      .single();

      console.log("Bank data from DB:", bankData);

    let bankInfo = null;
    if (
      !bankError &&
      bankData &&
      bankData.bank_name &&
      bankData.acc_no // Change from account_number to account_no
    ) {
      bankInfo = {
        bankName: bankData.bank_name,
        accountNumber: bankData.acc_no, // Change from account_number to account_no
      };
      console.log("Bank info being returned:", bankInfo);
    }

    // แปลงข้อมูลเพื่อส่งกลับ
    const transactions = bookings.map((booking) => ({
      id: booking.id || booking.booking_id,
      date: booking.transaction_date || "-",
      ownerName: ownersMap[booking.owner_id]?.name || "Unknown",
      transactionNo: booking.transaction_no || "-",
      amount: booking.total_price || 0,
      status: booking.status,
    }));

    return res.status(200).json({
      success: true,
      totalEarning,
      transactions,
      bankInfo,
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
