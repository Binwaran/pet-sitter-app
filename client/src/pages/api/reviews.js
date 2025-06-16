import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ใช้ Service Role Key สำหรับ API ที่เขียนข้อมูล
);

export async function POST(req) {
  try {
    const { booking_id, sitter_id, reviewer_id, rating, comment } = await req.json();

    if (!booking_id || !sitter_id || !reviewer_id || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          booking_id,
          sitter_id,
          reviewer_id,
          rating,
          comment,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}